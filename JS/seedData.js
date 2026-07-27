/**
 * ==========================================
 * Firestore Seed Script
 * ==========================================
 *
 * Purpose:
 * - Add or update Subjects
 * - Add or update Faculty
 *
 * Usage:
 * 1. Uncomment the function(s) you want to run.
 * 2. Run this file once.
 * 3. Verify the data in Firestore.
 * 4. Comment the function(s) again to avoid accidental execution.
 *
 * Notes:
 * - setDoc() DOES NOT create duplicate documents.
 * - Existing document IDs are overwritten.
 * - New IDs are created automatically.
 * - Keep IDs unique.
 */



import {
  db,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "./firebase.js";


// ==========================================
// Subjects Master Data
// Add new subjects here.
// Existing IDs will be updated.
// ==========================================


const SUBJECTS = [

  {
    id: "CN",
    shortName: "CN",
    fullName: "Computer Networks",
    color: "#22c55e"
  },

  {
    id: "PDS",
    shortName: "PDS",
    fullName: "Probability & Data Science",
    color: "#a855f7"
  },

  {
    id: "ADC",
    shortName: "ADC",
    fullName: "Analog & Digital Communication",
    color: "#06b6d4"
  },

  {
    id: "AJP",
    shortName: "AJP",
    fullName: "Advanced Java Programming",
    color: "#eab308"
  },

  {
    id: "SAS",
    shortName: "SAS",
    fullName: "Signals & Systems",
    color: "#f97316"
  },

  {
    id: "MOPEC",
    shortName: "MOPEC",
    fullName: "Microprocessor & Embedded Computing",
    color: "#64748b"
  }

];


// ==========================================
// Faculty Master Data
// Add new faculty here.
// Existing IDs will be updated.
// Example:
// {
//   id: "ABC",
//   code: "ABC",
//   name: "Prof. Example Name"
// }
// ==========================================


const FACULTY = [
  {
    id: "UNF",
    code: "UNF",
    name: "Prof. Urvisha N. Fatak"
  },

  {
    id: "JKN",
    code: "JKN",
    name: "Prof. Jagruti K. Naik"
  },

  {
    id: "ARA",
    code: "ARA",
    name: "Prof. Amit R. Agrawal"
  },

  {
    id: "ZBM",
    code: "ZBM",
    name: "Prof. Zalak B. Modi"
  },

  {
    id: "KBC",
    code: "KBC",
    name: "Prof. Kalpesh B. Chaudhary"
  }
];


// Upload all subjects to Firestore.

async function seedSubjects() {

  for (const subject of SUBJECTS) {

    await setDoc(
      doc(db, "subjects", subject.id),
      {
        ...subject,
        active: true,
        createdAt: serverTimestamp()
      }
    );

  }

  console.log("Subjects Seeded ✅");

}

// Upload all faculty members to Firestore.

async function seedFaculty() {

  for (const teacher of FACULTY) {

    await setDoc(
      doc(db, "faculty", teacher.id),
      {
        ...teacher,
        active: true,
        createdAt: serverTimestamp()
      }
    );

  }

  console.log("Faculty Seeded ✅");

}

async function seedDatabase() {

  // Seed Subjects Collection
  // Uncomment only when adding/updating subjects.
  // await seedSubjects();

  // Seed Faculty Collection
  // Uncomment only when adding/updating faculty.
  // await seedFaculty();

  console.log("Database seeded successfully 🎉");
}

// seedDatabase();