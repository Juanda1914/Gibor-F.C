console.log('🛒 carrito.js cargado - Modo Híbrido');

let carrito = JSON.parse(localStorage.getItem('carritoGibor')) || [];

// Número de WhatsApp del negocio
const WHATSAPP_NUMBER = '573242421008'; // ← CAMBIA POR TU NÚMERO

// Verificar sesión
async function verificarSesionParaCompra() {
    try {
        const response = await fetch('/api/verificar-sesion');
        const data = await response.json();
        return data.autenticado;
    } catch (error) {
        return false;
    }
}

// Agregar al carrito
async function agregarAlCarrito(nombre, precio, imagen) {
    const estaLogueado = await verificarSesionParaCompra();
    
    if (!estaLogueado) {
        alert('🔐 Debes iniciar sesión para realizar compras.\n\nSerás redirigido al login...');
        window.location.href = 'login.html';
        return;
    }
    
    const existe = carrito.find(item => item.nombre === nombre);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id: Date.now(),
            nombre: nombre,
            precio: precio,
            talla: 'N/A',
            imagen: imagen,
            cantidad: 1
        });
    }
    
    localStorage.setItem('carritoGibor', JSON.stringify(carrito));
    actualizarContador();
    alert(`✅ ${nombre} agregado al carrito`);
}

// Actualizar contador
function actualizarContador() {
    const count = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contador = document.getElementById('carritoCount');
    const flotante = document.getElementById('carritoFlotante');
    
    if (contador) contador.textContent = count;
    if (flotante) flotante.style.display = count > 0 ? 'flex' : 'none';
}

// Eliminar producto
function eliminarProducto(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index > -1) {
        const productoEliminado = carrito[index].nombre;
        carrito.splice(index, 1);
        localStorage.setItem('carritoGibor', JSON.stringify(carrito));
        actualizarContador();
        
        const modal = document.getElementById('modalCheckout');
        if (modal && modal.style.display === 'flex') {
            abrirModal();
        }
        
        alert(`🗑️ ${productoEliminado} eliminado del carrito`);
    }
}

// Cambiar cantidad
function cambiarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        item.cantidad += cambio;
        
        if (item.cantidad <= 0) {
            eliminarProducto(id);
        } else {
            localStorage.setItem('carritoGibor', JSON.stringify(carrito));
            actualizarContador();
            abrirModal();
        }
    }
}

// Generar mensaje para WhatsApp
function generarMensajeWhatsApp(pedidoId, datosFormulario) {
    let mensaje = `👋 *HOLA GIBOR F.C - NUEVO PEDIDO*\n\n`;
    mensaje += `📋 *Pedido #${pedidoId}*\n`;
    mensaje += `─────────────────\n\n`;
    
    mensaje += `👤 *DATOS DEL CLIENTE:*\n`;
    mensaje += `Nombre: ${datosFormulario.nombre}\n`;
    mensaje += `Email: ${datosFormulario.email}\n`;
    mensaje += `Teléfono: ${datosFormulario.telefono}\n`;
    mensaje += `Dirección: ${datosFormulario.direccion}\n`;
    mensaje += `Ciudad: ${datosFormulario.ciudad}\n`;
    mensaje += `Pago: ${datosFormulario.metodoPago}\n\n`;
    
    mensaje += `📦 *PRODUCTOS:*\n`;
    mensaje += `─────────────────\n`;
    
    let total = 0;
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        mensaje += `${index + 1}. *${item.nombre}*\n`;
        mensaje += `   Talla: ${item.talla}\n`;
        mensaje += `   Cant: ${item.cantidad} x $${item.precio}\n`;
        mensaje += `   Subtotal: $${subtotal}\n`;
        mensaje += `─────────────────\n`;
    });
    
    mensaje += `\n💰 *TOTAL: $${total}*\n`;
    mensaje += `\n✨ Quedo atento a la confirmación del pedido. ¡Gracias!`;
    
    return mensaje;
}

// Abrir modal
function abrirModal() {
    const modal = document.getElementById('modalCheckout');
    const resumen = document.getElementById('carritoResumen');
    const totalPagar = document.getElementById('totalPagar');
    
    if (!modal) return;
    
    if (carrito.length === 0) {
        resumen.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">🛒 Tu carrito está vacío</p>';
        totalPagar.textContent = '$0.00';
        modal.style.display = 'flex';
        return;
    }
    
    // Generar HTML con imágenes
    let html = '';
    let total = 0;
    
    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item">
                <div class="carrito-item-imagen">
                    <img src="${item.imagen || 'https://placehold.co/80x80/E30613/ffffff.png?text=PROD'}" 
                         alt="${item.nombre}" 
                         class="carrito-item-img"
                         onerror="this.src='https://placehold.co/80x80/E30613/ffffff.png?text=PROD'">
                </div>
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-detalles">
                        <span>Talla: ${item.talla}</span>
                        <span class="carrito-item-cantidad">
                            <button onclick="cambiarCantidad(${item.id}, -1)" class="btn-cantidad">-</button>
                            ${item.cantidad}
                            <button onclick="cambiarCantidad(${item.id}, 1)" class="btn-cantidad">+</button>
                        </span>
                    </div>
                    <div class="carrito-item-precio">$${subtotal.toLocaleString()}</div>
                </div>
                <button class="btn-eliminar" onclick="eliminarProducto(${item.id})" title="Eliminar producto">
                    🗑️
                </button>
            </div>
        `;
    });
    
    resumen.innerHTML = html;
    totalPagar.textContent = `$${total.toLocaleString()}`;
    
    modal.style.display = 'flex';
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modalCheckout');
    if (modal) modal.style.display = 'none';
}

// Enviar pedido (FLUJO HÍBRIDO)
const formularioCheckout = document.getElementById('formularioCheckout');
if (formularioCheckout) {
    formularioCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (carrito.length === 0) {
            alert('🛒 Tu carrito está vacío');
            return;
        }
        
        const datos = {
            nombre_cliente: document.getElementById('checkoutNombre').value,
            email: document.getElementById('checkoutEmail').value,
            telefono: document.getElementById('checkoutTelefono').value,
            direccion: document.getElementById('checkoutDireccion').value,
            ciudad: document.getElementById('checkoutCiudad').value,
            metodo_pago: document.getElementById('metodoPago').value,
            productos: carrito,
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
        };
        
        // Calcular costo de envío
        const costoEnvio = datos.metodo_pago === 'contra_entrega' ? 5000 : 0;
        const totalConEnvio = datos.total + costoEnvio;
        
        try {
            // 1️⃣ GUARDAR EN MYSQL
            const response = await fetch('/api/pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...datos, total: totalConEnvio, costo_envio: costoEnvio })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // 2️⃣ GENERAR MENSAJE WHATSAPP
                const mensajeWhatsApp = generarMensajeWhatsApp(result.pedido_id, {
                    nombre: datos.nombre_cliente,
                    email: datos.email,
                    telefono: datos.telefono,
                    direccion: datos.direccion,
                    ciudad: datos.ciudad,
                    metodoPago: datos.metodo_pago.replace('_', ' ').toUpperCase()
                });
                
                const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
                
                // 3️⃣ CONFIRMAR Y REDIRIGIR
                const confirmar = confirm(
                    `✅ ¡PEDIDO #${result.pedido_id} REGISTRADO!\n\n` +
                    `📦 Total: $${totalConEnvio.toLocaleString()}\n` +
                    `${costoEnvio > 0 ? `🚚 Envío: $${costoEnvio.toLocaleString()}\n` : '✨ Envío GRATIS\n'}\n` +
                    `¿Quieres confirmar por WhatsApp ahora?`
                );
                
                if (confirmar) {
                    // 4️⃣ ABRIR WHATSAPP
                    window.open(urlWhatsApp, '_blank');
                }
                
                // 5️⃣ LIMPIAR CARRITO
                carrito = [];
                localStorage.removeItem('carritoGibor');
                actualizarContador();
                cerrarModal();
                
                // 6️⃣ MENSAJE FINAL
                setTimeout(() => {
                    alert(
                        ` RESUMEN DEL PEDIDO #${result.pedido_id}\n\n` +
                        `✅ Pedido guardado en nuestra base de datos\n` +
                        `📱 Te contactaremos pronto para confirmar\n` +
                        `💳 Método de pago: ${datos.metodo_pago.replace('_', ' ').toUpperCase()}\n\n` +
                        `¡Gracias por tu compra! ⚽`
                    );
                }, 500);
                
            } else {
                alert('❌ Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión. Inténtalo de nuevo.');
        }
    });
}

// Mostrar/ocultar datos de pago según selección
const metodoPagoSelect = document.getElementById('metodoPago');
if (metodoPagoSelect) {
    metodoPagoSelect.addEventListener('change', function() {
        const datosPago = document.getElementById('datosPago');
        const infoNequi = document.getElementById('infoNequi');
        const infoDaviplata = document.getElementById('infoDaviplata');
        const infoTransferencia = document.getElementById('infoTransferencia');
        const infoContraEntrega = document.getElementById('infoContraEntrega');
        
        // Ocultar todos
        if (datosPago) {
            infoNequi.style.display = 'none';
            infoDaviplata.style.display = 'none';
            infoTransferencia.style.display = 'none';
            infoContraEntrega.style.display = 'none';
            datosPago.style.display = 'block';
        }
        
        // Mostrar según selección
        if (this.value === 'nequi' && infoNequi) {
            infoNequi.style.display = 'block';
        } else if (this.value === 'daviplata' && infoDaviplata) {
            infoDaviplata.style.display = 'block';
        } else if (this.value === 'transferencia' && infoTransferencia) {
            infoTransferencia.style.display = 'block';
        } else if (this.value === 'contra_entrega' && infoContraEntrega) {
            infoContraEntrega.style.display = 'block';
        }
    });
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo');
    actualizarContador();
});

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalCheckout');
    if (event.target === modal) {
        cerrarModal();
    }
}

// ========================================
// FUNCIONES GLOBALES
// ========================================
window.agregarAlCarrito = agregarAlCarrito;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.eliminarProducto = eliminarProducto;
window.cambiarCantidad = cambiarCantidad;
window.actualizarContador = actualizarContador;