import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASg2142gagCSyIC_nSbpBmxzZs9YyAYsk",
  authDomain: "vgec-time-table.firebaseapp.com",
  projectId: "vgec-time-table",
  storageBucket: "vgec-time-table.firebasestorage.app",
  messagingSenderId: "511485724551",
  appId: "1:511485724551:web:d2d08155a8c3918ec97522"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
};