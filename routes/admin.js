//dependencies
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const {
	ensureAuthenticated
} = require('../config/auth');

require('../models/Model');
const Download = mongoose.model('Download');
const Grade = mongoose.model('Grade');
const Course = mongoose.model('Course');
const Year = mongoose.model('Years');

//require config
const config = require('../config/config');

//bucket cred
const s3 = new aws.S3({ 
    "accessKeyId": config.accessAwsKey, 
    "secretAccessKey": config.secretAwsKey, 
    "region": config.awsRegion
})

//init 
const uploadFileDownload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'rkrshellapp',
        acl: 'public-read',
        limits: { fileSize: 1000000 },
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
          let newFileName = Date.now() + "-" + file.originalname;
          let fullPath = 'pymaths/'+ newFileName;
          cb(null, fullPath);
        }
    })
}).single('file');


router.get('/auth', function(req, res, next){

	res.render('admin/login', {
		layout: false,
        bodyclass: 'login',
        title: 'Admin Home'
	})

})

router.post('/auth', function(req, res, next){

	if(req.body.username.toString() == 'admin' && req.body.password.toString() == 'admin321'){
		req.session.isUser = true;
		return res.redirect('/admin/home');
	} else {
		req.flash('error_msg', 'In-correct Credentials');
		return res.redirect('/admin/auth');
	}

})

router.get('/home', ensureAuthenticated, function(req, res, next){

	Download
    .count()
    .then(function(count){
    	res.render('admin/index', {
			layout: 'admin',
	        bodyclass: 'nav-md',
	        title: 'Admin Home',
	        count: count
		})
    })
	.catch(function(err){
		console.log(err);
	})

	

})

router.get('/logout', ensureAuthenticated, function(req, res, next){

	req.session.isUser = false;
	return res.redirect('/');

})

router.get('/downloads', ensureAuthenticated, function(req, res, next){

	let page = req.query.page || 1;

	Download.find({})
	.skip((config.perPage * page) - config.perPage)
    .limit(config.perPage)
    .sort({'createdDate': 'desc'})
    .populate(['grade', 'course', 'year'])
	.then(function(downloads){
		Download
		.count()
        .then(function(count){
			Grade.find({})
			.then(function(grades){
				Course.find({})
				.then(function(courses){
					Year.find({})
					.then(function(years){
						var i = config.paginationTabCountI(page);
			            var ceil = Math.ceil(count / config.perPage);
			            var pageArr = [];
			            for(; i <= (Number(page) + 4) && i <= ceil; i++){
			                pageArr.push(i);
			            }
						res.render('admin/downloads',{
							layout: 'admin',
					    	bodyclass: 'nav-md',
					    	title: 'Downloads',
					    	grades: grades,
					    	courses: courses,
					    	years: years,
					    	downloads: downloads,
					    	perPage: config.perPage,
			                current: page,
			                i: i,
			                totalCount: count,
			                pages: ceil,
			                pageArr: pageArr
						});
					})
					.catch(function(err){
						console.log(err);
					})
				})
				.catch(function(err){
					console.log(err);
				})
			})
			.catch(function(err){
				console.log(err);
			})
		})
		.catch(function(err){
			console.log(err);
		})
	})
	.catch(function(err){
		console.log(err);
	})

	

	

})


router.post('/download', ensureAuthenticated, function(req, res, next){

	uploadFileDownload(req, res, function(err){
		let newItem = {
			grade: req.body.grade,
			course: req.body.course,
			file: req.file.location,
			modelType: req.body.modeltype
		}
		if(newItem.modelType == 'previousyear'){
			newItem.year = req.body.year;
			newItem.paperType = req.body.papertype;
		}

		new Download(newItem)
		.save()
		.then(function(doc){
			req.flash('success_msg', 'New Record Added');
			return res.redirect('/admin/downloads');
		})
		.catch(function(err){
			console.log(err);
		})
	})

})


router.get('/downloads/:id/download', function(req, res, next){


	Download
	.findOne({_id: req.params.id})
	.then(function(doc){
		if(!doc){
			req.flash('error_msg', 'File not found');
			return res.redirect('/admin/downloads');
		}
		req.flash('success_msg', 'File has been downloaded.')
		return res.redirect(doc.file);
	})
	.catch(function(err){
		console.log(err);
	})


})

router.get('/downloads/:id/delete', ensureAuthenticated, function(req, res, next){


	Download
	.findOne({_id: req.params.id})
	.then(function(doc){
		if(!doc){
			return res.send(false);
		}
		doc.remove()
		.then(function(rec){
			res.send(true);
		})
		.catch(function(err){
			console.log(err);
		})
	})
	.catch(function(err){
		console.log(err);
	})


})


router.get('/settings', ensureAuthenticated, function(req, res, next){
	Grade.find({})
	.then(function(grades){
		Course.find({})
		.then(function(courses){
			Year.find({})
			.then(function(years){
				res.render('admin/settings',{
					layout: 'admin',
			    	bodyclass: 'nav-md',
			    	title: 'Settings',
			    	grades: grades,
			    	courses: courses,
			    	years: years
				});
			})
			.catch(function(err){
				console.log(err);
			})
		})
		.catch(function(err){
			console.log(err);
		})
	})
	.catch(function(err){
		console.log(err);
	})
})

router.post('/settings/grade', ensureAuthenticated, function(req, res, next){

	let newItem = {
		name: req.body.name
	}
	new Grade(newItem)
	.save()
	.then(function(doc){
		req.flash('success_msg', 'New Record Added');
		return res.redirect('/admin/settings');
	})
	.catch(function(err){
		console.log(err);
	})

})

router.post('/settings/course', ensureAuthenticated, function(req, res, next){

	let newItem = {
		name: req.body.name
	}
	new Course(newItem)
	.save()
	.then(function(doc){
		req.flash('success_msg', 'New Record Added');
		return res.redirect('/admin/settings');
	})
	.catch(function(err){
		console.log(err);
	})

})

router.post('/settings/year', ensureAuthenticated, function(req, res, next){

	let newItem = {
		year: req.body.year
	}
	new Year(newItem)
	.save()
	.then(function(doc){
		req.flash('success_msg', 'New Record Added');
		return res.redirect('/admin/settings');
	})
	.catch(function(err){
		console.log(err);
	})

})

router.get('/ajax/year', ensureAuthenticated, function(req, res, next){

	Year.find({})
	.select('year')
	.then(function(years){
		res.send(years)
	})
	.catch(function(err){
		console.log(err);
	})

})




module.exports = router;