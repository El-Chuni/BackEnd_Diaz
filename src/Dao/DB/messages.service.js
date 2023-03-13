import { messageModel } from "./models/messages.js";

const getMessages = async () => messageModel.find();

const addMessage = async (user, message) => messageModel.create({user, message});

//const updateMessage = async (pid, update) => messageModel.findOneAndUpdate({id: pid}, update);

//const deleteMessage = async (pid) =>  messageModel.deleteOne({id: pid}, (err) => { if (err) return handleError(err);});

export { getMessages, addMessage }