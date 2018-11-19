var cfg = {};

//port
cfg.port = process.env.PORT || 8080;

//AWS Keys for storage - Nikhil
cfg.accessAwsKey = 'AKIAI7DPNYRPS6ATS4WQ';
cfg.secretAwsKey = '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';
cfg.awsRegion = 'us-east-1';

//session secret
cfg.sessionSecret = 'bkjdbsady732749283472ndskla';


cfg.perPage = 10;

cfg.paginationTabCountI = function(page){
	var i = (Number(page) > 5) ? (Number(page) - 4) : 1;
	return i;
}

//export
module.exports = cfg;