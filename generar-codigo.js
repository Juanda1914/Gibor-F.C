// generar-codigo.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function generarCodigo() {
    // Conexión a MySQL
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const email = 'juansuarez2911@gmail.com';
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`📧 Código para ${email}: ${codigo}`);

    // Actualizar en la base de datos
    await db.query(
        'UPDATE usuarios SET codigo_verificacion = ? WHERE email = ?',
        [codigo, email]
    );

    console.log('✅ Código actualizado en la base de datos');

    await db.end();
}

generarCodigo().catch(console.error);