import mongoose from 'mongoose';

const productsCollection = 'products';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    thumbnail: {
        type: String,
        require: true,
    },
    code: {
        type: String,
        unique: true,
        require: true
    },
    stock: {
        type: Number,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    id: {
        type: Number,
        require: true,
    },
    status: {
        type: Boolean,
        require: true,
    }
});

export const productModel = mongoose.model(productsCollection, productSchema)