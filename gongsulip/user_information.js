// <!-- Set user informaition variable -->
// user_information.js
let user = JSON.parse(localStorage.getItem("user_info")) || {
    age: 30,
    incomeBracket: 5,
    children: 0,
    region: "서울"
};

function setUser(newUser) {
    user = newUser;
    localStorage.setItem("user_info", JSON.stringify(user));
}

export { user, setUser };