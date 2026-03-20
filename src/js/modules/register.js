// pomodoro-front/src/js/modules/register.js

let isPasswordVisible = false;

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const showPasswordCheckbox = document.getElementById('showPassword');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');
const goLoginBtn = document.getElementById('goLoginBtn');
const msgDiv = document.getElementById('message');

if (passwordInput && showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', () => {
        isPasswordVisible = showPasswordCheckbox.checked;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
    });
}

goLoginBtn.addEventListener('click', () => {
    window.location.href = './login.html';
});

registerSubmitBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
        msgDiv.style.color = 'red';
        msgDiv.innerText = 'Debes completar todos los campos.';
        return;
    }

    try {
        const response = await fetch('../../../pomodoro-back/api/v1/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (result.status === 'success') {
            msgDiv.style.color = 'green';
            msgDiv.innerText = 'Cuenta creada. Redirigiendo al login...';
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1200);
            return;
        }

        msgDiv.style.color = 'red';
        msgDiv.innerText = result.message || 'No se pudo registrar la cuenta.';
    } catch (error) {
        msgDiv.style.color = 'red';
        msgDiv.innerText = 'Error de conexion con el backend.';
        console.error(error);
    }
});
