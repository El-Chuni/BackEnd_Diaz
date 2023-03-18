import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        require: true,
        index: true
    },
    products: {
        type: [{
            /*_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                require: true
            },*/
            id: {
                type: String,
                ref: 'products',
                require: true
            },
            stock: {
                type: Number,
                require: true,
                default: 1
            }
        }],
        default: [],
        require: true,
    }
});


cartSchema.plugin(mongoosePaginate);
export const cartModel = mongoose.model(cartsCollection, cartSchema)