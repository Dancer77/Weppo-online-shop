const db = require('./dbOperations/db_bags_operations');

let bag = []; //{id, product, price, amount}

let firstUse = true;  //sprawdzanie czy dane zostały już pobrane
let _userId = null;

async function getBag(userId) {
    if (userId == null){
        console.error("Brak podanego użytkownika");
        return [];
    }
    try {
        //pobranie danych z bazy tylko przy pierwszym odwiedzeniu koszyka
        if (firstUse) {
            bag = await db.getBagFromDb(userId);
            _userId = userId;
            //console.log('WCZYTANIE userId = ', _userId);
            firstUse = false;
        }
        return bag;
    } catch (err) {
        console.error('Błąd przy pobieraniu koszyka:', err);
        return [];
    }
}

async function addToBag(id, product, price, amount) {
    try{
        var newInBag = bag.find(product => product.id == id);
        if(newInBag) {
            newInBag.amount += amount;
            await db.updateAmountInBagInDb(id, amount, _userId);
        } else {
            newInBag = {id, product, price, amount};
            bag.push( newInBag );
            await db.addToBagInDb(id, amount, _userId);
        }
        return newInBag;
    } catch (err) {
        console.error('Błąd przy dodawaniu produktu do koszyka:', err);
    }
}

async function updateAmount(id, amount) {
    //console.log('UPDATE userId = ', _userId);
    try {
        var editedInBag = bag.find(product => product.id == id);
        editedInBag.amount += amount;
        await db.updateAmountInBagInDb(id, amount, _userId);
        return editedInBag;
    } catch (err) {
        console.error('Błąd przy aktualizacji ilości produktu w koszyku:', err);
    }
}

async function removeFromBag(id, amount) {
    try {
        //usunięcie jednej sztuki produktu z koszyka
        if(amount){
            var editedInBag = bag.find(product => product.id == id);
            editedInBag.amount -= amount;
            bag = bag.filter(product => product.amount != 0);
            console.log(bag);
            
            editedInBag.amount === 0
                ? await db.deleteFromBagInDb(id, _userId)
                : await db.updateAmountInBagInDb(id, -amount, _userId);
        
            return editedInBag;

        //usunięcie produktu z bazy przez admina
        } else {    
            bag = bag.filter(product => product.id != id);
            await db.removeFromBagsInDb(id);
        }
    } catch (err) {
        console.error('Błąd przy usuwaniu produktu z koszyka:', err);
    }
}

async function removeBag() {
    try {
        bag = [];
        await db.removeBagFromDb(_userId);
    } catch (err) {
        console.error('Błąd przy usuwaniu koszyka:', err);
    }
}

function clearBag() {
    bag = [];
    firstUse = true;
    userId = null;
}
  
module.exports = {
    getBag,
    addToBag,
    updateAmount,
    removeFromBag,
    clearBag,
    removeBag
}