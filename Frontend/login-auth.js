// login-auth.js (frontend actualizado)
async function registerUser() {
  const user = (document.getElementById('regUser').value || '').trim();
  const pass = document.getElementById('regPass').value || '';
  if (!user || !pass) return alert('Completa todos los campos');

  try {
    const r = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || 'Error registro');

    alert('Cuenta creada. Ahora inicia sesión.');
    window.location.href = 'login.html';

  } catch (e) {
    alert('Error de conexión al servidor');
  }
}

async function loginUser() {
  const user = (document.getElementById('loginUser').value || '').trim();
  const pass = document.getElementById('loginPass').value || '';
  if (!user || !pass) return alert('Completa todos los campos');

  try {
    const r = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const j = await r.json();
    if (!r.ok) return alert(j.error || 'Error login');

    // --------------- CORRECCIÓN IMPORTANTE ---------------
    // Guardar token y usuario real
    localStorage.setItem('userId', j.user.id);
    localStorage.setItem('username', j.user.username);
    // -----------------------------------------------------

    window.location.href = 'index.html';

  } catch (e) {
    alert('Error de conexión al servidor');
  }
}

// attach to buttons
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('loginBtn');
  if (lb) lb.addEventListener('click', loginUser);

  const rb = document.getElementById('registerBtn');
  if (rb) rb.addEventListener('click', registerUser);
});
