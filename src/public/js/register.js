const form = document.getElementById('registerForm');

form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);

    //Primero mandamos para hacer el registro
    const response = await fetch('/api/user/post/register', {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const responseData = await response.json();
    console.log(responseData);

    if (responseData.status === "success") {
        try {
            //Si lo hace bien, lo mandamos al login.
            window.location.replace("login");
        } catch (error) {
            console.error("Error creating user:", error)
        }
    }
});

