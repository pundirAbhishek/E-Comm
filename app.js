const express = require('express'),
        bodyParser = require('body-parser'),
        cookieSession = require('cookie-session'),
        authRouter = require('./routes/admin/auth');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    keys: ['dsfnfcnissdfs3o1323'] // Random Characters (Keys property is used to 
                                    //encrypt all the info inside the cookie)
}));

app.use(authRouter);

app.listen(3000, () => {
    console.log('Server Started');
});