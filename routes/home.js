//dependencies
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const moment = require('moment');
const fs = require('fs');

require('../models/Model');
const Download = mongoose.model('Download');
const Grade = mongoose.model('Grade');
const Course = mongoose.model('Course');
const Years = mongoose.model('Years');

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

// show home
router.get('/', function(req, res, next){
	res.render('front-end/index');
})

// show home
router.get('/downloads', function(req, res, next){
	 
  Download.find({})
  .distinct('grade')
  .then(function(grades){

    var num = [];

    for(var x=0; x<grades.length; x++){
      getName(grades[x], x, function(){
        if(num.length == grades.length){
          res.render('front-end/downloads', {
            grades: num
          })
        }
      })
    }

    function getName(gradeId, index, cb){
      Grade.findOne({
        _id: gradeId
      })
      .then(function(doc){
        let newItem = {
          name: doc.name,
          _id: doc._id
        }
        num.push(newItem);
        cb();
      })
      .catch(function(err){
        console.log(err);
      })
    }
    
  })
  .catch(function(err){
    console.log(err);
  })

})

router.post('/downloads', function(req, res, next){

  if(req.body.modeltype == 'syllabus'){
    Download.findOne({
      grade: req.body.grade,
      course: req.body.course,
      modelType: req.body.modeltype
    })
    .then(function(doc){
      res.redirect(doc.file);
    })
    .catch(function(err){
      console.log(err);
    })

  } else {

    Download.findOne({
      grade: req.body.grade,
      course: req.body.course,
      modelType: req.body.modeltype,
      year: req.body.year,
      paperType: req.body.paper_type
    })
    .then(function(doc){
      res.redirect(doc.file);
    })
    .catch(function(err){
      console.log(err);
    })
  }

})

router.get('/asset', function(request, response){
  var params = {
    Bucket: "rkrshellapp", 
    Key: "pymaths/1542378117991-AppFlow.pdf"
  };
   s3.getObject(params, function(err, data) {
   if (err) {
      console.log(err, err.stack); 

    }// an error occurred
   else {
    var doc = new jsPDF()
      
      let org = data.Body.toString('utf-8');
      fs.readFile(org, function (err,dataa){
         response.contentType("application/pdf");
         response.send(dataa);
      });
    }          // successful response
  
 });
  // var tempFile="https://rkrshellapp.s3.amazonaws.com/pymaths/1542378117991-AppFlow.pdf";
  
});

router.get('/ajax/downloads/:val/grade', function(req, res, next){
  Download.find({
    grade: req.params.val
  })
  .distinct('course')
  .then(function(docs){
    var num = [];

    for(var x=0; x<docs.length; x++){
      getName(docs[x], x, function(){
        if(num.length == docs.length){
          console.log(num);
          res.send(num);
        }
      })
    }

    function getName(courseId, index, cb){
      Course.findOne({
        _id: courseId
      })
      .then(function(doc){
        let newItem = {
          name: doc.name,
          _id: doc._id
        }
        num.push(newItem);
        cb();
      })
      .catch(function(err){
        console.log(err);
      })
    }
  })
  .catch(function(err){
    console.log(err);
  })

})

router.get('/ajax/downloads/syllabus/:gval/:cval/course', function(req, res, next){

  Download.find({
    grade: req.params.gval,
    course: req.params.cval,
    modelType: 'syllabus'
  })
  .then(function(docs){
    if(!docs.length){
      return res.send(null);
    }
    res.send(docs);

  })
  .catch(function(err){
    console.log(err);
  })

})

router.get('/ajax/downloads/:gval/:cval/:modeltype/course', function(req, res, next){
  
  Download.find({
    grade: req.params.gval,
    course: req.params.cval,
    modelType: req.params.modeltype
  })
  .distinct('year')
  .then(function(docs){

    var num = [];

    for(var x=0; x<docs.length; x++){
      getName(docs[x], x, function(){
        if(num.length == docs.length){
          console.log(num);
          res.send(num);
        }
      })
    }

    function getName(yearId, index, cb){
      Years.findOne({
        _id: yearId
      })
      .then(function(doc){
        let newItem = {
          year: doc.year,
          _id: doc._id
        }
        num.push(newItem);
        cb();
      })
      .catch(function(err){
        console.log(err);
      })
    }
  })
  .catch(function(err){
    console.log(err);
  })
})

router.get('/ajax/downloads/:gval/:cval/:year/:modeltype/papertype', function(req, res, next){
  Download.find({
    grade: req.params.gval,
    course: req.params.cval,
    modelType: req.params.modeltype,
    year: req.params.year
  })
  .then(function(docs){
    res.send(docs)
  })
  .catch(function(err){
    console.log(err);
  })
})

router.get('/engineeringmaths', function(req, res, next){

  res.render('front-end/engineeringmaths/engineeringmaths');

})


router.get('/engineeringmaths/realanalysis', function(req, res, next){

  res.render('front-end/engineeringmaths/realanalysis');

})

router.get('/engineeringmaths/calculus', function(req, res, next){

  res.render('front-end/engineeringmaths/calculus');

})  

router.get('/engineeringmaths/algebra', function(req, res, next){

  res.render('front-end/engineeringmaths/algebra');

})  


router.get('/engineeringmaths/analyticgeometry', function(req, res, next){

  res.render('front-end/engineeringmaths/analyticgeometry');

})  


router.get('/engineeringmaths/complexanalysis', function(req, res, next){

  res.render('front-end/engineeringmaths/complexanalysis');

})  


router.get('/engineeringmaths/engineeringmathscomplete', function(req, res, next){

  res.render('front-end/engineeringmaths/engineeringmathscomplete');

})  


router.get('/engineeringmaths/linearalgebra', function(req, res, next){

  res.render('front-end/engineeringmaths/linearalgebra');

})  


router.get('/engineeringmaths/linearprogramming', function(req, res, next){

  res.render('front-end/engineeringmaths/linearprogramming');

})  


router.get('/engineeringmaths/numericalmethods', function(req, res, next){

  res.render('front-end/engineeringmaths/numericalmethods');

})  


router.get('/engineeringmaths/ordinarydifferentialquations', function(req, res, next){

  res.render('front-end/engineeringmaths/ordinarydifferentialquations');

})  


router.get('/engineeringmaths/partialdifferentialquations', function(req, res, next){

  res.render('front-end/engineeringmaths/partialdifferentialquations');

})  


router.get('/engineeringmaths/vectoranalysis', function(req, res, next){

  res.render('front-end/engineeringmaths/vectoranalysis');

})  





module.exports = router;



