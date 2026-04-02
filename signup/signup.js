// Handle Register click
const registerLink = document.getElementById("registerLink");

if (registerLink) {
    registerLink.addEventListener("click", function () {
        // Optional: you can add animation or log
        console.log("Redirecting to signup page...");
    });
}

// OPTIONAL: Auto redirect if already logged in
if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "login/login.html";
}