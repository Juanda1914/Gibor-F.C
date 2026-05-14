/* ==========================================
   GIBOR F.C. - PANEL ADMIN JAVASCRIPT
   Conexión con Backend y Manipulación del DOM
   ========================================== */

// 1. CONFIGURACIÓN INICIAL
const API_URL = '/api/admin'; // Asegúrate de que tu backend use esta ruta base
const TOKEN = localStorage.getItem('gibor_admin_token');

// Verificar sesión al cargar
if (!TOKEN) {
    // Si no hay token, expulsar al login
    window.location.href = '../admin-login.html';
}

// 2. FUNCIONES DE AYUDA (HELPERS)

// Formatear dinero (COP)
const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
};

// Formatear fecha
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

// Mostrar notificaciones Toast
function showToast(message, type = 'success') {
    // Crear contenedor si no existe
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = type;
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white; padding: 12px 20px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'times'}"></i> ${message}`;
    
    document.getElementById('toast-container').appendChild(toast);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 3. FUNCIONES DE NAVEGACIÓN

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    // Mostrar la seleccionada
    const target = document.getElementById(sectionId);
    if(target) target.style.display = 'block';

    // Actualizar menú activo
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
    if(activeItem) activeItem.classList.add('active');

    // Recargar datos al cambiar de sección
    if(sectionId === 'dashboard') loadStats();
    if(sectionId === 'pedidos') loadOrders();
    if(sectionId === 'usuarios') loadUsers();
}

function logout() {
    if(confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('gibor_admin_token');
        localStorage.removeItem('gibor_admin_logged');
        window.location.href = '../admin-login.html';
    }
}

// 4. FUNCIONES DE API (CONEXIÓN CON BACKEND)

// Fetch genérico con autenticación
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (response.status === 401 || response.status === 403) {
            showToast('Sesión expirada. Inicia sesión de nuevo.', 'error');
            logout();
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error API:', error);
        showToast('Error de conexión con el servidor', 'error');
        return null;
    }
}

// 5. FUNCIONES DE RENDERIZADO (PINTAR DATOS)

// Cargar Estadísticas del Dashboard
async function loadStats() {
    const data = await apiCall('/stats');
    if (!data) return;

    // Actualizar DOM
    const el = (id) => document.getElementById(id);
    if(el('statTotalPedidos')) el('statTotalPedidos').textContent = data.totalPedidos || 0;
    if(el('statPendientes')) el('statPendientes').textContent = data.pendientes || 0;
    if(el('statVentas')) el('statVentas').textContent = formatMoney(data.ventasTotales);
    if(el('statUsuarios')) el('statUsuarios').textContent = data.usuarios || 0;
}

// Cargar y Pintar Pedidos
// Cargar y Pintar Pedidos - VERSIÓN CORREGIDA
async function loadOrders() {
    const container = document.querySelector('.orders-section');
    
    try {
        // Mostrar loading
        if(container) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-gray);"><i class="fas fa-spinner fa-spin"></i> Cargando pedidos...</p>';
        }

        console.log('🔄 Intentando cargar pedidos desde: /api/admin/pedidos');
        console.log('🔑 Token:', TOKEN ? 'Presente' : 'AUSENTE');

        // VERIFICAR QUE EXISTA EL TOKEN
        if (!TOKEN) {
            showToast('No hay sesión activa. Inicia sesión como admin.', 'error');
            setTimeout(() => window.location.href = 'admin-login.html', 2000);
            return;
        }

        const response = await fetch(`${API_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Respuesta del servidor:', response.status);

        // MANEJAR ERRORES HTTP
        if (response.status === 401) {
            showToast('Sesión expirada. Inicia sesión de nuevo.', 'error');
            localStorage.removeItem('gibor_admin_token');
            setTimeout(() => window.location.href = 'admin-login.html', 2000);
            return;
        }

        if (response.status === 403) {
            showToast('No tienes permisos de administrador.', 'error');
            return;
        }

        if (response.status === 404) {
            console.error('❌ ERROR 404: La ruta /api/admin/pedidos no existe en el servidor');
            showToast('Error: Ruta no encontrada en el servidor', 'error');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        console.log('✅ Pedidos recibidos:', orders);

        // VERIFICAR QUE SEA UN ARRAY
        if (!Array.isArray(orders)) {
            console.error('❌ La respuesta no es un array:', orders);
            showToast('Error: Formato de datos inválido', 'error');
            return;
        }

        if (orders.length === 0) {
            if(container) {
                container.innerHTML = `
                    <h2 class="section-title"><i class="fas fa-box-open"></i> Últimos Pedidos</h2>
                    <p style="text-align:center; color:var(--text-gray); padding:40px;">
                        <i class="fas fa-inbox" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                        No hay pedidos registrados aún.
                    </p>
                `;
            }
            return;
        }

        // RENDERIZAR PEDIDOS
        let html = `<h2 class="section-title"><i class="fas fa-box-open"></i> Últimos Pedidos</h2>`;

        orders.forEach(order => {
            // Determinar clase del badge
            let badgeClass = 'badge-pendiente';
            if(order.estado === 'procesando') badgeClass = 'badge-procesando';
            if(order.estado === 'enviado') badgeClass = 'badge-enviado';
            if(order.estado === 'entregado') badgeClass = 'badge-entregado';

            html += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Pedido #${order.id}</div>
                            <div class="order-date">${formatDate(order.fecha_pedido)}</div>
                        </div>
                        <span class="badge ${badgeClass}">${order.estado ? order.estado.toUpperCase() : 'PENDIENTE'}</span>
                    </div>
                    <div class="order-body">
                        <p><strong>Cliente:</strong> ${order.cliente || order.nombre_cliente || 'Desconocido'} (${order.email || '-'})</p>
                        <p><strong>Teléfono:</strong> ${order.telefono || '-'}</p>
                        <p><strong>Dirección:</strong> ${order.direccion || 'N/A'}</p>
                        <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
                        <p><strong>Productos:</strong> ${order.items_count || 1} items</p>
                    </div>
                    <div class="order-footer">
                        <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)" 
                            style="background:#2c2c2c; color:white; border:1px solid var(--border-color); padding:8px 12px; border-radius:6px; cursor:pointer;">
                            <option value="pendiente" ${order.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="procesando" ${order.estado === 'procesando' ? 'selected' : ''}>Procesando</option>
                            <option value="enviado" ${order.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="entregado" ${order.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="cancelado" ${order.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                </div>
            `;
        });

        if(container) {
            container.innerHTML = html;
        }

    } catch (error) {
        console.error('❌ ERROR en loadOrders:', error);
        showToast('Error cargando pedidos: ' + error.message, 'error');
        
        if(container) {
            container.innerHTML = `
                <p style="text-align:center; color:var(--danger); padding:30px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2rem; display:block; margin-bottom:10px;"></i>
                    Error al cargar los pedidos. Revisa la consola para más detalles.
                </p>
            `;
        }
    }
}

// Cargar y Pintar Usuarios
async function loadUsers() {
    const tbody = document.querySelector('#usuariosTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando usuarios...</td></tr>';

    const users = await apiCall('/usuarios');
    if (!users) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay usuarios registrados.</td></tr>';
        return;
    }

    let html = '';
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.telefono || '-'}</td>
                <td>${formatDate(user.fecha_registro)}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="deleteUser(${user.id}, '${user.nombre}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// 6. ACCIONES (CAMBIAR ESTADO / ELIMINAR)

// Cambiar estado de pedido
async function updateOrderStatus(id, newStatus) {
    const res = await apiCall(`/pedidos/${id}/estado`, 'PUT', { estado: newStatus });
    if (res && res.success) {
        showToast('Estado actualizado correctamente', 'success');
        loadStats(); // Actualizar contadores
    } else {
        showToast('Error al actualizar el estado', 'error');
        loadOrders(); // Recargar para revertir cambios visuales si falla
    }
}

// Eliminar usuario
async function deleteUser(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
        const res = await apiCall(`/usuarios/${id}`, 'DELETE');
        if (res && res.success) {
            showToast('Usuario eliminado correctamente', 'success');
            loadUsers();
            loadStats(); // Actualizar contador de usuarios
        } else {
            showToast('Error al eliminar usuario', 'error');
        }
    }
}

// 7. INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadOrders();
    // Cargar usuarios si la sección de usuarios está visible (opcional, mejor cargar al hacer click)
});
// Navegación del Panel
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar la seleccionada
    const target = document.getElementById(sectionId);
    if(target) {
        target.classList.add('active');
    }
    
    // Actualizar menú activo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Buscar el enlace que corresponde a esta sección
    const activeLink = document.querySelector(`.nav-item[href="#${sectionId}"]`);
    if(activeLink) {
        activeLink.classList.add('active');
    }
    
    // Cerrar sidebar en móvil al hacer click
    if(window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Toggle Sidebar Móvil
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Logout Simulado
function logout() {
    if(confirm('¿Estás seguro de cerrar sesión?')) {
        alert('Sesión cerrada (Simulación)');
        window.location.href = '../index.html';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar dashboard por defecto
    showSection('dashboard');
    
    console.log('Panel Admin Gibor F.C. cargado (Versión Frontend)');
});