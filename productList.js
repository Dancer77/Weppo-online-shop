const db = require('./dbOperations/db_products_operations')

let products = [];  // {id, product, price, description, amount}

id = null

//statyczne newId nie zda egzaminu, bo na początku programu jeszcze nie mamy wczytanych produktów z bazy danych
function getNewId() {
    if (id == null) {
        //pozyskanie największego id produktu
        id = products.reduce( (max, product) => {
            return product.id > max ? product.id : max;
        }, 0);
    }
    return ++id;
}
//let newId = products.length + 1;

async function getProducts(doit) {
    if (products.length == [] || doit){
        try {
            products = await db.getProductsFromDb();
        } catch (err) {
            console.error('Błąd podczas pobierania produktów:', err);
        }
    }
    return products;
}

function createNewProduct(product, price, description, amount, id) {
    var newProduct = { product, price, description, amount};
    if ( id ) {
        newProduct.id = id;
    } else {
        newProduct.id = getNewId();
    }
    return newProduct;
}

async function addProduct(product, price, description, amount) {
    var newProduct = createNewProduct(product, price, description, amount);
    products.push( newProduct );
    console.log(products);
    await db.addProductToDb(newProduct);
    return newProduct;
}

async function removeProduct(id) {
    products = products.filter( product => product.id != id );
    await db.removeProductFromDb(id);
};

async function updateProduct(id, product, price, description, amount) {
    removeProduct(id);
    var newProduct = createNewProduct(product, price, description, amount, id);
    products.push( newProduct );
    await db.updateProductInDb(newProduct);
    return newProduct;
}



module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    removeProduct
}