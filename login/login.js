import { auth, db } from "../firebase.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  loginBtn.textContent = "Signing in...";
  loginBtn.disabled = true;

  try {
    let userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    let user = userCredential.user;

    let userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
      alert("User not found");
      return;
    }

    let role = snap.data().role;

    if (role === "admin") {
      window.location.href = "../admin/admin.html";
    } else {
      window.location.href = "../user/user.html";
    }
  } catch (error) {
    alert(error.message);
  } finally {
    loginBtn.textContent = "Sign In";
    loginBtn.disabled = false;
  }
});
