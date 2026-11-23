"""Posílání kartiček do aplikace Flashcards (davix.cz/flashcards) z programu na PC.

Klíč najdeš v aplikaci: Můj účet → Import z programu → Vytvořit klíč → Zkopírovat.
Stačí standardní knihovna Pythonu 3.8+, nic se nemusí instalovat.

Použití jako modul:

    from flashcards_api import FlashcardsAPI, Unauthorized, NotFound

    api = FlashcardsAPI("fc_...")            # klíč z aplikace
    api.get_folders()
    # -> [{"id": "abc", "name": "Angličtina"}, {"id": "def", "name": "Angličtina / Maturitní témata"}, ...]
    api.add_cards("def", [{"question": "Czech cuisine – Breakfast?", "answer": "Breakfast (6–8 a.m.) is light…\\nDruhý řádek"}])
    # -> {"added": 1}

Chyby: Unauthorized (špatný nebo zrušený klíč, obdoba HTTP 401), NotFound (složka neexistuje, 404),
ValueError (špatný formát kartiček, 400), FlashcardsError (jiná chyba, třeba bez internetu).

Volitelně jako malé lokální HTTP API (pro programy, které chtějí volat adresu):

    python flashcards_api.py serve            # poslouchá na http://127.0.0.1:8765
    GET  http://127.0.0.1:8765/folders                    (hlavička Authorization: Bearer <klíč>)
    POST http://127.0.0.1:8765/folders/<id>/cards         tělo {"cards": [{"question": "…", "answer": "…"}]}

Rychlá zkouška z příkazové řádky:

    python flashcards_api.py folders <klíč>
"""

import datetime
import json
import os
import secrets
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# Veřejné údaje projektu (jsou i v aplikaci, nejsou tajné; přístup hlídá klíč a pravidla databáze).
WEB_API_KEY = "AIzaSyA3zzb5ZmReIpOK5tq6jfiIC_EF-3IId6A"
PROJECT_ID = "flashcards-663fd"
TOKEN_URL = "https://securetoken.googleapis.com/v1/token"
FIRESTORE_URL = "https://firestore.googleapis.com/v1"

if os.environ.get("FLASHCARDS_EMULATOR"):  # jen pro testování na Firebase emulátoru
    WEB_API_KEY, PROJECT_ID = "demo-key", "demo-flashcards"
    TOKEN_URL = "http://127.0.0.1:9099/securetoken.googleapis.com/v1/token"
    FIRESTORE_URL = "http://127.0.0.1:8080/v1"

DOCS_PATH = "projects/%s/databases/(default)/documents" % PROJECT_ID
DECK_PATH = DOCS_PATH + "/decks/main"
MAX_CARDS = 2000
MAX_TEXT = 20000


class FlashcardsError(Exception):
    pass


class Unauthorized(FlashcardsError):
    pass


class NotFound(FlashcardsError):
    pass


# ---------- převod mezi Pythonem a formátem Firestore REST ----------

class _Timestamp(str):
    """Časová značka z Firestore, aby se při uložení vrátila jako časová značka."""


def _decode(v):
    if "stringValue" in v:
        return v["stringValue"]
    if "integerValue" in v:
        return int(v["integerValue"])
    if "doubleValue" in v:
        return float(v["doubleValue"])
    if "booleanValue" in v:
        return v["booleanValue"]
    if "nullValue" in v:
        return None
    if "timestampValue" in v:
        return _Timestamp(v["timestampValue"])
    if "mapValue" in v:
        return {k: _decode(x) for k, x in v["mapValue"].get("fields", {}).items()}
    if "arrayValue" in v:
        return [_decode(x) for x in v["arrayValue"].get("values", [])]
    raise FlashcardsError("Neznámý typ hodnoty v databázi: %s" % list(v))


def _encode(x):
    if x is None:
        return {"nullValue": None}
    if isinstance(x, _Timestamp):
        return {"timestampValue": str(x)}
    if isinstance(x, bool):
        return {"booleanValue": x}
    if isinstance(x, int):
        return {"integerValue": str(x)}
    if isinstance(x, float):
        return {"doubleValue": x}
    if isinstance(x, str):
        return {"stringValue": x}
    if isinstance(x, dict):
        return {"mapValue": {"fields": {k: _encode(v) for k, v in x.items()}}}
    if isinstance(x, (list, tuple)):
        return {"arrayValue": {"values": [_encode(v) for v in x]}}
    raise TypeError("Nelze uložit %r" % type(x))


def _new_id():
    abc = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(abc) for _ in range(12))


def _walk(folders, path=()):
    for f in folders or []:
        p = path + (str(f.get("name", "?")),)
        yield f, " / ".join(p)
        yield from _walk(f.get("folders"), p)


# ---------- samotné API ----------

class FlashcardsAPI:
    def __init__(self, key, timeout=30):
        key = (key or "").strip()
        if key.lower().startswith("bearer "):
            key = key[7:].strip()
        if key.startswith("fc_"):
            key = key[3:]
        if not key:
            raise Unauthorized("Chybí klíč.")
        self._refresh = key
        self._timeout = timeout
        self._token = None
        self._token_until = 0
        self._uid = ""

    # přihlášení klíčem -> krátkodobý token (obnovuje se sám)
    def _id_token(self):
        if self._token and time.time() < self._token_until:
            return self._token
        body = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": self._refresh}).encode()
        req = urllib.request.Request(TOKEN_URL + "?key=" + WEB_API_KEY, data=body,
                                     headers={"Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as r:
                data = json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (400, 401):
                raise Unauthorized("Klíč je neplatný nebo zrušený.") from None
            if e.code == 403:  # klíč projektu má ve Firebase/Google Cloud omezení jen na weby
                raise FlashcardsError("Google odmítl přihlášení (HTTP 403). Zkontroluj omezení API klíče v Google Cloud.") from None
            raise FlashcardsError("Přihlášení selhalo (HTTP %s)." % e.code) from None
        except urllib.error.URLError as e:
            raise FlashcardsError("Nepodařilo se spojit se serverem: %s" % e.reason) from None
        self._token = data["id_token"]
        self._uid = data.get("user_id", "")
        self._token_until = time.time() + int(data.get("expires_in", 3600)) - 120
        return self._token

    def _call(self, method, url, body=None):
        headers = {"Authorization": "Bearer " + self._id_token()}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as r:
                return r.status, json.load(r)
        except urllib.error.HTTPError as e:
            try:
                err = json.load(e)
            except Exception:
                err = {}
            return e.code, err
        except urllib.error.URLError as e:
            raise FlashcardsError("Nepodařilo se spojit se serverem: %s" % e.reason) from None

    def _load(self):
        code, doc = self._call("GET", "%s/%s" % (FIRESTORE_URL, DECK_PATH))
        if code in (401, 403):
            raise Unauthorized("Klíč nemá přístup (byl zrušený nebo nahrazený novým).")
        if code == 404:
            return {"folders": []}, None
        if code != 200:
            raise FlashcardsError("Načtení složek selhalo (HTTP %s): %s" % (code, doc.get("error", {}).get("message", "")))
        fields = {k: _decode(v) for k, v in doc.get("fields", {}).items()}
        fields.setdefault("folders", [])
        return fields, doc.get("updateTime")

    def get_folders(self):
        """Seznam všech složek i vnořených: [{"id": ..., "name": "Rodič / Podsložka"}]."""
        deck, _ = self._load()
        return [{"id": str(f.get("id", "")), "name": name} for f, name in _walk(deck["folders"])]

    def add_cards(self, folder_id, cards):
        """Přidá kartičky do složky. cards = [{"question": ..., "answer": ...}]. Vrátí {"added": počet}."""
        if not isinstance(cards, (list, tuple)):
            raise ValueError('"cards" musí být seznam.')
        if len(cards) > MAX_CARDS:
            raise ValueError("Najednou jde poslat nejvýš %d kartiček." % MAX_CARDS)
        new = []
        for i, c in enumerate(cards, 1):
            if not isinstance(c, dict):
                raise ValueError("Kartička %d není objekt." % i)
            q, a = c.get("question"), c.get("answer")
            if not isinstance(q, str) or not isinstance(a, str) or not q.strip() or not a.strip():
                raise ValueError('Kartička %d musí mít neprázdné "question" i "answer" (text).' % i)
            if len(q) > MAX_TEXT or len(a) > MAX_TEXT:
                raise ValueError("Kartička %d je moc dlouhá." % i)
            q = q.replace("\r\n", "\n").strip()
            a = a.replace("\r\n", "\n").strip()
            new.append({"id": _new_id(), "q": q, "a": a})
        if not new:
            return {"added": 0}
        for attempt in range(5):
            deck, update_time = self._load()
            target = next((f for f, _ in _walk(deck["folders"]) if str(f.get("id")) == str(folder_id)), None)
            if target is None:
                raise NotFound("Složka %s neexistuje." % folder_id)
            target.setdefault("cards", []).extend(new)
            target.setdefault("folders", [])
            fields = {
                "folders": _encode(deck["folders"]),
                "updated": _encode(datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")),
                "by": _encode(self._uid or "api"),
            }
            # zapíše jen když se dokument mezitím nezměnil (jinak se načte znovu a zkusí to ještě jednou)
            write = {"update": {"name": DECK_PATH, "fields": fields}, "updateMask": {"fieldPaths": list(fields)},
                     "currentDocument": {"updateTime": update_time} if update_time else {"exists": False}}
            code, res = self._call("POST", "%s/%s:commit" % (FIRESTORE_URL, DOCS_PATH), {"writes": [write]})
            if code == 200:
                return {"added": len(new)}
            if code in (401, 403):
                raise Unauthorized("Klíč nemá právo měnit otázky.")
            status = res.get("error", {}).get("status", "")
            if code in (400, 409, 412) and status in ("FAILED_PRECONDITION", "ABORTED", "ALREADY_EXISTS"):
                time.sleep(0.4 * (attempt + 1))  # někdo zrovna uložil změny, zkusíme to znovu
                continue
            raise FlashcardsError("Uložení selhalo (HTTP %s): %s" % (code, res.get("error", {}).get("message", "")))
        raise FlashcardsError("Uložení se nepovedlo, databáze se pořád měnila. Zkus to znovu.")


# ---------- volitelné lokální HTTP API ----------

def serve(host="127.0.0.1", port=8765):
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    class Handler(BaseHTTPRequestHandler):
        def _send(self, code, obj):
            body = json.dumps(obj, ensure_ascii=False).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _api(self):
            auth = self.headers.get("Authorization", "")
            if not auth.lower().startswith("bearer ") or not auth[7:].strip():
                raise Unauthorized("Chybí hlavička Authorization: Bearer <klíč>.")
            return FlashcardsAPI(auth[7:])

        def _run(self, fn):
            try:
                self._send(200, fn())
            except Unauthorized as e:
                self._send(401, {"error": str(e)})
            except NotFound as e:
                self._send(404, {"error": str(e)})
            except ValueError as e:
                self._send(400, {"error": str(e)})
            except FlashcardsError as e:
                self._send(502, {"error": str(e)})

        def do_GET(self):
            if self.path.rstrip("/") == "/folders":
                return self._run(lambda: self._api().get_folders())
            self._send(404, {"error": "Neznámá adresa."})

        def do_POST(self):
            parts = self.path.strip("/").split("/")
            if len(parts) == 3 and parts[0] == "folders" and parts[2] == "cards":
                def go():
                    api = self._api()
                    try:
                        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}")
                    except ValueError:
                        raise ValueError("Tělo požadavku není platný JSON.")
                    if not isinstance(body, dict):
                        raise ValueError('Tělo musí být {"cards": [...]}.')
                    return api.add_cards(urllib.parse.unquote(parts[1]), body.get("cards"))
                return self._run(go)
            self._send(404, {"error": "Neznámá adresa."})

        def log_message(self, fmt, *args):
            sys.stderr.write("[flashcards-api] " + fmt % args + "\n")

    print("Flashcards API běží na http://%s:%d (Ctrl+C ukončí)" % (host, port))
    ThreadingHTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["serve"]:
        serve(port=int(args[1]) if len(args) > 1 else 8765)
    elif args[:1] == ["folders"] and len(args) == 2:
        print(json.dumps(FlashcardsAPI(args[1]).get_folders(), ensure_ascii=False, indent=2))
    else:
        print(__doc__)
