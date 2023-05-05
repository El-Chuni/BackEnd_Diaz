import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ticketCollection = 'ticket';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        default: () => new mongoose.Schema.Types.ObjectId().toString()
    },
    date: {
        type: Date,
        default: Date.now
    },
    products: {
        type: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
            //Renombré stock a quantity para evitar conflictos
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        }],
        default: [],
        required: true,
    },
    amount: {
        type: Number,
        default: 0
    },
    purchaser: {
        type: String,
        required: true
    }
});


ticketSchema.plugin(mongoosePaginate);
export const ticketModel = mongoose.model(ticketCollection, ticketSchema)