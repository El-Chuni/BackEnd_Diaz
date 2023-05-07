import { ticketModel } from "./models/ticket.js";

const getTickets = async () => ticketModel.find();

const getTicketById = async (tid) => {
  const ticketFound = await ticketModel.findOne({ _id: tid }).populate('products.product');
  return ticketFound;
};

const addTicket = async (body) => ticketModel.create(body);

const updateTicket = async (tid, update) => {
    return ticketModel.findOneAndUpdate(
      { id: tid },
      update,
      { new: true } // devuelve el documento actualizado
    );
};

const replaceTicketContent = async (tid, products) => ticketModel.replaceOne({ id: tid }, { products: products }); 

const updateTicketProductStock = async (tid, pid, stock) => {
  return ticketModel.updateOne(
    { id: tid, "products.id": pid},
    { $set: { "products.$.stock": stock }}
  );
};

const removeFromTicket = async (tid, pid) => {
  ticketModel.update(
    { id: tid },
    { $pull : { products : { id: pid } } })
}

const deleteTicket = async (tid) => {
  try {
      await ticketModel.deleteOne({_id: tid});
  } catch (err) {
      console.log(err);
  }
}

export { getTickets, getTicketById, addTicket, updateTicket, deleteTicket, removeFromTicket, replaceTicketContent, updateTicketProductStock }