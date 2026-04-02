import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ✅ get button FIRST
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function () {

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    // optional validation
    if(email === "" || password === ""){
        alert("Please fill all fields ❌");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

        let user = userCredential.user;

        // store user
        localStorage.setItem("currentUser", user.uid);

        alert("Login Successful ✅");

        window.location.href = "../library/index.html";
    })
    .catch((error) => {
        alert(error.message);
    });

});