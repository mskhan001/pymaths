// const express = require('express')
// const app = express()
// app.use(express.static('pymaths'))
// app.listen(8080, () => console.log('Server running on port 8080'))


//dependencies
const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser =require('body-parser');
const favicon = require('serve-favicon');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt  = require('bcryptjs');
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const MongoStore = require('connect-mongo')(session);
const sslRedirect = require('heroku-ssl-redirect');


//require config
const config = require('./config/config');

//require db config
const db = require('./config/database');

//connect db
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, function(err){
	if(err) {
		helper.logError(err.message);
		console.log(err);
	}
	console.log('Database Connected');
})	

// app init
const app = express();

//load helpers
const {
	formatDate,
	bothEqual,
	isPageOne,
	ifPageNotOne
} = require('./config/hbs');

//middlewares
app.set('port', config.port);
app.engine('handlebars', exphbs({
	defaultLayout: 'main',
	helpers: {
		formatDate: formatDate,
		bothEqual: bothEqual,
		isPageOne: isPageOne,
		ifPageNotOne: ifPageNotOne
	}
}));
app.set('view engine', 'handlebars');
// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } //1 month
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/assets', express.static(path.join(__dirname, 'public')));
// app.use(favicon(path.join(__dirname, 'public', 'logoS.png')));
app.use(flash());
app.use(sslRedirect());

//global consts
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.info_msg = req.flash('info_msg');
	res.locals.warn_msg = req.flash('warn_msg');
	res.locals.error = req.flash('error');
	res.locals.session = req.session;
	res.locals.user = req.user || null;
	next();
})



//configuration routes
require('./routes/router')(app)


// app.use((req, res, next) => {
// 	const error = new Error('Not Found');
// 	error.status = 404;
// 	next(error);
// });

// app.use((error, req, res, next) => {
// 	res.status(error.status || 500);
// 	if(error.status == 404){
// 		res.sendFile(path.join(__dirname, 'public', 'custom_views/404.html'));
// 	} else {
// 		res.sendFile(path.join(__dirname, 'public', 'custom_views/500.html'));
// 	}
// });

//start server
app.listen(app.get('port'), function(err){
	if(err) throw err;
	console.log(`I\'m listening on port ${app.get('port')}`);
})