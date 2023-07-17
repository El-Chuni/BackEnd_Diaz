const addProductButtons = document.querySelectorAll('.add-product');

// Función para actualizar el carrito con el producto que se le agrega.
const addProduct = async (pid, userCartId) => {
  try {
    const response = await fetch(`/api/${userCartId}/product/${pid}`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      location.reload();
    } else {
      console.error('Error al actualizar el carrito:', response.statusText);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};


// Agrega el evento click a los botones de agregar producto
addProductButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pid = button.dataset.pid;
    const userCartId = button.dataset.user;
    addProduct(pid, userCartId);
  });
});
