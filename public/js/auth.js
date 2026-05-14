// ========================================
// AUTENTICACIÓN - GIBOR F.C
// ========================================

async function verificarSesion() {
    try {
        const response = await fetch('/api/verificar-sesion');
        const data = await response.json();
        
        console.log('📊 Sesión:', data);
        
        const btnLogin = document.getElementById('btnLogin');
        
        if (data.autenticado && btnLogin) {
            btnLogin.style.setProperty('display', 'none', 'important');
            
            const existingPerfil = document.getElementById('btnPerfil');
            
            // Determinar la foto
            let fotoSrc = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.usuario.nombre) + '&background=e30613&color=fff&size=128';
            
            if (data.usuario.foto_perfil && data.usuario.foto_perfil !== 'default.png') {
                fotoSrc = `images/perfiles/${data.usuario.foto_perfil}?t=${Date.now()}`;
                console.log('📷 Usando foto:', fotoSrc);
            } else {
                console.log('🔤 Usando placeholder');
            }
            
            if (!existingPerfil) {
                // Crear nuevo elemento
                const nav = document.querySelector('.nav ul');
                if (nav) {
                    const perfilLi = document.createElement('li');
                    perfilLi.id = 'btnPerfil';
                    
                    perfilLi.innerHTML = `
                        <a href="perfil.html" class="user-menu-link" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: white;">
                            <img src="${fotoSrc}" alt="Foto" class="user-menu-foto" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e30613; background: #333;">
                            <span style="color: white; font-weight: 700;">${data.usuario.nombre}</span>
                        </a>
                    `;
                    nav.appendChild(perfilLi);
                }
            } else {
                // Actualizar foto si ya existe
                const img = existingPerfil.querySelector('.user-menu-foto');
                if (img) {
                    img.src = fotoSrc;
                    console.log('🔄 Foto actualizada en el menú');
                }
            }
        } else if (!data.autenticado && btnLogin) {
            btnLogin.style.setProperty('display', 'block', 'important');
            
            const existingPerfil = document.getElementById('btnPerfil');
            if (existingPerfil) {
                existingPerfil.remove();
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Registro
// Registro de usuario
const registroForm = document.getElementById('registroForm');

if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('registroMessage');
        
        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = '❌ Las contraseñas no coinciden';
            messageDiv.style.display = 'block';
            return;
        }
        
        try {
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // ✅ AQUÍ ESTÁ EL "REGISTRO EXITOSO" QUE BUSCAS 👇
                
                messageDiv.className = 'auth-message success';
                messageDiv.textContent = '✅ ' + data.mensaje;
                messageDiv.style.display = 'block';
                
                // Guardar email para la verificación
                localStorage.setItem('email_verificar', email);
                
                // Redirigir a la página de verificación después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'verificar.html?email=' + encodeURIComponent(email);
                }, 2000);
                
            } else {
                messageDiv.className = 'auth-message error';
                messageDiv.textContent = '❌ ' + data.error;
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = '❌ Error de conexión';
            messageDiv.style.display = 'block';
        }
    });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('loginMessage');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await response.json();

            if (response.ok) {
                messageDiv.className = 'auth-message success';
                messageDiv.textContent = '✅ ¡Login exitoso! Redirigiendo...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                messageDiv.className = 'auth-message error';
                messageDiv.textContent = '❌ ' + loginData.error;
            }
        } catch (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = '❌ Error de conexión';
        }
    });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM listo');
    verificarSesion();
});
