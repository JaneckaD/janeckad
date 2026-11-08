// Sestaví public/flashcards/firebase.js jen s funkcemi Firebase, které stránka /flashcards používá.
// Spuštění: npm i --no-save firebase@12 esbuild && node scripts/flashcards-firebase.mjs
import { build } from 'esbuild';
await build({
  stdin: {
    contents: `export { initializeApp, deleteApp } from 'firebase/app';
export { getAuth, initializeAuth, inMemoryPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential, connectAuthEmulator } from 'firebase/auth';
export { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator, doc, getDoc, getDocFromServer, setDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';`,
    resolveDir: process.cwd(),
  },
  bundle: true, format: 'esm', minify: true, target: 'es2020', legalComments: 'none',
  outfile: 'public/flashcards/firebase.js',
});
