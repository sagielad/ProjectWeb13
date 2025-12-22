
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".login-form");
    const errorMsg = document.getElementById("error-msg");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        errorMsg.style.display = "none";
        errorMsg.textContent = "";

        if (username === "" || password === "") {
            errorMsg.textContent = "אנא מלא שם משתמש וסיסמה";
            errorMsg.style.display = "block";
            return;
        }

        const correctUser = "teacher";
        const correctPass = "1234";
        //check user name and password
        if (username === correctUser && password === correctPass) {
            localStorage.setItem("loggedUser", username);//saving the user in local storage
            window.location.href = "home.html";
        } else {
            errorMsg.textContent = "שם משתמש או סיסמה שגויים";
            errorMsg.style.display = "block";
        }
    });
});
