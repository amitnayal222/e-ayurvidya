import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDujFdiCQI-2fNDST7jRkBXW6ucXwvqa5E",
  authDomain: "ayurvidya-31d79.firebaseapp.com",
  projectId: "ayurvidya-31d79",
  appId: "1:517222423569:web:806c68d0fc796514fea5b0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notes = [
  { pageNumber: 1, title: "Chapter 1: Introduction", content: "Full text of page 1..." },
  { pageNumber: 2, title: "Chapter 2: Key Concepts", content: "Full text of page 2..." },
  { pageNumber: 3, title: "Chapter 3: History", content: "Full text of page 3..." },
  // … add all 10 pages here
];

async function uploadNotes() {
  for (const note of notes) {
    await addDoc(collection(db, "notes"), note);
    console.log(`Uploaded page ${note.pageNumber}`);
  }
}

uploadNotes().then(() => console.log("All notes uploaded!"));
