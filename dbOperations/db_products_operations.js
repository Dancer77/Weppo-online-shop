const sql = require('mssql');

async function getProductsFromDb() {
    try {
        const result = await sql.query(`SELECT * 
                                        FROM products_table`);
        //result.recordset.forEach( r => {
        //    console.log( `${r.id} ${r.product}`);
        //})
        //console.log('to już wszystkie\n');

        return result.recordset;
    } catch (err) {
        console.error('Błąd podczas pobierania produktów:', err);
        return [];
    }
}

async function addProductToDb(product) {
    try {
        await sql.query`INSERT INTO products_table (id, product, price, description, amount) VALUES 
            (${product.id}, ${product.product}, ${product.price}, ${product.description}, ${product.amount})`;
        console.log('Produkt dodany do bazy danych');
    } catch (err) {
        console.error('Błąd podczas dodawania produktu:', err);
    }
}

async function updateProductInDb(product) {
    try {
        await removeProductFromDb(product.id);
        await addProductToDb (product);
        console.log('Produkt zaktualizowany')
    } catch (err) {
        console.log('Błąd przy aktualizacji produktu:', err);
    }
}

async function removeProductFromDb(id) {
    try {
        await sql.query`DELETE FROM products_table 
                        WHERE id = ${id}`
        console.log('Produkt usunięty');
    } catch (err) {
        console.error('Błąd podczas usuwania produktu:', err);
    }
}
module.exports = {
    getProductsFromDb,
    addProductToDb,
    updateProductInDb,
    removeProductFromDb
}