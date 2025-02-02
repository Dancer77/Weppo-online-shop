const db = require('./dbOperations/db_orders_operations');

let orders = [];    //obiekty w formacie {id, userId, userName, productsList}
let orderId = null;

async function getNewId() {
    if (orderId == null) {
        await getOrders();
        //pozyskanie największego id zamówienia
        orderId = orders.reduce( (max, order) => {
            return order.id > max 
                ? order.id 
                : max;
        }, 0);
        //orders = [];    //nie ma potrzeby trzymać w pamięci wszystkich zamówień
    }
    return ++orderId;
}

async function getOrders() {
    try {
        orders = await db.getOrdersFromDb();

        console.log('Zamówienia pobrane')
        return orders;
    } catch (err) {
        console.log('Błąd przy pobieraniu zamówień')
    }
}

async function addOrder(userId) {
    try {
        var orderId = await getNewId();
        await db.addOrderToDb(orderId, userId);
        
        //testowo:
        //orders = await getOrders()

        console.log('Zamówienie dodane')
        //return newOrder;
    } catch (err) {
        console.error('Błąd przy dodawaniu zamówienia:', err);
    }
}

//TODO: removeOrder
/*
function removeOrder(id) {
    orders = orders.filter(product => product.id != id); 
}
*/

function clearOrders() {
    orders = []
}
  
module.exports = {
    getOrders,
    addOrder,
    //removeOrder,
    clearOrders
}