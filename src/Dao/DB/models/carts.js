import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
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
  });


cartSchema.plugin(mongoosePaginate);
export const cartModel = mongoose.model(cartsCollection, cartSchema)