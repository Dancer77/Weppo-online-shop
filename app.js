//TODO: przy czyszczeniu wyszukiwania, wyszukiwany tekst zostaje wpisany w pasku wyszukiwania
//TODO: walidacja, czy nowy produkt jest poprawnie wpiisany (cena i ilość jako liczba)
//TODO: przy edycji powinniśmy widzieć stare dane i móc je edytować wsm zamiast wpisywać od nowa
//TODO: dodać przycisk w koszyku kierujący do strony głównej

//TODO: dodać tworzenie i usuwanie kont
//TODO: dodać synchronizację z koszykiem

const http = require('http');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const sql = require('mssql')
const config = require('./sqlConfig')

const productRepo = require('./productList');
const bagRepo = require('./bag');
const orderRepo = require('./orders');
var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use( express.urlencoded({extended: true}));
app.use(expressLayouts);
app.use(express.json());  

//połączenie z bazą danych
config.connectToDatabase();

//Zarządzanie produktami
app.get('/api/product', async (req, res) => {
    try {
        const products = await productRepo.getProducts();
        res.json(products);
    } catch (err) {
        console.error('Chuj', err);
    }
});

app.post('/api/product', async (req, res) => {
    try {
        var {product, price, description, amount} = req.body;
        var newProduct = await productRepo.addProduct(product, price, description, amount);
        res.json(newProduct);
    } catch (err) {
        console.error('Chuj2', err)
    }
    
});

app.put('/api/product/:id', async (req, res) => {
    try {
        var {product, price, description, amount} = req.body;
        var id = req.params.id;
        newProduct = await productRepo.updateProduct(id, product, price, description, amount);
        res.json(newProduct);
    } catch (err) {
        console.error('Chuj3', err)
    }
});

app.delete('/api/product/:id', async (req, res) => {
    try {
        var id = req.params.id;
        await productRepo.removeProduct(id);
        bagRepo.removeFromBag(id);
        res.status(200).end(); //nie wysyłamy nic do klienta, ale informujemy, że wszystko przeszło pomyślnie
    } catch (err) {
        console.error('Chuj4', err);
    }
});

//Zarządzanie koszykiem
async function checkAmount(amountToAdd, id){
    var products = await productRepo.getProducts();
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


app.post('/api/addToBag/:id', async (req, res) => {
    try {
        var id = req.params.id;
        var products = await productRepo.getProducts();
        var {i, product, price} = products.find(product => product.id == id);
    
        if(checkAmount(1, id)) {
            var newInBag = bagRepo.addToBag(id, product, price, 1)
            res.json(newInBag)
        } //OPCJONALNIE: dodanie komunikatu, że dodana została maksymalna ilość produktu 
    } catch (err) {
        console.error('Chujjj', err);
    }
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

//logowanie użytkownika
app.post('/login', async (req, res) => {
    try {
        const username = req.body.name;
        const userPassword = req.body.password;
        console.log(username + ' ' + userPassword)

        const request = new sql.Request(config.pool)
        request
            .input("username", username)
            .input("userPassword", userPassword)

        const result = await request
            .query('select * from users_table where name = (@username) and password = (@userPassword)');

        console.log(result.recordset)

        if (result.recordset.length === 1) {
            //przekierowanie do strony głównej
            const user = result.recordset[0]; // Pobranie użytkownika
            const userId = user.id; // Pobieranie id 
            const role = user.role; //Pobieranie roli

            res.redirect(`/?role=${role}`);
        }
        else {
            //alert("Błędna nazwa użytkownika lub hasło.");
        }

    } catch (err) {
        console.error('Chuj przy logowaniu:', err)
    }
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