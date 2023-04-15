import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    email:{
        type: String,
        unique: true
    },
    age:Number,
    password:String,
    cart: String,
    role:{
        type: String,
        default: "usuario",
        enum: ["usuario", "admin"]
    }
})

const userModel = mongoose.model(collection,schema);

export default userModel;