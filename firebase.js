/* ==========================================================================
   Firebase Configuration File
   --------------------------------------------------------------------------
   This file is responsible for:
   1. Connecting the app to Firebase.
   2. Initializing Firestore Database.
   3. Initializing Firebase Authentication.
   4. Exporting everything so other files can use it.
   ========================================================================== */


/* ==========================================================================
   STEP 1 - Import Firebase Core
   --------------------------------------------------------------------------
   initializeApp() creates a connection between your website and your
   Firebase project.
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

/* ==========================================================================
   STEP 2 - Import Firestore Database Functions
   --------------------------------------------------------------------------
   These functions are used throughout your project.
   ========================================================================== */


import {
  getFirestore,
  query,
  orderBy,
  collection,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ==========================================================================
   STEP 3 - Import Firebase Authentication
   --------------------------------------------------------------------------
   These functions allow users to login using Google.
   ========================================================================== */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/* ==========================================================================
   STEP 4 - Firebase Project Configuration
   --------------------------------------------------------------------------
   This information identifies YOUR Firebase project.

   NOTE:
   It is SAFE for this configuration to be public.

   Security comes from Firestore Rules,
   NOT by hiding this object.
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyASg2142gagCSyIC_nSbpBmxzZs9YyAYsk",
  authDomain: "vgec-time-table.firebaseapp.com",
  projectId: "vgec-time-table",
  storageBucket: "vgec-time-table.firebasestorage.app",
  messagingSenderId: "511485724551",
  appId: "1:511485724551:web:d2d08155a8c3918ec97522"
};

/* ==========================================================================
   STEP 5 - Initialize Firebase
   --------------------------------------------------------------------------
   initializeApp() creates ONE Firebase App instance.

   Everything else (Firestore/Auth/etc.)
   will use this app object.

   NEVER call initializeApp() twice.
   ========================================================================== */

const app = initializeApp(firebaseConfig);

/* ==========================================================================
   STEP 6 - Initialize Firestore Database
   --------------------------------------------------------------------------
   Firestore needs the app object.

   Think of it like:

   Firebase App
         │
         ▼
     Firestore Database
   ========================================================================== */

const db = getFirestore(app);

/* ==========================================================================
   STEP 7 - Initialize Firebase Authentication
   --------------------------------------------------------------------------
   This creates the Authentication service
   for the same Firebase project.
   ========================================================================== */


const auth = getAuth(app);

/* ==========================================================================
   STEP 8 - Google Authentication Provider
   --------------------------------------------------------------------------
   Firebase supports many providers.

   Examples:

   Google
   Facebook
   GitHub
   Twitter
   Email/Password

   Here we are using Google Login.
   ========================================================================== */

const provider = new GoogleAuthProvider();

/* ==========================================================================
   STEP 9 - Export Everything
   --------------------------------------------------------------------------
   Any file can now do:

   import { db } from "./firebase.js";

   or

   import { auth } from "./firebase.js";
   ========================================================================== */


export {
  db,
  auth,
  provider,

  signInWithPopup,
  signOut,
  onAuthStateChanged,

  query,
  orderBy,

  collection,

  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,

  onSnapshot,
  serverTimestamp
};