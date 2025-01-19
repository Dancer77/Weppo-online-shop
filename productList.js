let products = [
    { id: 1, product: 'Krzesło', price: 79.99, description: 'drewniane', amount: 10},
    { id: 2, product: 'Stół', price: 129.99, description: 'metalowy', amount: 3 },
    ];

let newId = products.length + 1;

function getProducts() {
    return products;
}

function createNewProduct(product, price, description, amount, id) {
    var newProduct = { product, price, description, amount};
    if ( id ) {
        newProduct.id = id;
    } else {
        newProduct.id = newId++;
    }
    return newProduct;
}

function addProduct(product, price, description, amount) {
    var newProduct = createNewProduct(product, price, description, amount);
    products.push( newProduct );
    return newProduct;
}

function updateProduct(id, product, price, description, amount) {
    removeProduct(id);
    var newProduct = createNewProduct(product, price, description, amount, id);
    products.push( newProduct );
    return newProduct;
}

function removeProduct(id) {
    products = products.filter( product => product.id != id );
}
  
module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    removeProduct
}