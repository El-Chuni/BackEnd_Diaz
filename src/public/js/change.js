import userModel from "../../Dao/DB/models/user.js";
import { createHash } from "../../utils.js";

// Obtén el valor de la cookie de expiración
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

//Se obtiene la fecha de expiración
const expirationDate = new Date(getCookie("expirationDate"));

//Verifica si expiró
if (expirationDate < Date.now()) {
    alert("El enlace ha expirado. Por favor, solicite otro enlace de recuperación de contraseña. Ya lo reenviamos para hacerlo.");
    window.location.replace('/api/user/recoveraccount');
}

//Espera que se cargue la página
document.addEventListener("pageLoaded", () => {
    //Obtiene el formulario y el div postInput
    const form = document.getElementById("changeForm");

    

    //Agrega un evento de escucha para el evento submit del formulario
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        
        //Extraigo el valor de los inputs los inputs
        const newPasswordInput = document.querySelector('input[name="newPassword"]');
        const reallyNewPasswordInput = document.querySelector('input[name="reallyNewPassword"]');
        
        const newPassword = newPasswordInput.value;
        const reallyNewPassword = reallyNewPasswordInput.value;
        const hashedPassword = "{{currentPasswordHash}}";

        // Realiza la comparación adecuada de hashes en el cliente
        if (createHash(newPassword) === hashedPassword) {
            alert("La nueva contraseña no puede ser igual a la contraseña actual.");
            return;
        }
        
        // Comprueba si las contraseñas coinciden
        if (newPassword !== reallyNewPassword) {
            alert("Las contraseñas no coinciden. Por favor, verifique.");
            return;
        }

        // Realiza la actualización de la contraseña
        const userId = "{{id}}"; // Obtiene el ID del usuario desde el handlebars
        userModel.updateOne({_id: userId}, {password: createHash(newPassword)}, (error) => {
            if (error) {
                console.log(error);
                // Maneja el error de actualización de la contraseña
                return;
            }
            // Contraseña actualizada exitosamente
            alert("Contraseña actualizada con éxito.");
            window.location.replace('/');
        });
    });
});
  