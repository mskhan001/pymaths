



module.exports = function(app){

	
	var home = require('./home');
	app.use('/', home);

	var admin = require('./admin');
	app.use('/admin', admin);


}