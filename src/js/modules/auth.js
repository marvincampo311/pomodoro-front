// pomodoro-front/src/js/modules/auth.js

document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgDiv = document.getElementById('message');

    try {
        // Subimos niveles: de modules -> js -> src -> front -> raíz para entrar a back
        // La ruta depende de cómo tengas las carpetas, pero esta es la estándar:
        const response = await fetch('../../../pomodoro-back/api/v1/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.status === 'success') {
            msgDiv.style.color = "green";
            msgDiv.innerText = "¡Bienvenido! Redirigiendo...";

            // Guardamos al usuario en la sesión del navegador
            sessionStorage.setItem('user', JSON.stringify(result.user));

            // Redirigimos al index principal (fuera de pages y src)
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        } else {
            msgDiv.style.color = "red";
            msgDiv.innerText = result.message;
        }
    } catch (error) {
        msgDiv.style.color = "red";
        msgDiv.innerText = "Error de conexión con el backend.";
        console.error(error);
    }
});