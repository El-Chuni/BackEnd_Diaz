const socket = io();

socket.on('connect', () => {
    console.log('Connected to socket server');
});

//Se avisa que se añadió el producto
socket.on('newProduct', product => {
    const productsContainer = document.getElementById('productsView');
    const products = product.products;
    let newProducts = '';
    products.forEach(product => {
        newProducts += `
          <div class="product">
            <h3>${product.title.title}</h3>
            <p>${product.title.description}</p>
            <p>Price: ${product.title.price}</p>
            <p>Thumbnail: ${product.title.thumbnail}</p>
            <p>Code: ${product.title.code}</p>
            <p>Stock: ${product.title.stock}</p>
            <p>ID: ${product.title.id}</p>
            <p>Status: ${product.title.status}</p>
            <p>Category: ${product.title.category}</p>
          </div>
        `;
    });
    productsContainer.innerHTML = newProducts;
});
  
//Se avisa que se eliminó el producto
socket.on('deleteProduct', productId => {
    const productsContainer = document.getElementById('productsView');
    const product = productsContainer.querySelector(`[data-product-id="${productId}"]`);
    if (product) {
      product.remove();
    }
});

socket.emit('views', 'Testing views');