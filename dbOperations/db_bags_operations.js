const sql = require('mssql');

const { getProducts } = require('../productList');

async function getBagFromDb(userId) {
    try {
        var result = await sql.query`SELECT product_id, amount_in_bag
                                    FROM users_products_table 
                                    WHERE user_id = ${userId}`;
        var bag = result.recordset; //pobranie koszyka z bazy, zapisane w formie listy obiektów {product_id, amount_in_bag}
        var products = await getProducts();
        //console.log('Koszyk pobrany z bazy danych:\n', bag);

        // bag przetrzymuje obiekty w formacie {id, product, price, amount}
        bag = bag.map(b => {
            var product = products.find(p => p.id == b.product_id);
            if (!product) {
                console.warn(`Produkt o id = ${b.product_id} nie został znaleziony.`);
                return null;
            }
            return {
                id : product.id,
                product : product.product,  //nazwa produktu (wolałbym name, ale już za dużo do zmieniania)
                price : product.price,
                amount : b.amount_in_bag
            }
        }).filter(b => b !== null); //pomijanie nieznalezionych produktów
        console.log('Koszyk pobrany z bazy danych:\n', bag);
        return bag;
    } catch (err) {
        console.error('Błąd podczas pobierania koszyka z bazy:', err);
    }
}

async function updateAmountInBagInDb(productId, amount, userId) {
                                                                                        //console.log('updateAmountInBagInDb userId = ', userId);
    try {
        await sql.query`UPDATE users_products_table 
                        SET amount_in_bag = amount_in_bag + ${amount} 
                        WHERE user_id = ${userId} AND product_id = ${productId}`;
        console.log('Aktualizacja ilości produktu w koszyku');
    } catch (err) {
        console.error('Błąd przy aktualizacji ilości produktu w koszyku w bazie:', err);
    }
}

async function addToBagInDb(productId, amount, userId) {
    try {
        await sql.query`INSERT INTO users_products_table (user_id, product_id, amount_in_bag) VALUES 
                        (${userId}, ${productId}, ${amount})`;
        console.log('Produkt dodany do koszyka');
    } catch (err) {
        console.error('Błąd przy dodawaniu produktu do koszyka w bazie:', err);
    }
}

//usuwa produkt z koszyka jednego użytkownika
async function deleteFromBagInDb(productId, userId) {
    try {
        await sql.query`DELETE FROM users_products_table 
                        WHERE user_id = ${userId} AND product_id = ${productId}`;
        console.log('Produkt usunięty z koszyka');
    } catch (err) {
        console.error('Błąd przy usuwaniu produktu z koszyka w bazie:', err);
    }
}

///usuwa produkt z koszyków wszystkich użytkowników
async function removeFromBagsInDb(productId) {
    try {
        await sql.query`DELETE FROM users_products_table 
                        WHERE product_id = ${productId}`;
        console.log('Produkt usunięty ze wszystkich koszyków');
    } catch (err) {
        console.error('Błąd przy usuwaniu produktu z koszyków w bazie:', err);
    }
}

module.exports = {
    getBagFromDb,
    updateAmountInBagInDb,
    addToBagInDb,
    deleteFromBagInDb,
    removeFromBagsInDb
}