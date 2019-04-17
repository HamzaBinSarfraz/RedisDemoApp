const express = require('express');
const bodyParser = require('body-parser');
const expressHandleBars = require('express-handlebars');
const methodOverRide = require('method-override');
const path = require('path');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});

// set port 
const port = process.env.PORT || 3000;

//init app 
const app = express();

// view engine 
app.engine('handlebars', expressHandleBars({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//method override
app.use(methodOverRide('_method'));

// Search Page
app.get('/', function (req, res, next) {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', function (req, res, next) {
    let id = req.body.id;

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User Page
app.get('/user/add', function (req, res, next) {
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function (req, res, next) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Delete User
app.delete('/user/delete/:id', function (req, res, next) {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, function () {
    console.log('Server started on port ' + port);
});