// auth.js — control de sesión moderno

document.addEventListener('DOMContentLoaded', () => {

  const logout = document.getElementById('logoutBtn');

  if (logout) {
    logout.addEventListener('click', () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.location.href = 'login.html';
    });
  }
});
