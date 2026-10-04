const loginBtn = document.getElementById("loginBtn");
const loginPage = document.getElementById("loginPage");

loginBtn.onclick = function(e) {
    e.preventDefault();
    loginPage.classList.add("show");
};