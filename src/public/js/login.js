const form = document.getElementById('loginForm');

form.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value,key)=>obj[key]=value);

    //Llama para ingresar al usuario
    const response = await fetch('/api/user/post/login', {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json"
        }
        
    })

    //Si ingresa, se le redirige al index
    const responseData = await response.json();
    if (responseData.status === "success"){
        window.location.replace("/");
    }
})