import {
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy
} from "./firebase.js";

const missingLectures = {
  Monday: {
    subject: "SAS",
    faculty: "ARA",
    start: "14:15",
    end: "15:15",
    type: "Lecture",
    order: 4
  },

  Tuesday: {
    subject: "AJP",
    faculty: "ZBM",
    start: "14:15",
    end: "15:15",
    type: "Lecture",
    order: 4
  },

  Wednesday: {
    subject: "CN",
    faculty: "JKN",
    start: "14:15",
    end: "15:15",
    type: "Lecture",
    order: 4
  },

  Thursday: {
    subject: "SAS",
    faculty: "ARA",
    start: "14:15",
    end: "15:15",
    type: "Lecture",
    order: 4
  }
};

async function fixTimetable() {

  for (const day of Object.keys(missingLectures)) {

    console.log(`Fixing ${day}...`);

    const snapshot = await getDocs(
      query(
        collection(db, "timetable", day, "lectures"),
        orderBy("order")
      )
    );

    let alreadyExists = false;

    // Shift lectures after order 4
    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      if (
        data.start === "14:15" &&
        data.end === "15:15"
      ) {
        alreadyExists = true;
      }

      if (data.order >= 4) {
        await updateDoc(docSnap.ref, {
          order: data.order + 1
        });
      }
    }

    if (!alreadyExists) {
      await addDoc(
        collection(db, "timetable", day, "lectures"),
        missingLectures[day]
      );

      console.log(`Added missing lecture to ${day}`);
    } else {
      console.log(`${day} already fixed.`);
    }

  }

  console.log("✅ Timetable fixed successfully!");
}

fixTimetable();