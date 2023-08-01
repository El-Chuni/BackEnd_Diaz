import userModel from "../Dao/DB/models/user.js";
import customError from "../controllers/error.controller.js";
import __dirname from "../utils.js";  

//Ingresa el usuario
export const loginUser = async (req, res)=>{
    const user = req.user;
    delete user.password;
    req.session.user= {
        name : `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role
    };
    await userModel.findByIdAndUpdate(user._id, { last_connection: Date.now()});
    const userRole = user.role;
    res.cookie('userRole', userRole, { httpOnly: true });
    res.send({status:"success", payload:req.session.user, message:"¡Primer logueo realizado! :)" });
};

//Muestra los datos de los usuarios del sitio web
export const getUsersList = async (req, res) =>{
    let page = parseInt(req.query.page);
    if(!page) page=1;

    let content = await userModel.paginate({},{page,limit:10,lean:true});
    content.prevLink = content.hasPrevPage?`http://localhost:9090/products?page=${content.prevPage}`:'';
    content.nextLink = content.hasNextPage?`http://localhost:9090/products?page=${content.nextPage}`:'';
    content.isValid= !(page<=0||page>content.totalPages);
    //Se hace una verificación sobre si el usuario que mira es admin o no
    content.isAdmin = (req.session.user.role == "admin") ? true : false;
    
    res.render("usersList", {content});
};

//Borra los usuarios que no se hayan conectado desde hace dos días
export const deleteDatedUsers = async (req, res) =>{
    let timeLimit = Date.now() - (2 * 24 * 60 * 60 * 1000);

    try {
        const expiredUsers = await userModel.find({ last_connection: { $lt: twoDaysAgo } });
      
        // Borrar los usuarios encontrados
        for (const user of expiredUsers) {
          await user.remove();
        }
      
        console.log(`Se han eliminado ${expiredUsers.length} usuarios con última conexión anterior a 2 días.`);
    } catch (error) {
        console.error('Error al eliminar usuarios:', error);
    }
};

//Borra un usuario en especifico
export const deleteAUser = async (req, res) =>{
    const uid = req.params.uid;
    try {
        const user = await userModel.findByIdAndDelete(uid);
      
        console.log(`Se han eliminado al usuario de ID ${uid}.`);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
    }
};

//Sube el archivo (documento) y marca al usuario con el nombre y dirección de lo que se subió
export const updateUserDocuments = async (req, res) => {
    //Este router también usa un valor string de req.body llamado
    //documentType que define que tipo de archivo se sube
    //pero se usa en el middleware de upload.single("document").
    //Se escribe este comentario como advertencia ya que no
    //se usa dicho valor en el router fuera del middleware
    const uid = req.params.uid;
    const file = req.file;
  
    try {
      const user = await userModel.findById(uid);
      if (!user) {
        return customError(404, "The user doesn't exist");
      }
  
      // Verificar si se recibió un archivo
      if (!file) {
        return customError(400, "No file was uploaded");
      }
  
      // Obtener el nombre y la referencia del archivo
      const documentName = req.body.name;
      const reference = path.join(file.destination, file.filename);
  
      // Agregar el documento al usuario
      user.documents.push({ name: documentName, reference });
      await user.save();
  
      res.status(200).send({ message: "Document uploaded to the user." });
    } catch (error) {
      customError(500, error.message);
    }
};

//Cambia el rol de usuario a premium y viceversa
export const updateUserRole = async (req, res) =>{
    let uid = req.params.uid;
    const user = await userModel.findById(uid);
    
    //Verifica si tiene los documentos necesarios
    const requiredDocs = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
    const itHasTheDocs = requiredDocs.every((documentName) => {
        return user.documents.some((document) => document.name === documentName);
    });

    let changeRoleTo = 'usuario';

    if (itHasTheDocs){
        if (user.role == 'usuario'){
            changeRoleTo = 'premium';
        }

        await userModel.findOneAndUpdate({_id: user._id}, {role: changeRoleTo});
        res.status(200).send(`El usuario con ID ${uid} ahora es un ${changeRoleTo}.`);
    } else {
        customError(401, "The user doesn't have the requisites to become a premium");
    }

};

//Visualiza para el cambio de contraseña
export const changePassword = async (req, res) => {
    let id = req.params.id;
    const user = await userModel.findOne({_id: id});


    let first_name = user.first_name;
    res.render("change", {
        first_name,
        currentPasswordHash: user.password,
        id: id
    });
};

//Se acaba la sessión
export const logoutUser = async (req, res) => {
    try {
        const user = req.session.user;
    
        // Destruimos la sesión e informamos cuando se logeó por última vez esta persona
        req.session.destroy();
        await userModel.findByIdAndUpdate(user._id, { last_connection: Date.now() });
    
        // Redireccionamos o enviamos una respuesta, dependiendo de tus necesidades
        res.render("login");
    } catch (error) {
        console.error("Error al cerrar la sesión:", error);
        res.status(500).json({ error: "error_logout", message: "Error al cerrar la sesión" });
    }
};