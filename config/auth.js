module.exports = {
	
	ensureAuthenticated: function(req, res, next){
		if(req.session.isUser == true){
			next();
		} else {
			req.flash('error_msg', 'Not Authorized');
			res.redirect('/');
		}
	}
}





















