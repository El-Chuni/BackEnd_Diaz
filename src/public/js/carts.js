const removeProductButtons = document.querySelectorAll('.remove-product');
const checkoutButton = document.querySelector('.checkout-button');

// Función para quitar un producto del carrito
const removeProduct = async (pid, cid) => {
  try {
    const response = await fetch(`/api/carts/delete/${cid}/products/${pid}`, { method: 'DELETE' });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      location.reload(); // Recarga la página después de eliminar el producto
    } else {
      console.error('Error al eliminar el producto del carrito:', response.statusText);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};

// Función para finalizar la compra
const checkout = async (cid) => {
  try {
    const response = await fetch(`/api/carts/${cid}/purchase`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      location.reload(); // Recarga la página después de finalizar la compra
    } else {
      console.error('Error al finalizar la compra:', response.statusText);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};

// Agrega el evento click a los botones de quitar producto
removeProductButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pid = button.dataset.pid;
    const cid = button.dataset.cartId;
    removeProduct(pid, cid);
  });
});

// Agrega el evento click al botón de finalizar compra
checkoutButton.addEventListener('click', () => {
  const cid = checkoutButton.dataset.cartId;
  checkout(cid);
});
