const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, setDoc } = require("firebase/firestore");
const fs = require('fs');

const firebaseConfig = {
    projectId: "climbing-spot-mdzmz",
    appId: "1:326192956278:web:ec5bb4567579a437ea3057",
    apiKey: "AIzaSyBFf3BGlFZSESwoeqNkNOPbGj3YdBFzD48",
    authDomain: "climbing-spot-mdzmz.firebaseapp.com",
    storageBucket: "climbing-spot-mdzmz.firebasestorage.app",
    messagingSenderId: "326192956278"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-basantimedicalst-8f8d1d72-35b1-44f7-9d59-728d7c0eb071");

async function push() {
  try {
    const data = JSON.parse(fs.readFileSync('data-db.json', 'utf-8'));
    const docRef = doc(db, "app_state", "main");
    await setDoc(docRef, data);
    console.log("Firestore overwritten with data-db.json successfully.");
  } catch(e) {
    console.error(e);
  }
}

push();
