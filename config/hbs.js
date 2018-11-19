//dependencies
var moment = require('moment');

module.exports = {
	formatDate: function(date, format){
		return moment(date).format(format);
	},
	isPageOne: function(page, options){
		return (page == 1) ? options.fn(this) : options.inverse(this);
	},
	ifPageNotOne: function(i, options){;
		return (i !== 1) ? options.fn(this) : options.inverse(this);
	},
	bothEqual: function(current, pages, options){
		return (current == pages) ? options.fn(this) : options.inverse(this);
	}
}