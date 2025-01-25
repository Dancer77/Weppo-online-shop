const db = require('./dbOperations/db_users_operations');

users = [];

id = null

function getNewId() {
    if (id == null) {
        //pozyskanie największego id użytkownika
        id = users.reduce( (max, user) => {
            return user.id > max ? user.id : max;
        }, 0);
    }
    return ++id;
}

async function getUsers() {
    if (users.length === 0) {
        try {
            users = await db.getUsersFromDb();
        } catch (err) {
            console.error('Błąd przy pobieraniu użytkowników:', err);
        }
    }
    return users;
}

async function addUser(name, password, email) {
    try {
        users = await getUsers();
        let newId = getNewId();
        users.push({name, password, email, role: 'użytkownik', id: newId });
        await db.addUserToDb({name, password, email, role: 'użytkownik', id: newId });

    } catch (err) {
        console.error('Błąd przy dodawaniu użytkownika:', err);
    }
}

module.exports = {
    getUsers,
    addUser
}