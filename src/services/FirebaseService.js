import moment from "moment";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase.js";

export default class FirebaseService {
  /**
   * Get all documents
   * @param {*} table
   * @returns
   */
  static async all(table) {
    let results = [];

    let querySnapshot = await getDocs(query(collection(db, table)));

    querySnapshot.forEach((doc) => {
      let data = doc.data();
      data.doc_uid = doc.id;
      results.push(data);
    });

    return results;
  }

  /**
   * Select document(s) from firebase
   * @param {*} table
   * @param {*} queries
   * @returns
   */
  static async select(table, queries = []) {
    let results = [];

    let querySnapshot = await getDocs(query(collection(db, table), ...queries));

    querySnapshot.forEach((doc) => {
      let data = doc.data();
      data.doc_uid = doc.id;
      results.push(data);
    });

    return results;
  }

  /**
   * Get a document by uid
   * @param {*} table
   * @param {*} uid
   * @returns
   */
  static async get(table, uid) {
    let docRef = await getDoc(doc(db, table, uid));
    return docRef.data();
  }

  /**
   * Insert document in firebase
   * @param {*} table
   * @param {*} data
   * @returns
   */
  static async insert(table, data) {
    data.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
    data.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
    data.active = true;

    return await addDoc(collection(db, table), data);
  }

  /**
   * Update document in firebase
   * @param {*} table
   * @param {*} uid
   * @param {*} data
   * @returns
   */
  static async update(table, uid, data) {
    data.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    return await updateDoc(doc(db, table, uid), data);
  }
}
