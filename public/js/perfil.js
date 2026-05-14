console.log('✅ perfil.js cargado correctamente');

// Función global para cargar perfil
window.cargarPerfil = async function() {
    console.log('🔄 Cargando perfil...');
    
    try {
        const response = await fetch('/api/perfil');
        console.log('📥 Status:', response.status);
        
        if (response.status === 401) {
            console.log('🔐 No autorizado');
            window.location.href = 'login.html';
            return;
        }
        
        const data = await response.json();
        console.log('📦 Datos:', data);
        
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');
        const form = document.getElementById('perfilForm');
        const loading = document.getElementById('perfilCargando');
        
        if (loading) loading.style.display = 'none';
        if (form) form.style.display = 'block';
        
        if (nombreInput) nombreInput.value = data.usuario.nombre;
        if (emailInput) emailInput.value = data.usuario.email;
        if (telefonoInput) telefonoInput.value = data.usuario.telefono || '';
        
        console.log('✅ Perfil cargado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Guardar cambios
const perfilForm = document.getElementById('perfilForm');
if (perfilForm) {
    console.log('✅ Formulario encontrado');
    
    perfilForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('💾 Guardando cambios...');
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const mensajeDiv = document.getElementById('perfilMensaje');
        
        try {
            const response = await fetch('/api/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, telefono })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (mensajeDiv) {
                    mensajeDiv.textContent = '✅ ' + data.mensaje;
                    mensajeDiv.style.color = 'green';
                }
            } else {
                if (mensajeDiv) {
                    mensajeDiv.textContent = '❌ ' + data.error;
                    mensajeDiv.style.color = 'red';
                }
            }
        } catch (error) {
            if (mensajeDiv) {
                mensajeDiv.textContent = '❌ Error de conexión';
                mensajeDiv.style.color = 'red';
            }
        }
    });
} else {
    console.log('⚠️ Formulario no encontrado');
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo, cargando perfil...');
    window.cargarPerfil();
});
// Después de subir foto exitosamente
if (response.ok) {
    mostrarMensaje('fotoMensaje', '✅ ' + data.mensaje, 'success');
    document.getElementById('fotoPerfil').src = `images/perfiles/${data.foto}?t=${Date.now()}`;
    
    // 👇 AGREGA ESTO: Actualizar menú de navegación
    if (window.verificarSesion) {
        window.verificarSesion();
    }
}