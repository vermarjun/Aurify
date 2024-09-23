const token = localStorage.getItem('token');

let todos = [];
let username ="";
let useraura = 0;
let index = 0;

// LOGOUT
function logout() {
    localStorage.removeItem('token');
    redirectToLogin();
}

function component(data, position){
    const todo = document.createElement("div");
    todo.setAttribute("class","todo");
    const delete_icon = document.createElement("img"); //Delete
    delete_icon.setAttribute("src","/delete_icon.png");
    delete_icon.setAttribute("class","delete_icon");
    delete_icon.setAttribute("id",position);
    delete_icon.setAttribute("onclick","deletetodo(this.id)");
    const edit_icon = document.createElement("img"); //Create
    edit_icon.setAttribute("src","/edit_icon.png");
    edit_icon.setAttribute("class","edit_icon");
    edit_icon.setAttribute("id",position);
    edit_icon.setAttribute("onclick","edittodo(this.id)");
    const checkbox = document.createElement("input"); //CheckBox
    checkbox.setAttribute("class","checkbox");
    checkbox.setAttribute("type","checkbox");
    checkbox.setAttribute("id",position);
    checkbox.setAttribute("onclick","done(this.id)");
    const span = document.createElement("span");
    span.innerText = data.todo;
    if (data.done == true){
        checkbox.checked = true;
        span.setAttribute("class","checked");
    }
    else {
        checkbox.checked = false;
        span.removeAttribute("class","checked");
    }
    todo.append(checkbox);
    todo.append(edit_icon);
    todo.append(delete_icon);
    todo.append(span);
    return todo;
}

function LeaderBoardRow(user, position){
    const row = document.createElement("div");
    row.setAttribute("class","row");
    const span1 = document.createElement("span");
    span1.innerText = position;
    const span2 = document.createElement("span");
    span2.innerText = user.username;
    const span3 = document.createElement("span");
    span3.innerText = user.aura;
    row.append(span1);
    row.append(span2);
    row.append(span3);
    return row;
}

function redirectToLogin(){
    window.location.href = "http://localhost:3000/login";
}

async function getAll(){
    const response = await axios.get("http://localhost:3000/getAll",{
        params: {
            token : token
        }
    })
    if (response.data.message == 'Login expired!'){
        // console.log("yes");
        logout();
        return null;
    }
    todos = response.data.todos;
    const users = response.data.users;
    username = response.data.username;
    useraura = response.data.useraura;
    return {todos, users, username, useraura};
}

async function render(){
    const {todos, users, username, useraura} = await getAll();
    // Account ka aura aur username set kar raha hu
    document.getElementById("username").innerText = username;
    document.getElementById("useraura").innerText = useraura;
    if (todos != null){
        const alltodos = document.getElementById("alltodos");
        alltodos.innerText = "";
        for (let i = todos.length-1; i >= 0; i--){
            const todo = component(todos[i], i);
            alltodos.append(todo);
        }
    } 
    if (users!=null){
        const rows = document.getElementById("rows");
        rows.innerText = "";
        users.sort((a, b)=>{
            return parseFloat(a.aura) - parseFloat(b.aura);
        });
        let position = 1;
        for (let i = users.length-1; i >= 0; i--){
            if (position==6) break;
            const user = LeaderBoardRow(users[i], position);
            position++;
            rows.append(user);
        }
    }
}

// ADD THE NEW TODO TO EXISTING LIST
async function addtodo(){   
    const inpt = document.getElementById("todoinpt").value;
    if (inpt!=""){
        await axios.post("http://localhost:3000/addTodo", {
            input : inpt,
            token : token
        })
        render();
    }
}

// MARK AS DONE
async function done(i) {
    const element = todos[i];
    const todoId = element._id;
    const value = element.done;
    element.done = !value; 
    if (!value){
        useraura = parseInt(useraura) + 5;
    }
    else {
        useraura = parseInt(useraura) - 5;
    }
    await axios.post("http://localhost:3000/markDone", {
        todoid : todoId,
        token : token,
        value : !value,
        aura : useraura,
    })
    document.getElementById("useraura").innerText = useraura;
    const alltodos = document.getElementById("alltodos");
    alltodos.innerText = "";
    for (let i = todos.length-1; i >= 0; i--){
        const todo = component(todos[i], i);
        alltodos.append(todo);
    }
}

// DELETE
async function deletetodo(i) {
    const element = todos[i];
    const todoId = element._id;
    const value = element.done;
    if (value){
        useraura = parseInt(useraura) - 5;
    }
    await axios.post("http://localhost:3000/delete", {
        todoid : todoId,
        token : token,
        aura : useraura,
    })
    document.getElementById("useraura").innerText = useraura;
    const alltodos = document.getElementById("alltodos");
    alltodos.innerText = "";
    todos.splice(i, 1);
    for (let i = todos.length-1; i >= 0; i--){
        const todo = component(todos[i], i);
        alltodos.append(todo);
    }
}

// EDIT
async function save() {
    const element = todos[index];
    const todoId = element._id;
    const inputField = document.getElementById("todoinpt");
    const savebtn = document.getElementById("createtodobtn");
    const data = inputField.value;
    await axios.post("http://localhost:3000/update", {
        todoid : todoId,
        token : token,
        todo : data,
    })
    const alltodos = document.getElementById("alltodos");
    alltodos.innerText = "";
    todos[index].todo = data;
    for (let i = todos.length-1; i >= 0; i--){
        const todo = component(todos[i], i);
        alltodos.append(todo);
    }
    inputField.value = "";
    savebtn.removeAttribute("onclick");
    savebtn.setAttribute("onclick","addtodo()");
    savebtn.innerHTML = "Create";
    return;
}

function edittodo(i) {
    index = i;
    const element = todos[i];
    let data = element.todo;
    const inputField = document.getElementById("todoinpt");
    const savebtn = document.getElementById("createtodobtn");
    savebtn.removeAttribute('onclick');
    savebtn.setAttribute("onclick","save()");
    inputField.value = data;
    savebtn.innerHTML = "Save";
    return;
}