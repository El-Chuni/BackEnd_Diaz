import mongoose from 'mongoose';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        require: true,
    },
    products: {
        type: [{
            id: {
                type: Number,
                unique: true,
                require: true
            },
            stock: {
                type: Number,
                require: true
            }
        }],
        default: []
        require: true,
    }
});

export const cartModel = mongoose.model(cartsCollection, cartSchema)