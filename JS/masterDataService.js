import {
  db,
  collection,
  getDocs,
  query,
  orderBy
} from "./firebase.js";

// function to load faculty

export async function getFaculty() {

  const snapshot = await getDocs(
    query(collection(db, "faculty"), orderBy("code"))
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

}


// function to load subjects

export async function getSubjects() {

  const snapshot = await getDocs(
    query(collection(db, "subjects"), orderBy("shortName"))
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

}