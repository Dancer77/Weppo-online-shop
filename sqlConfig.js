
const sql = require('mssql')

const sqlConfig = {
    user: 'abc',
    password: 'abc',
    database: 'Weppodb',
    server: 'localhost',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
var pool;

async function connectToDatabase() {
    try {
        //await conn.connect();
        pool = await sql.connect(sqlConfig)
        console.log('Połączono z MSSQL');
    } catch (err) {
        //if (conn.connected)
            //conn.close();
        console.error('Błąd połączenia z MSSQL:', err);
    }
}


module.exports = {
    connectToDatabase,
    pool
}