import { addMessage } from "../../Dao/DB/messages.service";

const socket = io();
socket.emit("message", "Hola, me estoy comunicando con un websocket!");

const input = document.getElementById('textoEntrada');
const log = document.getElementById('log');
const user = document.getElementById('nombreUsuario');

input.addEventListener('keyup', async (evt) => {
    if (evt.key === "Enter") {
        const message = input.value;
        const userName = user.value;
        console.log(`Agregando mensaje: ${message} de ${userName}`);
        await addMessage(userName, message);
        input.value = "";
    }
});


  
socket.on('updateMessages', messages => {
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = ''; // Limpiamos la lista de mensajes previos
    messages.forEach(msg => {
      const messageItem = document.createElement('li');
      messageItem.textContent = `${msg.user} dice: ${msg.message}`;
      messageList.appendChild(messageItem);
    });
  });
  

fetch('/api/chat')
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  socket.emit('views', '');
})
.catch((error) => {
  console.error('Error:', error);
});