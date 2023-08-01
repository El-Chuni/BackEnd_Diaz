const addProductButtons = document.querySelectorAll('.add-product');

//Con esto agregamos o actualizamos un producto en el carrito
const addOrUpdateProductInCart = async (cid, pid) => {
  try {
    //Primero verificamos si el producto ya existe en el carrito
    const response = await fetch(`/api/carts/${cid}`, { method: 'GET' });
    if (!response.ok) {
      console.error('Error al obtener el carrito:', response.statusText);
      return;
    }

    const cartData = await response.json();
    const existingProduct = cartData.products.find((product) => product.product === pid);

    if (existingProduct) {
      // Si el producto ya existe en el carrito, actualizamos su cantidad
      const quantity = existingProduct.quantity + 1;
      const updateResponse = await fetch(`/api/carts/put/${cid}/products/${pid}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!updateResponse.ok) {
        console.error('Error al actualizar el producto en el carrito:', updateResponse.statusText);
        return;
      }

      console.log('Producto actualizado en el carrito:', updateResponse.statusText);
      location.reload();
    } else {
      //Si el producto no existe en el carrito, lo agregamos como un producto nuevo
      const addResponse = await fetch(`/api/carts/post/${cid}/product/${pid}`, { method: 'POST' });
      if (!addResponse.ok) {
        console.error('Error al agregar el producto al carrito:', addResponse.statusText);
        return;
      }

      console.log('Producto agregado al carrito:', addResponse.statusText);
      location.reload();
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};

//Crea un carrito y agrega un producto si user.cart es null o undefined
const addProductToNewCart = async (pid) => {
  try {
    const response = await fetch(`/api/carts/post/`, {
      method: 'POST',
      body: JSON.stringify({ products: [{ product: pid }] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      location.reload();
    } else {
      console.error('Error al crear un nuevo carrito y agregar el producto:', response.statusText);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }
};

// Agrega el evento click a los botones de agregar producto
addProductButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pid = button.dataset.pid;
    const user = button.dataset.user;

    if (user.cart) {
      addOrUpdateProductInCart(user.cart, pid);
    } else {
      addProductToNewCart(pid);
    }
  });
});
