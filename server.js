const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = "";
const path = require("path")
const zod = require("zod")
const  {UserModel, TodoModel} = require("./db")
const app = express();

// SETUP DATABASE
async function connectDB() {
    await mongoose.connect("");
}
try {
    connectDB();
}
catch(error){
    console.log(error);
}
// MIDDLEWARES:
app.use(express.json());
app.use(express.static('public'))
function jwtToken(ObjectId){
    const token = jwt.sign({
        ObjectId:ObjectId
    }, JWT_SECRET);
    return token;
}
// Auth middle ware
async function authorize(req, res, next){
    let token = req.body.token;
    if (token == undefined){
        token = req.query.token; 
    }
    let decoded_token; 
    try {
        decoded_token = jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        decoded_token = null
    }
    if (decoded_token){
        // VALID REQUEST;
        req.UserId = decoded_token;
        next();
    }
    else{
        // redirect user to sign in page and show alert signin expired!
        res.json({
            message: "Login expired!",
            redirect: "https://localhost:3000/login"
        })
    }
}
// This server HTML to default page that user will be visiting
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname+"/signup.html"));
})
app.get("/login", (req, res)=>{
    res.sendFile(path.join(__dirname+"/login.html"));
})
app.get("/home", (req, res)=>{
    res.sendFile(path.join(__dirname+"/home.html"));
})
// SIGN UP ENDPOINT
app.post("/signup", async function (req, res) {
    // console.log(req.body);
    // ADD ZOD VALIDATION HERE-------------------------------------
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const aura = 0;
    let err = false;
    let newUser;
    try {
        newUser = new UserModel({username: username, email: email, password: password, aura:aura}); 
        await newUser.save();
    }
    catch(error) {
        err = true;
    }
    if (err == false){
        const token = jwtToken(newUser._id);
        res.json({
            message:"",
            token: token,
            redirect : "http://localhost:3000/home",
        })
    }
    else {
        res.json({
            message:"This Email is already being used"
        })
    }
})
// SIGN IN ENDPOINT
app.post("/signin", async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    let token;
    let message;
    let redirect;
    try {
        const user = await UserModel.findOne({email:email, password:password});
        if (user){
            token = jwtToken(user._id);
            message = "";
            redirect = "http://localhost:3000/home";
        }
        else {
            token = "";
            message = "Invalid Credentials";
            redirect = "";
        }
    }
    catch (error) {
        token = "";
        message = "Invalid Input";
        redirect = "";
    }
    res.json({
        token:token,
        message:message,
        redirect,redirect
    })
})
// CREATE : Add a new todo to existing list of todos
app.post("/addTodo", authorize, async (req, res)=>{
    const data = req.body.input;
    const userId = req.UserId.ObjectId;
    const todo = new TodoModel({UserId:userId, todo:data, done:false});
    await todo.save();
    res.json({
        message:"done"
    });
})
// READ : Get all existing todos as a array
app.get("/getAll", authorize, async (req, res)=>{
    const user = req.UserId.ObjectId;
    try {
        const todos = await TodoModel.find({UserId:user});
        const users = await UserModel.find();
        const currentUser = await UserModel.findOne({_id:user},'username aura' );
        const username = currentUser.username;
        const useraura = currentUser.aura;
        res.json({
            username:username,
            useraura:useraura,
            todos:todos,
            users:users
        })
    }
    catch (error){
        res.json({
            message:"Login expired!",
        })
    }
})
app.post("/markDone", authorize, async (req, res) => {
    const id = req.body.todoid
    const value = req.body.value;
    const UserId = req.UserId.ObjectId;
    const aura = req.body.aura;
    await TodoModel.findByIdAndUpdate(id, {done:value});
    await UserModel.findByIdAndUpdate(UserId, {aura:aura});
    res.json({
        message:"done"
    })
})
app.post("/delete", authorize, async (req, res) => {
    const id = req.body.todoid
    const UserId = req.UserId.ObjectId;
    const aura = req.body.aura;
    await TodoModel.findByIdAndDelete(id);
    await UserModel.findByIdAndUpdate(UserId, {aura:aura});
    res.json({
        message:"done"
    })
})
app.post("/update", authorize, async (req, res) => {
    const id = req.body.todoid;
    const data = req.body.todo;
    await TodoModel.findByIdAndUpdate(id, {todo:data});
    res.json({
        message:"done"
    })
})
app.listen(3000, ()=>{
    console.log("Server is UP, guess what else is?");
})