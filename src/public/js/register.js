const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);

    //Primero mandamos para hacer el registro
    fetch('/api/user/post/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => result.json())
      .then(json => {
        console.log(json);
        //Una vez hecho el registro, creamos un carrito para el usuario
        fetch('/api/carts/post', {
            method: 'POST',
            body: JSON.stringify({ products: [] }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(cartResult => cartResult.json())
          .then(cartJson => {
              console.log(cartJson);
              window.location.replace('/');
          })
          .catch(error => {
              console.error('Error creating cart:', error);
          });
    }).catch(error => {
        console.error('Error registering user:', error);
    });
});

