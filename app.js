//TODO: przy czyszczeniu wyszukiwania, wyszukiwany tekst zostaje wpisany w pasku wyszukiwania
//TODO: walidacja, czy nowy produkt jest poprawnie wpiisany (cena i ilość jako liczba)
//TODO: przy edycji powinniśmy widzieć stare dane i móc je edytować wsm zamiast wpisywać od nowa

var http = require('http');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');

var productRepo = require('./productList');
var bagRepo = require('./bag');
var orderRepo = require('./orders');
var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use( express.urlencoded({extended: true}));
app.use(expressLayouts);
app.use(express.json());  

//Zarządzanie produktami
app.get('/api/product', (req, res) => {
    res.json(productRepo.getProducts());
});

app.post('/api/product', (req, res) => {
    var {product, price, description, amount} = req.body;
    var newProduct = productRepo.addProduct(product, price, description, amount);
    res.json(newProduct);
});

app.put('/api/product/:id', (req, res) => {
    var {product, price, description, amount} = req.body;
    var id = req.params.id;
    newProduct = productRepo.updateProduct(id, product, price, description, amount);
    res.json(newProduct);
});

app.delete('/api/product/:id', (req, res) => {
    var id = req.params.id;
    productRepo.removeProduct(id);
    bagRepo.removeFromBag(id);
    res.status(200).end(); //nie wysyłamy nic do klienta, ale informujemy, że wszystko przeszło pomyślnie
});

//Zarządzanie koszykiem
function checkAmount(amountToAdd, id){
    var products = productRepo.getProducts();
    var product = products.find(product => product.id == id);
    var amountOfProduct = product.amount;
    var bag = bagRepo.getBag();
    var productInBag = bag.find(product => product.id == id);
    if(productInBag){
        var amountInBag = productInBag.amount;
        if(amountOfProduct >= amountInBag + amountToAdd) return true;
        else return false;
    } else return true;
}

app.get('/api/bag', (req, res) => {
    res.json(bagRepo.getBag());
});

app.put('/api/bagLess/:id', (req, res) => {
    var id = req.params.id;
    bagRepo.removeFromBag(id, 1);
    res.status(200).end();
});


app.post('/api/addToBag/:id', (req, res) => {
    var id = req.params.id;
    var products = productRepo.getProducts();
    var {i, product, price} = products.find(product => product.id == id);

    if(checkAmount(1, id)) {
        var newInBag = bagRepo.addToBag(id, product, price, 1)
        res.json(newInBag)
    } //OPCJONALNIE: dodanie komunikatu, że dodana została maksymalna ilość produktu 
    
});


//POWYŻEJ WSZYSTKO GOTOWE
//----------------------------------------------------------------------------
//TODO
//PONIŻEJ WSZYSTKO ROBOCZE - TRZEBA UWZGLĘDNIĆ LOGOWANIE

app.get('/', (req, res) => {
    var role = req.query.role;
    if(role)
        res.render('basic_main', {role: role, layout: 'main_layout'});
    else
        res.render('basic_main', {role: "", layout: 'main_layout'});
});  

app.get('/login', (req, res) => {
    res.render('login', {role: "", layout: 'main_layout'});
});

app.post('/login', (req, res) => {
    const {role} = req.body;
    res.redirect(`/?role=${role}`);
});

app.get('/bag', (req, res) => {
    res.render('bag', {role: req.query.role, layout: 'main_layout'});
});

app.get('/userList', (req, res) => {
    res.render('userList', {role: req.query.role, layout: 'main_layout'});
})

app.get('/logout', (req, res) => {
    res.redirect(`/`);
})

http.createServer( app ).listen(3000);
console.log('started');