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
async function removeUserFromDb(id) {
    try {
        //usunięcie wszystkich produktów w koszyku użytkownika
        await sql.query`DELETE FROM users_products_table 
                        WHERE user_id = ${id}`;
        
        //usunięcie zamówień użytkownika
        await sql.query`DELETE FROM orders_table
                        WHERE user_id = ${id}`

        await sql.query`DELETE FROM users_table 
                        WHERE id = ${id}`;
        console.log('Użytkownik usunięty z bazy danych');
    } catch (err) {
        console.error('Błąd przy usuwaniu użytkownika z bazy:', err);
    }

}

module.exports = {
    getUsersFromDb,
    addUserToDb,
    removeUserFromDb
}