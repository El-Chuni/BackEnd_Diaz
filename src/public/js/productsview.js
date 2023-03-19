const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

//Se envía una señal al socket en app.js
socket.emit('productsview', {});

//Se define la lista de productos
socket.on('productList', (payload) => {
  const products = payload;
  console.log(products);

  if (products && products.length > 0) {
    const productsList = document.getElementById('productsList');

    productsList.innerHTML = '';

    products.forEach((product) => {
      const productDiv = document.createElement('div');

      const title = document.createElement('h3');
      title.innerText = product.title;
      productDiv.appendChild(title);

      const description = document.createElement('p');
      description.innerText = product.description;
      productDiv.appendChild(description);

      const price = document.createElement('p');
      price.innerText = `Precio: ARG ${product.price}`;
      productDiv.appendChild(price);

      const category = document.createElement('p');
      category.innerText = `Categoría: ${product.category}`;
      productDiv.appendChild(category);

      productsList.appendChild(productDiv);
    });

    const pagination = document.getElementById('pagination');

    pagination.innerHTML = '';

    if (payload.hasPrevPage) {
      const prevLink = document.createElement('a');
      prevLink.href = payload.prevLink;
      prevLink.innerText = 'Anterior';
      pagination.appendChild(prevLink);
    }

    if (payload.hasNextPage) {
      const nextLink = document.createElement('a');
      nextLink.href = payload.nextLink;
      nextLink.innerText = 'Siguiente';
      pagination.appendChild(nextLink);
    }
  }
});

