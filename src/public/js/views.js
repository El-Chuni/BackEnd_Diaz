const socket = io();
const productsContainer = document.getElementById('productsViews');

socket.on('connect', () => {
    console.log('Connected to socket server');
});

// Escuchar el evento 'updateViews' del servidor y actualizar la vista
socket.on('updateViews', ({ products }) => {
  
  let newProductsHTML = '';

  products.forEach((product) => {
    newProductsHTML += `
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

  productsContainer.innerHTML = newProductsHTML;
});


setInterval(() => {
  socket.emit('views', 'Testing views'); 
}, 3000)
