import mongoose from 'mongoose';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
    },
    products: {
        type: Array,
        require: true,
    }
});

export const cartModel = mongoose.model(cartsCollection, cartSchema)