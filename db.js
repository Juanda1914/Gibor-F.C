// config/db.js (o donde tengas la conexión)
require('dotenv').config();
const mysql = require('mysql2/promise');  // ← IMPORTANTE: /promise

// Crear POOL de conexiones (mejor que createConnection)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'juanda1419',  // ← Tu contraseña
    database: process.env.DB_NAME || 'gibor_fc',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
async function verificarConexion() {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conectado a la base de datos de GIBOR F.C');
        connection.release();
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
    }
}

verificarConexion();

module.exports = db;