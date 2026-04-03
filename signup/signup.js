// Handle Register click
import { auth, db } from "../firebase.js";

import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const registerLink = document.getElementById("signupBtn");
