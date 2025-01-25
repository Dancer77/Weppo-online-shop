
const sql = require('mssql')

const sqlConfig = {
    user: `fLw'<b;i",l+Fg\`7!w]539wTfQecE2`,
    password: '63oXt*;F#&7Ee9;OE/Slh=B@Ve6oe~',
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