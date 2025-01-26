const db = require('./dbOperations/db_orders_operations');

let orders = [];
let firstUse = true;  //sprawdzanie czy dane zostały już pobrane
let orderId = null;

async function getNewId() {
    if (orderId == null) {
        await getOrders();
        //pozyskanie największego id zamówienia
        orderId = orders.reduce( (max, order) => {
            return order.order_id > max 
                ? order.order_id 
                : max;
        }, 0);
        //orders = [];    //nie ma potrzeby trzymać w pamięci wszystkich zamówień
    }
    return ++orderId;
}

async function getOrders() {
    if (firstUse) {
        orders = await db.getOrdersFromDb();
        firstUse = false;
    }
    return orders;
}

//let newId = orders.length + 1;

function addOrder(bag, userId) {
    var id = getNewId();
    var newOrder = {id, userId, bag}
    orders.push( newOrder );
    return newOrder;
}
/*
function updateStatus(id, status) {
    var order = orders.find(o => o.id == id);
    order.status = status;
    return order;
}
*/
function removeOrder(id) {
    orders = orders.filter(product => product.id != id); 
}
  
module.exports = {
    getOrders,
    addOrder,
    //updateStatus,
    removeOrder
}