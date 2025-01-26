const sql = require('mssql');

async function getProductsFromDb() {
    try {
        const result = await sql.query(`SELECT * 
                                        FROM products_table`);
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

async function removeProductFromDb(id) {
    try {
        //TODO: tutaj chcę użyć removeFromBagsInDb(productId) z db_bags_operations.js
        await sql.query`DELETE FROM users_products_table 
                        WHERE product_id = ${id}`;
        await sql.query`DELETE FROM products_table 
                        WHERE id = ${id}`
        console.log('Produkt usunięty');
    } catch (err) {
        console.error('Błąd podczas usuwania produktu:', err);
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

module.exports = {
    getProductsFromDb,
    addProductToDb,
    updateProductInDb,
    removeProductFromDb
}