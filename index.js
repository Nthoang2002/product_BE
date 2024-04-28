const express = require('express');
var path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('express-flash');
var cookieParser = require('cookie-parser')
var session = require('express-session')


require("dotenv").config();

const app = express();
const port = process.env.PORT; //port=3000

app.use(methodOverride('_method'))

//Database
const database = require("./config/database");

const systemConfig = require("./config/system");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


//Khai báo đường link gán tới route
const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");

database.connect();



// Khai báo pug
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
// flash s
app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End flash 


// TinyMCE 
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE 


//App localS Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin

app.use(express.static(`${__dirname}/public`));

//Router
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});