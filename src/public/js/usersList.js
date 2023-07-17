const changeRoleButtons = document.querySelectorAll('.change-role');
const deleteUserButtons = document.querySelectorAll('.delete-user');

// Función para enviar la solicitud de cambio de rol al endpoint correspondiente
const changeRole = async (uid) => {
  try {
    const response = await fetch(`/api/users/premium/${uid}`, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      location.reload();
    } else {
      console.error('Error al cambiar el rol del usuario:', response.statusText);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};

// Función para a un usuario en especifico
const deleteUser = async (uid) => {
    try {
      const response = await fetch(`/api/users/${uid}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        
        location.reload();
      } else {
        console.error('Error al intentar borrar el usuario:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
};

// Agregar el evento click al botón de ascender/degradar usuario
changeRoleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const uid = button.dataset.uid;
    changeRole(uid);
  });
});

// Agregar el evento click a los botones de borrar usuario (opcional)
deleteUserButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const uid = button.dataset.uid;
    deleteUser(uid);
  });
});