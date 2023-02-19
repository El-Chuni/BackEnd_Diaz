const socket = io();

socket.on('connect', () => {
    console.log('Connected to socket server');
});

socket.on('updateViews', (data) => {
    const productsContainer = document.getElementById('productsView');
    productsContainer.innerHTML = '';

    data.products.forEach((product) => {
        const eachProduct = document.createElement('div');
        eachProduct.className = 'product';
        eachProduct.innerHTML = `
            <h3>${product.title.title}</h3>
            <p>${product.title.description}</p>
            <p>Price: ${product.title.price}</p>
            <p>Thumbnail: ${product.title.thumbnail}</p>
            <p>Code: ${product.title.code}</p>
            <p>Stock: ${product.title.stock}</p>
            <p>ID: ${product.title.id}</p>
            <p>Status: ${product.title.status}</p>
            <p>Category: ${product.title.category}</p>
        `;
        productsContainer.appendChild(eachProduct);
    });
});

socket.emit('views', 'Testing views');