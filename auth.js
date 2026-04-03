import { auth, db } from "./firebase.js";

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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// // SIGN UP

let signUp = document.getElementById("signupBtn");

if (signUp) {
  signUp.addEventListener("click", () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        let user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
        });
        alert("above redirectiton");
        window.location.href = "../login/login.html";
        alert("SignUp suuccessful");
      })
      .catch((err) => {
        console.log("faild");
        alert(err);
      });
  });
}
// LOGIN
let loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        let user = userCredential.user;
        console.log("saving user:", user.uid);

        // 🔥 SAVE USER ID
        localStorage.setItem("currentUser", user.uid);

        window.location.href = "index.html";
      })
      .catch((err) => {
        document.getElementById("msg").textContent = err.message;
      });
  });
}
