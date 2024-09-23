async function signup(){
    const username = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const response = await axios.post("http://localhost:3000/signup", {
        username: username,
        email:email,
        password: password
    })
    if (response.data.message!=""){
        // Problem
        const element = document.getElementById("errorMessage");
        element.removeAttribute("hidden");
        element.innerText = response.data.message;
    }
    else {
        localStorage.setItem("token", response.data.token);
        window.location.replace(response.data.redirect);
    }
}
function gotologinpage(){
    window.location.href = "http://localhost:3000/login";
}
function gotosignup(){
    window.location.href = "http://localhost:3000/";
}
async function login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const response = await axios.post("http://localhost:3000/signin", {
        email: email,
        password: password
    })
    let message = response.data.message;
    let redirect = response.data.redirect;
    let token = response.data.token;
    if (message==""){
        // Login succesfull
        localStorage.setItem('token',token);
        window.location.replace(redirect);
    }
    else {
        // Some error
        console.log(message)
        const element = document.getElementById("errorMessage");
        element.removeAttribute("hidden");
        element.innerText = message;
    }
}