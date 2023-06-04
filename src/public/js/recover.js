import { sendEmailAccountRecovery } from "../../controllers/email.controller";
import __dirname from "../../utils.js";


//Espera que se cargue la página
document.addEventListener("pageLoaded", function() {
    //Obtiene el formulario y el div postInput
    const form = document.getElementById("recoverForm");
    const postInputDiv = document.getElementById("postInput");
  
    //Oculta el div postInput porque me da fiaca hacer un CSS
    postInputDiv.style.display = "none";
  
    //Agrega un evento de escucha para el evento submit del formulario
    form.addEventListener("submit", async function(event) {
        event.preventDefault(); // Evita que el formulario se envíe automáticamente
        
        //Se envía el mail no sin antes preparar el destinatario y el link
        const emailInput = document.querySelector('input[name="email"]');
        let email = emailInput.value;
        const user = await userModel.findOne({email: username});
        let link = `${__dirname}/api/user/changepassword/${user._id}`
        sendEmailAccountRecovery(email, link);

        //Se define el tiempo limite:
        let expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1); // Define el tiempo de expiración de 1 hora
        document.cookie = `expirationDate=${expirationDate.toISOString()}; path=/;`;

        //Oculta el div preInput
        form.style.display = "none";
  
        //Muestra el div postInput
        postInputDiv.style.display = "block";
    });
});
  