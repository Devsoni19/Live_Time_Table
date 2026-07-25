import {
  db,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "./firebase.js";

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

const FACULTY = [

  {
    id: "JKN",
    code: "JKN",
    name: "Jayesh K. N."
  },

  {
    id: "KBC",
    code: "KBC",
    name: "KBC"
  },

  {
    id: "ARA",
    code: "ARA",
    name: "ARA"
  },

  {
    id: "PKP",
    code: "PKP",
    name: "PKP"
  },

  {
    id: "KSK",
    code: "KSK",
    name: "KSK"
  },

  {
    id: "STA",
    code: "STA",
    name: "STA"
  }

];

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

  await seedSubjects();

  await seedFaculty();

  console.log("Database seeded successfully 🎉");

}

seedDatabase();