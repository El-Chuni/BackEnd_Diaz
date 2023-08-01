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
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
        default: null,
    },
    role:{
        type: String,
        default: "usuario",
        enum: ["usuario", "admin", "premium"]
    },
    documents: {
        type: [{
            name: String,
            reference: String
        }],
        default: []
    },
    last_connection: {
        type: Date,
        default: Date.now
    }
})

const userModel = mongoose.model(collection,schema);

export default userModel;