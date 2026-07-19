// ===============================
// NGC ADMIN LOGIN
// ===============================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "NGC2026@Admin";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", login);

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        login();
    }
});

function login() {

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const msg = document.getElementById("msg");

    if (username === "" || password === "") {

        msg.innerHTML = "Please enter username and password.";

        return;
    }

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        msg.style.color = "#00ff66";
        msg.innerHTML = "Login Successful...";

        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 800);

    } else {

        msg.style.color = "#ff4d4d";
        msg.innerHTML = "Invalid Username or Password.";

    }

}