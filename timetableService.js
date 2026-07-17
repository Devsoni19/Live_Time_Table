import {
  db,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from "./firebase.js";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
];

class TimetableService {

  async getAllTimetable() {

    const timetable = {};

    for (const day of DAYS) {

      const snapshot = await getDocs(
        query(
          collection(db, "timetable", day, "lectures"),
          orderBy("order")
        )
      );

      timetable[day] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    }

    return timetable;

  }

  listen(callback) {

    const unsubscribers = [];

    DAYS.forEach(day => {

      const unsubscribe = onSnapshot(

        query(
          collection(db, "timetable", day, "lectures"),
          orderBy("order")
        ),

        snapshot => {

          callback(day,
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          );

        }

      );

      unsubscribers.push(unsubscribe);

    });

    return () => {

      unsubscribers.forEach(u => u());

    };

  }

  async addLecture(day, lecture) {

    return await addDoc(

      collection(db, "timetable", day, "lectures"),

      lecture

    );

  }

  async updateLecture(day, lectureId, lecture) {

    await updateDoc(

      doc(db, "timetable", day, "lectures", lectureId),

      lecture

    );

  }

  async deleteLecture(day, lectureId) {

    await deleteDoc(

      doc(db, "timetable", day, "lectures", lectureId)

    );

  }

}

export default new TimetableService();