import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ✅ get button FIRST
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function () {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // optional validation
  if (email === "" || password === "") {
    alert("Please fill all fields ❌");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      alert("Login Successful ✅");
      let user = userCredential.user;

      let userRef = doc(db, "users", user.uid);
      let snap = await getDoc(userRef);

      if (!snap.exists()) {
        alert("User data not found in database");
        return;
      }
      let role = snap.data().role;
      if (role === "admin") {
        window.location.href = "../admin/admin.html";
      } else {
        window.location.href = "../library/index.html";
      }
    })
    .catch((error) => {
      alert(error.message);
    });
});
