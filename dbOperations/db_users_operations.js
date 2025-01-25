const sql = require('mssql');

async function getUsersFromDb() {
    try {
        var result = await sql.query`SELECT * 
                                    FROM users_table`;
        console.log('Użytkownicy pobrani z bazy danych');
        return result.recordset;
    } catch (err) {
        console.error('Błąd przy pobieraniu użytkowników z bazy:', err);
    }
}

async function addUserToDb(user) {
    try {
        await sql.query`INSERT INTO users_table (name, password, email, role, id) VALUES 
                        (${user.name}, ${user.password}, ${user.email}, ${user.role}, ${user.id})`;
        console.log('Użytkownik dodany do bazy danych');
    } catch (err) {
        console.error('Błąd przy dodawaniu użytkownika:', err);
    }
}

module.exports = {
    getUsersFromDb,
    addUserToDb
}