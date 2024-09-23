const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    username : String,
    password : String,
    aura : String,
    email : {type : String, unique : true}
})

const TodoSchema = new Schema({
    UserId : ObjectId,
    todo : String,
    done : Boolean, 
})

const UserModel = mongoose.model('users', UserSchema);
const TodoModel = mongoose.model('todos', TodoSchema);

module.exports = {
    UserModel,
    TodoModel
}