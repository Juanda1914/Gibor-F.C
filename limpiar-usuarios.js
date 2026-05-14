// limpiar-usuarios.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function limpiarUsuarios() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n🗑️  Eliminando usuarios de prueba...\n');

    // Opción A: Eliminar todos
    await db.query('TRUNCATE TABLE usuarios');
    console.log('✅ Todos los usuarios eliminados\n');

    // Opción B: Eliminar específicos (descomenta si quieres usar esto)
    // await db.query("DELETE FROM usuarios WHERE email LIKE '%@email.com'");
    // console.log('✅ Usuarios de email.com eliminados\n');

    await db.end();
}

limpiarUsuarios().catch(console.error);