//dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DownloadSchema = new Schema({
	grade: {
		type: Schema.Types.ObjectId,
		ref: 'Grade'
	},
	course: {
		type: Schema.Types.ObjectId,
		ref: 'Course'
	},
	year: {
		type: Schema.Types.ObjectId,
		ref: 'Years'
	},
	modelType: {
		type: String,
		required: true
	},
	file: {
		type: String,
		required: true
	},
	paperType: {
		type: String
	},
	createdDate:{
		type: Date,
		default: Date.now
	}
})


var GradeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	createdDate:{
		type: Date,
		default: Date.now
	}
})

var CourseSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	createdDate:{
		type: Date,
		default: Date.now
	}
})

var YearsSchema = new Schema({
	year: {
		type: Number,
		required: true
	},
	createdDate:{
		type: Date,
		default: Date.now
	}
})

mongoose.model('Download', DownloadSchema);
mongoose.model('Grade', GradeSchema);
mongoose.model('Course', CourseSchema);
mongoose.model('Years', YearsSchema);




