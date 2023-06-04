import nodemailer from 'nodemailer';
import config from '../config/config.js';
import __dirname from '../utils.js';
import { getTicketById } from '../Dao/DB/tickets.service.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.gmailAccount,
        pass: config.gmailAppPassword
    }
});

transporter.verify(function(error, success) {
    if (error) {
          console.log(error);
    } else {
          console.log('Server is ready to take our messages');
    }
  });

const mailOptions = {
    from: "Coder Test " + config.gmailAccount,
    to: config.gmailAccount,
    subject: "Correo de prueba Coderhouse Programacion Backend clase 30.",
    html: "<div><h1>Esto es un Test de envio de correos con Nodemailer!</h1></div>",
    attachments: []
}


/*const mailOptionsWithAttachments = {
    from: "Coder Test " + config.gmailAccount,
    to: config.gmailAccount,
    subject: "Correo de prueba Coderhouse Programacion Backend clase 30.",
    html: `<div>
                <h1>Esto es un Test de envio de correos con Nodemailer!</h1>
                <p>Ahora usando imagenes: </p>
                <img src="cid:meme"/>
            </div>`,
    attachments: [
        {
            filename: 'Meme de Programacion',
            path: __dirname+'/public/images/meme.png',
            cid: 'meme'
        }
    ]
}*/




//Acá es donde se prepara y envía el mail con el ticket.
export const sendTicketByEmail = async (ticketId, email) => {
    const ticket = await getTicketById(ticketId);
  
    const mailWithTicket = {
      from: "Coder Test " + config.gmailAccount,
      to: email,
      subject: `Detalles del ticket ${ticket.code}`,
      html: `
        <div>
          <h1>Detalles del ticket ${ticket.code}</h1>
          <p>Fecha de compra: ${ticket.date}</p>
          <p>Productos:</p>
          <ul>
            ${ticket.products
              .map(
                (product) =>
                  `<li>${product.product.title} - ${product.quantity} x $${product.product.price} = $${product.quantity * product.product.price}</li>`
              )
              .join("")}
          </ul>
          <p>Total: $${ticket.amount}</p>
        </div>
      `,
      attachments: [],
    };
  
    try {
        await transporter.sendMail(mailWithTicket);
        console.log('Ticket sent to', email);
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo enviar el correo electrónico");
    }
};
  

export const sendEmail = (req, res) => {
    try {
        let result = transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({message: "Error", payload: error});
            }
            console.log('Message sent: %s', info.messageId);
            res.send({message: "Success!", payload: info});
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error:  error, message: "No se pudo enviar el email desde:" + config.gmailAccount});
    }
};

export const sendEmailWithAttachments = (req, res) => {
    try {
        let result = transporter.sendMail(mailOptionsWithAttachments, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({message: "Error", payload: error});
            }
            console.log('Message sent: %s', info.messageId);
            res.send({message: "Success!", payload: info});
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error:  error, message: "No se pudo enviar el email desde:" + config.gmailAccount});
    }
    
}

export const sendEmailAccountRecovery = (req, res) => {
    const {email, link} = req.body;
    const mailAccountRecovery = {
        from: "Coder Test " + config.gmailAccount,
        to: email,
        subject: "Correo de prueba Coderhouse Programacion Backend clase 30.",
        html: `<div>
                    <h1>Aquí tiene el link para cambiar su contraseña</h1>
                    <p>no la va a recuperar (pues debería seguir funcionando) pero podrá cambiarla por una que pueda recordar mejor.</p>
                    
                    <a>${link}</a>
                </div>`,
        attachments: []
    }

    try {
        let result = transporter.sendMail(mailAccountRecovery, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({message: "Error", payload: error});
            }
            console.log('Message sent: %s', info.messageId);
            res.send({message: "Success!", payload: info});
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error:  error, message: "No se pudo enviar el email desde:" + config.gmailAccount});
    }
};