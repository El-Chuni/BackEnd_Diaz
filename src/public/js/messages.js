const socket = io();
socket.emit("saludo", "Hola, me estoy comunicando con un websocket!");

const input = document.getElementById('textoEntrada');
const log = document.getElementById('log');

input.addEventListener('keyup', async (evt) => {
    if (evt.key === "Enter") {
        const message = input.value;
        const user = document.getElementById('nombreUsuario').value;
        console.log(`Agregando mensaje: ${message} de ${user}`);
        socket.emit('message', JSON.stringify({user, message}));
        input.value = "";
    }
});
  
socket.on('updateMessages', messages => {
  const log = document.getElementById('log');
  log.innerHTML = ''; // Limpiamos la lista de mensajes previos
  messages.forEach(msg => {
    const messageItem = document.createElement('p');
    messageItem.innerText = `${msg.user}: ${msg.message}`;
    log.appendChild(messageItem);
  });
});

socket.on('log',data=>{
  let logs='';
  data.logs.forEach(log=>{
      logs += `${log.socketid} dice: ${log.message}<br/>`
  })
  log.innerHTML=logs;
});
  

