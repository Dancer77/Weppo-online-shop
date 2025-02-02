const sql = require('mssql');
const { getBag } = require('../bag');
const { getProducts } = require('../productList');

async function getOrdersFromDb() {
    try {
        const result = await sql.query`SELECT *
                                        FROM orders_table`;
        var orders = result.recordset;
        if (orders.length == 0) {
            return [];
        }
        //console.log(orders);

        // Grupowanie zamówień według order_id
        const ordersMap = new Map();
        for (let o of orders) {
            if (!ordersMap.has(o.order_id)) {
                ordersMap.set(o.order_id, {
                    id: o.order_id,
                    userId: o.user_id,
                    userName: null, // Wypełniane później
                    price: 0,
                    productsList: []
                });
            }
            product = await sql.query`SELECT id, product, price
                                        FROM products_table
                                        WHERE id = ${o.product_id}`
            product = product.recordset[0]
            ordersMap.get(o.order_id).price += product.price * o.amount;
            //console.log('product: ', product)
            if (product != undefined && product != null){
                product.amount = o.amount
                ordersMap.get(o.order_id).productsList.push(product);
            }
        }

        // Pobranie unikalnych użytkowników
        const userIds = [...new Set(orders.map(o => o.user_id))];
        const usersQuery = await sql.query`SELECT id, name 
                                            FROM users_table 
                                            WHERE id IN (${userIds})`;
        const usersMap = new Map(usersQuery.recordset.map(user => [user.id, user.name]));

        // Przypisanie nazw użytkowników do zamówień
        for (let order of ordersMap.values()) {
            order.userName = usersMap.get(order.userId) || "Nieznany użytkownik";
        }

        // Konwersja Map na tablicę
        const finalOrders = Array.from(ordersMap.values());

        console.log(finalOrders)
        for (let o of finalOrders)
            console.log(o.productsList);

        console.log('Zamówienia pobrane z bazy danych');
        return finalOrders;
    } catch (err) {
        console.error('Błąd podczas pobierania zamówień:', err);
        return [];
    }
}

async function addOrderToDb(orderId, userId) {
    try {
        var bag = await getBag(userId);
        for (let i = 0; i < bag.length; i++) {
            await sql.query`INSERT INTO orders_table (order_id, user_id, product_id, amount) VALUES 
                            (${orderId}, ${userId}, ${bag[i].id}, ${bag[i].amount})`;
            
            await sql.query`UPDATE products_table
                            SET amount = amount - ${bag[i].amount}
                            WHERE id = ${bag[i].id}`

            await sql.query`UPDATE users_products_table
                            SET amount_in_bag = CASE
                                WHEN amount_in_bag > (SELECT amount
                                                    FROM products_table
                                                    WHERE id = ${bag[i].id})
                                THEN (SELECT amount
                                    FROM products_table 
                                    WHERE id = ${bag[i].id})
                                ELSE amount_in_bag
                            END
                            WHERE product_id = ${bag[i].id}`
        }
        getProducts(true);
        console.log('Zamówienie dodane do bazy danych');
    } catch (err) {
        console.error('Błąd przy dodawaniu zamówienia do bazy:', err);
    }
}

module.exports = {
    getOrdersFromDb,
    addOrderToDb
}