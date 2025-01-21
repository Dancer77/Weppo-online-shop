let orders = [];

function getOrders() {
    return orders;
}

let newId = orders.length + 1;

function addOrder(bag, user, status) {
    var id = newId++;
    var newOrder = {id, user, status, bag}
    bag.push( newOrder );
    return newOrder;
}

function updateStatus(id, status) {
    var order = orders.find(o => o.id == id);
    order.status = status;
    return order;
}

function removeOrder(id) {
    orders = orders.filter(product => product.id != id); 
}
  
module.exports = {
    getOrders,
    addOrder,
    updateStatus,
    removeOrder
}