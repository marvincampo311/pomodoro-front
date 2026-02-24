// Verificar si hay un usuario logueado
const userData = sessionStorage.getItem('user');

if (!userData) {
    // Si no está logueado, lo mandamos de patitas al login
    window.location.href = 'src/pages/login.html';
} else {
    const user = JSON.parse(userData);
    console.log("Sesión activa de:", user.username);
    // Aquí puedes hacer que un <h2> diga "Hola, " + user.username
}