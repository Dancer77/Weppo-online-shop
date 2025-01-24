//TODO: walidacja, czy nowy produkt jest poprawnie wpiisany (cena i ilość jako liczba) - W CHUJ ISTOTNE, bez tego baza się wysypie
//TODO: przy czyszczeniu wyszukiwania, wyszukiwany tekst zostaje wpisany w pasku wyszukiwania
//TODO: przy edycji powinniśmy widzieć stare dane i móc je edytować wsm zamiast wpisywać od nowa
//TODO: dodać przycisk w koszyku kierujący do strony głównej (obecny się nie wyświetla)
//TODO: (opcjonalnie) wyszukiwanie tylko po częściowej nazwie (np: wpisanie "rze" powinno powodować wyświetlanie produktu o nazwie "Krzesło")
//TODO: po dodaniu nowego produktu, tabelka dodawania kolejnego produktu nie powinna zawierać danych właśniej dodanego - powinna być pusta
//TODO: przycisk powrotu z userList nie działa
//TODO: id produktu nie powinno być wyświetlane wsm
//TODO: (opcjonalnie) przycisk wylogowania powinien być na każdej stronie

//TODO: dodać tworzenie i usuwanie kont
//TODO: dodać synchronizację z koszykiem

const http = require('http');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const sql = require('mssql')
const config = require('./sqlConfig')
var cookieParser = require('cookie-parser');
const session = require('express-session');

const productRepo = require('./productList');
const bagRepo = require('./bag');
const orderRepo = require('./orders');
var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use( express.urlencoded({extended: true}));
app.use(expressLayouts);
app.use(express.json());
app.use(cookieParser('sgs90890s8g90as8rg90as8g9r8a0srg8'));

//sesja
app.use(session({
    secret: 'sgs90890s8g90as8rg90as8g9r8a0srg8',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Chroni przed atakami XSS
        secure: false,  // Ustaw na true, jeśli używasz HTTPS
        maxAge: 1000 * 60 * 60 // Ważność pliku cookie w ms (np. 1 godzina)
    }
}));

//połączenie z bazą danych
//TODO: (opcjonalnie) dodać łączenie za każdym razem, gdy wykonywane jest rządanie (Czy warto?)
config.connectToDatabase();

//wyświetlanie listy produktów
app.get('/api/product', async (req, res) => {
    try {
        const products = await productRepo.getProducts();
        res.json(products);
    } catch (err) {
        console.error('Chuj', err);
    }
});

//dodawanie nowego produktu
app.post('/api/product', authorize('admin'), async (req, res) => {
    try {
        var {product, price, description, amount} = req.body;
        var newProduct = await productRepo.addProduct(product, price, description, amount);
        res.json(newProduct);
    } catch (err) {
        console.error('Chuj2', err)
    }
    
});

//aktualizowanie ptroduktu
app.put('/api/product/:id', authorize('admin'), async (req, res) => {
    try {
        var {product, price, description, amount} = req.body;
        var id = req.params.id;
        newProduct = await productRepo.updateProduct(id, product, price, description, amount);
        res.json(newProduct);
    } catch (err) {
        console.error('Chuj3', err)
    }
});

//usuwanie produktu
app.delete('/api/product/:id', authorize('admin'), async (req, res) => {
    try {
        var id = req.params.id;
        await bagRepo.removeFromBag(id);
        await productRepo.removeProduct(id);
        res.status(200).end(); //nie wysyłamy nic do klienta, ale informujemy, że wszystko przeszło pomyślnie
    } catch (err) {
        console.error('Chuj4', err);
    }
});

//Zarządzanie koszykiem
async function checkAmount(amountToAdd, id, myBag){
    try {
        var products = await productRepo.getProducts();
        var product = products.find(product => product.id == id);
        var amountOfProduct = product.amount;
        var bag = myBag
        var productInBag = bag.find(product => product.id == id);
        if(productInBag){
            var amountInBag = productInBag.amount;
            if(amountOfProduct >= amountInBag + amountToAdd) return true;
            else return false;
        } else return true;
    } catch (err) {
        console.error('Chuj5', err);
    }
}

//wyświetlanie koszyka
app.get('/api/bag', authorize('użytkownik'), async (req, res) => {
    console.log('userId w api/bag: ', req.session.userId);
    res.json(await bagRepo.getBag(req.session.userId));
});

//usuwanie z koszyka
app.put('/api/bagLess/:id', authorize('użytkownik'), async (req, res) => {
    var id = req.params.id;
    await bagRepo.removeFromBag(id, 1);
    res.status(200).end();
});

//dodawanie dokoszyka
app.post('/api/addToBag/:id', authorize('użytkownik'), async (req, res) => {
    try {
        var id = req.params.id;
        var products = await productRepo.getProducts();
        var myBag = await bagRepo.getBag(req.session.userId);
        var {i, product, price} = products.find(product => product.id == id);
    
        if(checkAmount(1, id, myBag)) {
            var newInBag = await bagRepo.addToBag(id, product, price, 1);
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

//funkcja sprawdzająca, czy użytkownik jest w danej roli

//function isUserInRole(/*user,*/myRole, role) {
//    console.log(myRole + '    ' + role);
//    return myRole == role;
//}


//middleware - strażnik, czy użytkownik jest zalogowany (czy ma ciastko)
function authorize(...roles) {
    return function(req, res, next) {
        console.log('sesja: ', req.session);
        if ( req.signedCookies.user ) {
            //console.log('\n' + req.signedCookies.user + '\n');
            //let user = req.signedCookies.user;
            console.log('istnieje ciastko');
            let myRole = req.session.role;
            if ( roles.length == 0 ||
                roles.some( role => myRole == role )
            ) {
                //req.user = user;
                console.log('autoryzacja przebiegła pomyślnie');
                return next();
            }
        }
    // callback na brak autoryzacji
    //res.render( 'login', { role: "", layout: 'main_layout' } );
    console.log('przekierowanie do logowania')
    res.redirect('/login?returnUrl=' + req.url);
    return;
    }
}

//strona główna
app.get('/', (req, res) => {
    var role = req.session.role;
    console.log('rola: ' + role);
    if(role)
        res.render('basic_main', {role: role, layout: 'main_layout'});
    else
        res.render('basic_main', {role: null, layout: 'main_layout'});
});  

//strona logowania
app.get('/login', (req, res) => {
    console.log('weszło do logowania');
    
    //FIXME: przy przekierowaniu z authorize, strona logowania nie jest wyświetlana
    if (req.session.userId) {
        console.log('Użytkownik jest już zalogowany');
        //TODO: dodać komunikat, że użytkownik jest już zalogowany
        res.redirect('/');  //TODO: (opcjonalnie) zmienić na przekierowanie na poprzednią stronę
        return;
    }
    
    console.log('render strony logowania');
    res.render('login', {layout: 'main_layout'});
});

//logowanie użytkownika
app.post('/login', async (req, res) => {
    //TODO: dodać hashowanie hasła
    try {
        const username = req.body.name;
        const userPassword = req.body.password;

        const request = new sql.Request(config.pool)
        request
            .input("username", username)
            .input("userPassword", userPassword)

        const result = await request
            .query('select * from users_table where name = (@username) and password = (@userPassword)');

        console.log(result.recordset)

        if (result.recordset.length === 1) {
            //logowanie przebiegło pomyślnie

            const user = result.recordset[0]; // Pobranie użytkownika
            const userId = user.id; // Pobieranie id 
            const role = user.role; //Pobieranie roli

            await bagRepo.getBag(userId); //pobranie koszyka użytkownika

            req.session.userId = userId; //przypisanie id do sesji
            req.session.role = role; //przypisanie roli do sesji
            req.session.save()

            //przekierowanie do poprzedniej strony z nowym ciastkiem
            res.cookie('user', role, { signed: true });

            var returnUrl = req.query.returnUrl || '/';
            console.log(returnUrl);

            res.redirect(`${returnUrl}`);
        }
        else {
            // błędne logowanie
            res.render( 'login', { message : "Zła nazwa użytkownika lub hasło", role: "", layout: 'main_layout' } );
        }

    } catch (err) {
        console.error('Chuj przy logowaniu:', err)
    }
});

//strona koszyka
app.get('/bag', authorize('użytkownik'), (req, res) => {
    res.render('bag', {/*role: req.query.role,*/ layout: 'main_layout'});
});

//strona listy użytkowników
app.get('/userList', authorize('admin'), (req, res) => {
    res.render('userList', {role: req.session.role, layout: 'main_layout'});
})

function clearAtLogout(req) {
    req.session.userId = null;
    req.session.role = null;
    bagRepo.clearBag();
}

//wylogowanie
app.get('/logout', authorize('użytkownik', 'admin'), (req, res) => {
    clearAtLogout(req);
    res.cookie('user', '', { maxAge: -1} );
    res.redirect(`/`);
})

http.createServer( app ).listen(3000);
console.log('started');