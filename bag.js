let bag = [];

function getBag() {
    return bag;
}

function addToBag(id, product, price, amount) {
    var newInBag = bag.find(product => product.id == id);
    if(newInBag) {
        newInBag.amount += amount;
    } else {
        newInBag = {id, product, price, amount};
        bag.push( newInBag );
    }
    return newInBag;
}

function updateAmount(id, amount) {
    var editedInBag = bag.find(product => product.id == id);
    editedInBag.amount += amount;
    return editedInBag;
}

function removeFromBag(id, amount) {
    if(amount){
        var editedInBag = bag.find(product => product.id == id);
        editedInBag.amount -= amount;
        bag = bag.filter(product => product.amount != 0);
        return editedInBag;
    } else {
        bag = bag.filter(product => product.id != id);
    }
    
}
  
module.exports = {
    getBag,
    addToBag,
    updateAmount,
    removeFromBag
}