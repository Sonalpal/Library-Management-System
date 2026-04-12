import { auth, db } from "../firebase.js";

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  signupBtn.textContent = "Creating...";
  signupBtn.disabled = true;

  try {
    let userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    let user = userCredential.user;

    // 🔥 Save user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      role: "user",
    });

    alert("Signup successful");
    window.location.href = "../login/login.html";
  } catch (error) {
    alert(error.message);
  } finally {
    signupBtn.textContent = "Sign Up";
    signupBtn.disabled = false;
  }
});
