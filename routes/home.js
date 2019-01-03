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
  res.render('front-end/engineeringmaths');
})

router.get('/engineeringmaths/realanalysis', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis');
})

router.get('/engineeringmaths/realanalysis/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/coursestart');
})
router.get('/engineeringmaths/realanalysis/sequence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence');
})
router.get('/engineeringmaths/realanalysis/sequence/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence/introduction');
})
router.get('/engineeringmaths/realanalysis/sequence/limitofasequence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence/limitofasequence');
})
router.get('/engineeringmaths/realanalysis/sequence/cauchysequence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence/cauchysequence');
})
router.get('/engineeringmaths/realanalysis/sequence/completenessofrealline', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence/completenessofrealline');
})
router.get('/engineeringmaths/realanalysis/sequence/quiz1sequence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/sequence/quiz1sequence');
})

router.get('/engineeringmaths/realanalysis/series', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/series');
})
router.get('/engineeringmaths/realanalysis/series/seriesanditsconvergence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/series/seriesanditsconvergence');
})
router.get('/engineeringmaths/realanalysis/series/absoluteandconditionalconvergenceofseriesofrealandcomplexterms', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/series/absoluteandconditionalconvergenceofseriesofrealandcomplexterms');
})
router.get('/engineeringmaths/realanalysis/series/rearrangementofseries', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/series/rearrangementofseries');
})
router.get('/engineeringmaths/realanalysis/series/quiz2series', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/series/quiz2series');
})

router.get('/engineeringmaths/realanalysis/continuity', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/continuity');
})
router.get('/engineeringmaths/realanalysis/continuity/continuityanduniformcontinuityiffunctions', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/continuity/continuityanduniformcontinuityiffunctions');
})
router.get('/engineeringmaths/realanalysis/continuity/propertiesofcontinuousfunctionsoncompactsets', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/continuity/propertiesofcontinuousfunctionsoncompactsets');
})
router.get('/engineeringmaths/realanalysis/continuity/quiz3continuity', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/continuity/quiz3continuity');
})

router.get('/engineeringmaths/realanalysis/integralcalculus', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/integralcalculus');
})
router.get('/engineeringmaths/realanalysis/integralcalculus/riemannintegral', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/integralcalculus/riemannintegral');
})
router.get('/engineeringmaths/realanalysis/integralcalculus/improperintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/integralcalculus/improperintegrals');
})
router.get('/engineeringmaths/realanalysis/integralcalculus/fundamentaltheoremofintegralcalculus', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/integralcalculus/fundamentaltheoremofintegralcalculus');
})
router.get('/engineeringmaths/realanalysis/integralcalculus/quiz4integralcalculus', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/integralcalculus/quiz4integralcalculus');
})

router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries');
})
router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries/uniformconvergence', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries/uniformconvergence');
})
router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries/continuity', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries/continuity');
})
router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries/differentiability', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries/differentiability');
})
router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries/integrability', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries/integrability');
})
router.get('/engineeringmaths/realanalysis/analysisofsequenceandseries/quiz5analysisofsequenceandseries', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/analysisofsequenceandseries/quiz5analysisofsequenceandseries');
})

router.get('/engineeringmaths/realanalysis/partialderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/partialderivatives');
})
router.get('/engineeringmaths/realanalysis/partialderivatives/partialderivativesoffunctionsofseveral(twoorthree)variables', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/partialderivatives/partialderivativesoffunctionsofseveral(twoorthree)variables');
})
router.get('/engineeringmaths/realanalysis/partialderivatives/maximaandminima', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/partialderivatives/maximaandminima');
})
router.get('/engineeringmaths/realanalysis/partialderivatives/quiz6partialderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/realanalysis/partialderivatives/quiz6partialderivatives');
})


router.get('/engineeringmaths/calculus', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus');
})
router.get('/engineeringmaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/coursestart');
})

router.get('/engineeringmaths/calculus/functionsofarealvariable', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/introduction');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/limits', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/limits');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/continuity', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/continuity');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/differentiability', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/differentiability');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/meanvaluetheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/meanvaluetheorem');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/taylorstheoremwithremainders', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/taylorstheoremwithremainders');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/indeterminateforms', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/indeterminateforms');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/maximaandminima', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/maximaandminima');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/lagrangesmethodofmultipliers', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/lagrangesmethodofmultipliers');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/jacobian', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/jacobian');
})
router.get('/engineeringmaths/calculus/functionsofarealvariable/quiz1functionsofarealvariable', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsofarealvariable/quiz1functionsofarealvariable');
})

router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/limits', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/limits');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/continuity', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/continuity');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/partialderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/partialderivatives');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/maximaandminima', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/maximaandminima');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/lagrangesmethodofmultipliers', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/lagrangesmethodofmultipliers');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/jacobian', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/jacobian');
})
router.get('/engineeringmaths/calculus/functionsoftwoorthreevariables/quiz2functionsoftwoorthreevariables', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/functionsoftwoorthreevariables/quiz2functionsoftwoorthreevariables');
})

router.get('/engineeringmaths/calculus/integrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals');
})
router.get('/engineeringmaths/calculus/integrals/riemannsdefinitionofdefiniteintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/riemannsdefinitionofdefiniteintegrals');
})
router.get('/engineeringmaths/calculus/integrals/indefiniteintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/indefiniteintegrals');
})
router.get('/engineeringmaths/calculus/integrals/infiniteintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/infiniteintegrals');
})
router.get('/engineeringmaths/calculus/integrals/improperintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/improperintegrals');
})
router.get('/engineeringmaths/calculus/integrals/doubleintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/doubleintegrals');
})
router.get('/engineeringmaths/calculus/integrals/tripleintegrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/tripleintegrals');
})
router.get('/engineeringmaths/calculus/integrals/quiz3integrals', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/integrals/quiz3integrals');
})

router.get('/engineeringmaths/calculus/areassurfacesandvolumes', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/areassurfacesandvolumes');
})
router.get('/engineeringmaths/calculus/areassurfacesandvolumes/areas', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/areassurfacesandvolumes/areas');
})
router.get('/engineeringmaths/calculus/areassurfacesandvolumes/surfaces', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/areassurfacesandvolumes/surfaces');
})
router.get('/engineeringmaths/calculus/areassurfacesandvolumes/volumes', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/areassurfacesandvolumes/volumes');
})
router.get('/engineeringmaths/calculus/areassurfacesandvolumes/quiz4areassurfacesandvolumes', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/areassurfacesandvolumes/quiz4areassurfacesandvolumes');
})

router.get('/engineeringmaths/vectoranalysis', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis');
})
router.get('/engineeringmaths/vectoranalysis/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/coursestart');
})

router.get('/engineeringmaths/vectoranalysis/scalarandvectorfields', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/scalarandvectorfields');
})
router.get('/engineeringmaths/vectoranalysis/scalarandvectorfields/scalarfields', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/scalarandvectorfields/scalarfields');
})
router.get('/engineeringmaths/vectoranalysis/scalarandvectorfields/vectorfields', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/scalarandvectorfields/vectorfields');
})
router.get('/engineeringmaths/vectoranalysis/scalarandvectorfields/differentiationofavectorfieldofascalarvariable', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/scalarandvectorfields/differentiationofavectorfieldofascalarvariable');
})
router.get('/engineeringmaths/vectoranalysis/scalarandvectorfields/quiz1scalarandvectorfields', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/scalarandvectorfields/quiz1scalarandvectorfields');
})

router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl');
})
router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/cartesianandcylindricalcoordinates', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/cartesianandcylindricalcoordinates');
})
router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/gradient', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/gradient');
})
router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/divergence', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/divergence');
})
router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/curl', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/curl');
})
router.get('/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/quiz2gradientdivergenceandcurl', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/gradientdivergenceandcurl/quiz2gradientdivergenceandcurl');
})

router.get('/engineeringmaths/vectoranalysis/higherorderderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/higherorderderivatives');
})
router.get('/engineeringmaths/vectoranalysis/higherorderderivatives/higherorderderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/higherorderderivatives/higherorderderivatives');
})
router.get('/engineeringmaths/vectoranalysis/higherorderderivatives/quiz3higherorderderivatives', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/higherorderderivatives/quiz3higherorderderivatives');
})

router.get('/engineeringmaths/vectoranalysis/identitiesandequations', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/identitiesandequations');
})
router.get('/engineeringmaths/vectoranalysis/identitiesandequations/vectoridentities', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/identitiesandequations/vectoridentities');
})
router.get('/engineeringmaths/vectoranalysis/identitiesandequations/vectorequations', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/identitiesandequations/vectorequations');
})
router.get('/engineeringmaths/vectoranalysis/identitiesandequations/quiz4identitiesandequations', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/identitiesandequations/quiz4identitiesandequations');
})

router.get('/engineeringmaths/vectoranalysis/applicationtogeometry', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/applicationtogeometry');
})
router.get('/engineeringmaths/vectoranalysis/applicationtogeometry/curvesinspace', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/applicationtogeometry/curvesinspace');
})
router.get('/engineeringmaths/vectoranalysis/applicationtogeometry/curvatureandtorsion', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/applicationtogeometry/curvatureandtorsion');
})
router.get('/engineeringmaths/vectoranalysis/applicationtogeometry/serretfrenetsformulae', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/applicationtogeometry/serretfrenetsformulae');
})
router.get('/engineeringmaths/vectoranalysis/applicationtogeometry/quiz5applicationtotrigonometry', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/applicationtogeometry/quiz5applicationtotrigonometry');
})

router.get('/engineeringmaths/vectoranalysis/theoremsandidentities', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/theoremsandidentities');
})
router.get('/engineeringmaths/vectoranalysis/theoremsandidentities/gaussstheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/theoremsandidentities/gaussstheorem');
})
router.get('/engineeringmaths/vectoranalysis/theoremsandidentities/stokestheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/theoremsandidentities/stokestheorem');
})
router.get('/engineeringmaths/vectoranalysis/theoremsandidentities/greensidentities', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/theoremsandidentities/greensidentities');
})
router.get('/engineeringmaths/vectoranalysis/theoremsandidentities/quiz6theoremsandidentities', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/theoremsandidentities/quiz6theoremsandidentities');
})


router.get('/engineeringmaths/complexanalysis', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis');
})
router.get('/engineeringmaths/complexanalysis/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/coursestart');
})

router.get('/engineeringmaths/complexanalysis/analyticfunctions', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions');
})
router.get('/engineeringmaths/complexanalysis/analyticfunctions/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions/introduction');
})
router.get('/engineeringmaths/complexanalysis/analyticfunctions/cauchyriemannequations', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions/cauchyriemannequations');
})
router.get('/engineeringmaths/complexanalysis/analyticfunctions/cauchystheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions/cauchystheorem');
})
router.get('/engineeringmaths/complexanalysis/analyticfunctions/cauchysintegralformula', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions/cauchysintegralformula');
})
router.get('/engineeringmaths/complexanalysis/analyticfunctions/quiz1analyticfunctions', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/analyticfunctions/quiz1analyticfunctions');
})

router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction');
})
router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/introduction');
})
router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/singularities', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/singularities');
})
router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/taylorsseries', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/taylorsseries');
})
router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/laurentsseries', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/laurentsseries');
})
router.get('/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/quiz2powerseriesrepresentationofananalyticfunction', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/quiz2powerseriesrepresentationofananalyticfunction');
})

router.get('/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration');
})
router.get('/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/cauchysresiduetheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/cauchysresiduetheorem');
})
router.get('/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/contourintegration', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/contourintegration');
})
router.get('/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/quiz3cauchysresiduetheoremandcontourintegration', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/quiz3cauchysresiduetheoremandcontourintegration');
})


router.get('/engineeringmaths/analyticgeometry', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry');
})
router.get('/engineeringmaths/analyticgeometry/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/coursestart');
})

router.get('/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates');
})
router.get('/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates/cartesianandpolarcoordinatesinthreedimensions', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates/cartesianandpolarcoordinatesinthreedimensions');
})
router.get('/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates/quiz1cartesianandpolarcoordinates', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/cartesianandpolarcoordinates/quiz1cartesianandpolarcoordinates');
})

router.get('/engineeringmaths/analyticgeometry/seconddegreeequations', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/seconddegreeequations');
})
router.get('/engineeringmaths/analyticgeometry/seconddegreeequations/seconddegreeequationsinthreevariables', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/seconddegreeequations/seconddegreeequationsinthreevariables');
})
router.get('/engineeringmaths/analyticgeometry/seconddegreeequations/reductiontocanonicalforms', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/seconddegreeequations/reductiontocanonicalforms');
})
router.get('/engineeringmaths/analyticgeometry/seconddegreeequations/quiz2seconddegreeequations', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/seconddegreeequations/quiz2seconddegreeequations');
})

router.get('/engineeringmaths/analyticgeometry/straightlines', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/straightlines');
})
router.get('/engineeringmaths/analyticgeometry/straightlines/straightlines', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/straightlines/straightlines');
})
router.get('/engineeringmaths/analyticgeometry/straightlines/shortestdistancebetweentwoskewlines', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/straightlines/shortestdistancebetweentwoskewlines');
})
router.get('/engineeringmaths/analyticgeometry/straightlines/quiz3straightlines', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/straightlines/quiz3straightlines');
})

router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/plane', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/plane');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/sphere', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/sphere');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cone', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cone');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cylinder', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cylinder');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/paraboloid', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/paraboloid');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/ellipsoid', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/ellipsoid');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/hyperboloid', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/hyperboloid');
})
router.get('/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/quiz4geometricobjectsofoneandtwosheetsandtheirproperties', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/quiz4geometricobjectsofoneandtwosheetsandtheirproperties');
})


router.get('/engineeringmaths/linearalgebra', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra');
})
router.get('/engineeringmaths/linearalgebra/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/coursestart');
})

router.get('/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes');
})
router.get('/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/lineardependenceandindependence', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/lineardependenceandindependence');
})
router.get('/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/vectorspacesandsubspaces', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/vectorspacesandsubspaces');
})
router.get('/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/basisanddimension', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/basisanddimension');
})
router.get('/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/quiz1ectorspacesoverreal(r)andcomplex(c)planes', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/quiz1ectorspacesoverreal(r)andcomplex(c)planes');
})

router.get('/engineeringmaths/linearalgebra/lineartransformations', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/lineartransformations');
})
router.get('/engineeringmaths/linearalgebra/lineartransformations/rankandnullity', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/lineartransformations/rankandnullity');
})
router.get('/engineeringmaths/linearalgebra/lineartransformations/matrixofalineartransformation', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/lineartransformations/matrixofalineartransformation');
})
router.get('/engineeringmaths/linearalgebra/lineartransformations/quiz2lineartransformations', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/lineartransformations/quiz2lineartransformations');
})

router.get('/engineeringmaths/linearalgebra/algebraofmatrices', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/rowandcolumnreduction', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/rowandcolumnreduction');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/echelonform', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/echelonform');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/coongruenceandsimilarity', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/coongruenceandsimilarity');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/rankofamatrix', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/rankofamatrix');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/inverseofamatrix', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/inverseofamatrix');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/solutionofasystemoflinearequations', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/solutionofasystemoflinearequations');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/eigenvaluesandeigenvectors', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/eigenvaluesandeigenvectors');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/characteristicpolynomial', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/characteristicpolynomial');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/cayleyhamiltontheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/cayleyhamiltontheorem');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/symmetricandskewsymmetricmatrices', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/symmetricandskewsymmetricmatrices');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/hermitianandskewhermitianmatrices', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/hermitianandskewhermitianmatrices');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/orthogonalandunitarymatricesandtheireigenvalues', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/orthogonalandunitarymatricesandtheireigenvalues');
})
router.get('/engineeringmaths/linearalgebra/algebraofmatrices/quiz3algebraofmatrices', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/algebraofmatrices/quiz3algebraofmatrices');
})


router.get('/engineeringmaths/ordinarydifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations');
})
router.get('/engineeringmaths/ordinarydifferentialequations/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/coursestart');
})

router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/formulationofdifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/formulationofdifferentialequations');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderandfirstdegree', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderandfirstdegree');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/integratingfactor', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/integratingfactor');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/orthogonaltrajectory', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/orthogonaltrajectory');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderbutnotoffirstdegree', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderbutnotoffirstdegree');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/clairautsequation', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/clairautsequation');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/singularsolution', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/singularsolution');
})
router.get('/engineeringmaths/ordinarydifferentialequations/firstorderodes/quiz1firstorderodes', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/firstorderodes/quiz1firstorderodes');
})

router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/secondandhigherorderlinearequationswithconstantcoefficients', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/secondandhigherorderlinearequationswithconstantcoefficients');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/complementaryfunction', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/complementaryfunction');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/particularintegralandgeneralsolution', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/particularintegralandgeneralsolution');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/secondorderlinearequationswithvariablecoefficients', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/secondorderlinearequationswithvariablecoefficients');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/eulercauchyequation', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/eulercauchyequation');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/determinationofcompletesolutionwhenonesolutionisknownusingmethodofvariationofparameters', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/determinationofcompletesolutionwhenonesolutionisknownusingmethodofvariationofparameters');
})
router.get('/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/quiz2secondandhigherorderodes', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/secondandhigherorderodes/quiz2secondandhigherorderodes');
})

router.get('/engineeringmaths/ordinarydifferentialequations/laplacetransform', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/laplacetransform');
})
router.get('/engineeringmaths/ordinarydifferentialequations/laplacetransform/laplaceandinverselaplacetransformsandtheirproperties', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/laplacetransform/laplaceandinverselaplacetransformsandtheirproperties');
})
router.get('/engineeringmaths/ordinarydifferentialequations/laplacetransform/laplacetransformsofelementaryfunctions', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/laplacetransform/laplacetransformsofelementaryfunctions');
})
router.get('/engineeringmaths/ordinarydifferentialequations/laplacetransform/applicationtoinitialvalueproblemsfor2ndorderlinearequationswithconstantcoefficients', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/laplacetransform/applicationtoinitialvalueproblemsfor2ndorderlinearequationswithconstantcoefficients');
})
router.get('/engineeringmaths/ordinarydifferentialequations/laplacetransform/quiz3laplacetransform', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations/laplacetransform/quiz3laplacetransform');
})


router.get('/engineeringmaths/partialdifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations');
})
router.get('/engineeringmaths/partialdifferentialequations/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/coursestart');
})

router.get('/engineeringmaths/partialdifferentialequations/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/introduction');
})
router.get('/engineeringmaths/partialdifferentialequations/introduction/familyofsurfacesinthreedimensions', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/introduction/familyofsurfacesinthreedimensions');
})
router.get('/engineeringmaths/partialdifferentialequations/introduction/formulationofpartialdifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/introduction/formulationofpartialdifferentialequations');
})
router.get('/engineeringmaths/partialdifferentialequations/introduction/quiz1introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/introduction/quiz1introduction');
})

router.get('/engineeringmaths/partialdifferentialequations/firstorderpdes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/firstorderpdes');
})
router.get('/engineeringmaths/partialdifferentialequations/firstorderpdes/solutionofquasilinearpartialdifferentialequationsofthefirstorder', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/firstorderpdes/solutionofquasilinearpartialdifferentialequationsofthefirstorder');
})
router.get('/engineeringmaths/partialdifferentialequations/firstorderpdes/cauchysmethodofcharacteristics', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/firstorderpdes/cauchysmethodofcharacteristics');
})
router.get('/engineeringmaths/partialdifferentialequations/firstorderpdes/quiz2firstorderodes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/firstorderpdes/quiz2firstorderodes');
})

router.get('/engineeringmaths/partialdifferentialequations/secondorderpdes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/secondorderpdes');
})
router.get('/engineeringmaths/partialdifferentialequations/secondorderpdes/linearpartialdifferentialequationsofthesecondorderwithconstantcoefficients', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/secondorderpdes/linearpartialdifferentialequationsofthesecondorderwithconstantcoefficients');
})
router.get('/engineeringmaths/partialdifferentialequations/secondorderpdes/canonicalforms', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/secondorderpdes/canonicalforms');
})
router.get('/engineeringmaths/partialdifferentialequations/secondorderpdes/quiz3secondorderpdes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/secondorderpdes/quiz3secondorderpdes');
})

router.get('/engineeringmaths/partialdifferentialequations/examplesofpdes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/examplesofpdes');
})
router.get('/engineeringmaths/partialdifferentialequations/examplesofpdes/equationofavibratingstring', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/examplesofpdes/equationofavibratingstring');
})
router.get('/engineeringmaths/partialdifferentialequations/examplesofpdes/heatequation', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/examplesofpdes/heatequation');
})
router.get('/engineeringmaths/partialdifferentialequations/examplesofpdes/laplaceequation', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/examplesofpdes/laplaceequation');
})
router.get('/engineeringmaths/partialdifferentialequations/examplesofpdes/quiz4examplesofpdes', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/examplesofpdes/quiz4examplesofpdes');
})


router.get('/engineeringmaths/numericalmethods', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods');
})
router.get('/engineeringmaths/numericalmethods/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/coursestart');
})

router.get('/engineeringmaths/numericalmethods/numericalmethods', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/solutionofalgebraicandtranscendentalequationsofonevariablebybisectionmethod', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/solutionofalgebraicandtranscendentalequationsofonevariablebybisectionmethod');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/regulafalsimethod', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/regulafalsimethod');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/newtonraphsonmethod', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/newtonraphsonmethod');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/solutionofsystemoflinearequationsbygaussianeliminationandgaussjordan(direct)methods', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/solutionofsystemoflinearequationsbygaussianeliminationandgaussjordan(direct)methods');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/gaussseidel(iterative)method', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/gaussseidel(iterative)method');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/newtons(forwardandbackward)interpolation', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/newtons(forwardandbackward)interpolation');
})
router.get('/engineeringmaths/numericalmethods/numericalmethods/quiz1numericalmethods', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalmethods/quiz1numericalmethods');
})

router.get('/engineeringmaths/numericalmethods/numericalintegration', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalintegration');
})
router.get('/engineeringmaths/numericalmethods/numericalintegration/trapezoidalrule', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalintegration/trapezoidalrule');
})
router.get('/engineeringmaths/numericalmethods/numericalintegration/simpsonsrules', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalintegration/simpsonsrules');
})
router.get('/engineeringmaths/numericalmethods/numericalintegration/gaussianquadratureformula', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalintegration/gaussianquadratureformula');
})
router.get('/engineeringmaths/numericalmethods/numericalintegration/quiz2numericalintegration', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalintegration/quiz2numericalintegration');
})

router.get('/engineeringmaths/numericalmethods/numericalsolutionofodes', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalsolutionofodes');
})
router.get('/engineeringmaths/numericalmethods/numericalsolutionofodes/eulermethod', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalsolutionofodes/eulermethod');
})
router.get('/engineeringmaths/numericalmethods/numericalsolutionofodes/rungekuttamethod', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalsolutionofodes/rungekuttamethod');
})
router.get('/engineeringmaths/numericalmethods/numericalsolutionofodes/quiz3numericalsolutionofodes', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/numericalsolutionofodes/quiz3numericalsolutionofodes');
})

router.get('/engineeringmaths/numericalmethods/computerprogramming', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/binarysystems', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/binarysystems');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/arithmeticandlogicaloperationsonnumbers', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/arithmeticandlogicaloperationsonnumbers');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/octalandhexadecimalsystems', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/octalandhexadecimalsystems');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/conversiontoandfromdecimalsystems', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/conversiontoandfromdecimalsystems');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/algebraofbinarynumbers', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/algebraofbinarynumbers');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/elementsofcomputersystemsandconceptofmemory', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/elementsofcomputersystemsandconceptofmemory');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/basiclogicgatesandtruthtables', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/basiclogicgatesandtruthtables');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/booleanalgebra', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/booleanalgebra');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/normalforms', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/normalforms');
})
router.get('/engineeringmaths/numericalmethods/computerprogramming/quiz4computerprogramming', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/computerprogramming/quiz4computerprogramming');
})

router.get('/engineeringmaths/numericalmethods/algorithmsandflowcharts', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/algorithmsandflowcharts');
})
router.get('/engineeringmaths/numericalmethods/algorithmsandflowcharts/algorithmsandflowchartsforsolvingnumericalanalysisproblems', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/algorithmsandflowcharts/algorithmsandflowchartsforsolvingnumericalanalysisproblems');
})
router.get('/engineeringmaths/numericalmethods/algorithmsandflowcharts/quiz5algorithmsandflowcharts', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/algorithmsandflowcharts/quiz5algorithmsandflowcharts');
})


router.get('/engineeringmaths/linearprogramming', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming');
})
router.get('/engineeringmaths/linearprogramming/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/coursestart');
})

router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)');
})
router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/linearprogrammingproblems(lpps)');
})
router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/basicsolution', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/basicsolution');
})
router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/basicfeasiblesolution', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/basicfeasiblesolution');
})
router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/optimalsolution', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/optimalsolution');
})
router.get('/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/quiz1linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/linearprogrammingproblems(lpps)/quiz1linearprogrammingproblems(lpps)');
})

router.get('/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions');
})
router.get('/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/graphicalmethod', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/graphicalmethod');
})
router.get('/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/simplexmethod', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/simplexmethod');
})
router.get('/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/quiz2graphicalandsimplexmethodsofsolutions', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/quiz2graphicalandsimplexmethodsofsolutions');
})

router.get('/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems');
})
router.get('/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/duality', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/duality');
})
router.get('/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/transportationproblem', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/transportationproblem');
})
router.get('/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/assignmentproblem', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/assignmentproblem');
})
router.get('/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/quiz3dualitytransporationandassignmentptoblems', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/dualitytransporationandassignmentptoblems/quiz3dualitytransporationandassignmentptoblems');
})


router.get('/engineeringmaths/algebra', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra');
})
router.get('/engineeringmaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/coursestart');
})

router.get('/engineeringmaths/algebra/grouptheory', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory');
})
router.get('/engineeringmaths/algebra/grouptheory/groups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/groups');
})
router.get('/engineeringmaths/algebra/grouptheory/subgroups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/subgroups');
})
router.get('/engineeringmaths/algebra/grouptheory/normalsubgroups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/normalsubgroups');
})
router.get('/engineeringmaths/algebra/grouptheory/homomorphismofgroups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/homomorphismofgroups');
})
router.get('/engineeringmaths/algebra/grouptheory/quotientgroups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/quotientgroups');
})
router.get('/engineeringmaths/algebra/grouptheory/isomorphism', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/isomorphism');
})
router.get('/engineeringmaths/algebra/algebra/grouptheory/sylowsgroup', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/sylowsgroup');
})
router.get('/engineeringmaths/algebra/algebra/grouptheory/permutationgroups', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/permutationgroups');
})
router.get('/engineeringmaths/algebra/grouptheory/cayleystheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/cayleystheorem');
})
router.get('/engineeringmaths/algebra/grouptheory/quiz1grouptheory', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/grouptheory/quiz1grouptheory');
})

router.get('/engineeringmaths/algebra/ringsidealsanddomains', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/ringsidealsanddomains');
})
router.get('/engineeringmaths/algebra/ringsidealsanddomains/ringsandideals', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/ringsidealsanddomains/ringsandideals');
})
router.get('/engineeringmaths/algebra/ringsidealsanddomains/principalidealdomains', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/ringsidealsanddomains/principalidealdomains');
})
router.get('/engineeringmaths/algebra/ringsidealsanddomains/uniquefactorizationdomains', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/ringsidealsanddomains/uniquefactorizationdomains');
})
router.get('/engineeringmaths/algebra/ringsidealsanddomains/quiz2ringsidealsanddomains', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/ringsidealsanddomains/quiz2ringsidealsanddomains');
})

router.get('/engineeringmaths/algebra/fields', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/fields');
})
router.get('/engineeringmaths/algebra/field/fieldextensions', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/fields/fieldextensions');
})
router.get('/engineeringmaths/algebra/fields/finitefields', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/fields/finitefields');
})
router.get('/engineeringmaths/algebra/fields/quiz3fields', function(req, res, next){
  res.render('front-end/engineeringmaths/algebra/fields/quiz3fields');
})


router.get('/engineeringmaths/probabilityandstatistics', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics');
})
router.get('/engineeringmaths/probabilityandstatistics/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/coursestart');
})

router.get('/engineeringmaths/probabilityandstatistics/probability', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability');
})
router.get('/engineeringmaths/probabilityandstatistics/probability/probabilityspace', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability/probabilityspace');
})
router.get('/engineeringmaths/probabilityandstatistics/probability/conditionalprobability', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability/conditionalprobability');
})
router.get('/engineeringmaths/probabilityandstatistics/probability/bayestheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability/bayestheorem');
})
router.get('/engineeringmaths/probabilityandstatistics/probability/independence', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability/independence');
})
router.get('/engineeringmaths/probabilityandstatistics/probability/quiz1probability', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probability/quiz1probability');
})

router.get('/engineeringmaths/probabilityandstatistics/randomvariables/', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/randomvariables/');
})
router.get('/engineeringmaths/probabilityandstatistics/randomvariables/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/randomvariables/introduction');
})
router.get('/engineeringmaths/probabilityandstatistics/randomvariables/jointandconditionaldistributions', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/randomvariables/jointandconditionaldistributions');
})
router.get('/engineeringmaths/probabilityandstatistics/randomvariables/standardprobabilitydistributionsandtheirproperties', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/randomvariables/standardprobabilitydistributionsandtheirproperties');
})
router.get('/engineeringmaths/probabilityandstatistics/randomvariables/quiz2randomvariables', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/randomvariables/quiz2randomvariables');
})

router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/discreteuniform', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/discreteuniform');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/binomial', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/binomial');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/poisson', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/poisson');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/geometric', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/geometric');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/negativebinomial', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/negativebinomial');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/normal', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/normal');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/exponential', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/exponential');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/gamma', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/gamma');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/continuousuniform', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/continuousuniform');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/bivariatenormal', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/bivariatenormal');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/multinomial', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/multinomial');
})
router.get('/engineeringmaths/probabilityandstatistics/probabilitydistributions/quiz3probabilitydistributions', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/probabilitydistributions/quiz3probabilitydistributions');
})

router.get('/engineeringmaths/probabilityandstatistics/expectation', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/expectation');
})
router.get('/engineeringmaths/probabilityandstatistics/expectation/introduction', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/expectation/introduction');
})
router.get('/engineeringmaths/probabilityandstatistics/expectation/conditionalexpectation', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/expectation/conditionalexpectation');
})
router.get('/engineeringmaths/probabilityandstatistics/expectation/moments', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/expectation/moments');
})
router.get('/engineeringmaths/probabilityandstatistics/expectation/quiz4expectation', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/expectation/quiz4expectation');
})

router.get('/engineeringmaths/probabilityandstatistics/centrallimittheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/centrallimittheorem');
})
router.get('/engineeringmaths/probabilityandstatistics/centrallimittheorem/weakandstronglawoflargenumbers', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/centrallimittheorem/weakandstronglawoflargenumbers');
})
router.get('/engineeringmaths/probabilityandstatistics/centrallimittheorem/centrallimittheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/centrallimittheorem/centrallimittheorem');
})
router.get('/engineeringmaths/probabilityandstatistics/centrallimittheorem/quiz5centrallimittheorem', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/centrallimittheorem/quiz5centrallimittheorem');
})

router.get('/engineeringmaths/probabilityandstatistics/sampling', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling');
})
router.get('/engineeringmaths/probabilityandstatistics/sampling/samplingdistributions', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling/samplingdistributions');
})
router.get('/engineeringmaths/probabilityandstatistics/sampling/umvuestimators', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling/umvuestimators');
})
router.get('/engineeringmaths/probabilityandstatistics/sampling/maximumlikelihoodestimators', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling/maximumlikelihoodestimators');
})
router.get('/engineeringmaths/probabilityandstatistics/sampling/intervalestimation', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling/intervalestimation');
})
router.get('/engineeringmaths/probabilityandstatistics/sampling/quiz6sampling', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/sampling/quiz6sampling');
})

router.get('/engineeringmaths/probabilityandstatistics/hypothesistesting', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/hypothesistesting');
})
router.get('/engineeringmaths/probabilityandstatistics/hypothesistesting/testingofhypothesis', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/hypothesistesting/testingofhypothesis');
})
router.get('/engineeringmaths/probabilityandstatistics/hypothesistesting/standardparametrictestsbasedonnormaldistributions', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/hypothesistesting/standardparametrictestsbasedonnormaldistributions');
})
router.get('/engineeringmaths/probabilityandstatistics/hypothesistesting/quiz7hypothesistesting', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/hypothesistesting/quiz7hypothesistesting');
})

router.get('/engineeringmaths/probabilityandstatistics/linearregression', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/linearregression');
})
router.get('/engineeringmaths/probabilityandstatistics/linearregression/simplelinearregression', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/linearregression/simplelinearregression');
})
router.get('/engineeringmaths/probabilityandstatistics/linearregression/quiz8linearregression', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/linearregression/quiz8linearregression');
})


//Routing for UPSC Maths files
router.get('/upscmaths', function(req, res, next){
  res.render('front-end/upscmaths');
})

router.get('/upscmaths/syllabus', function(req, res, next){
  res.render('front-end/upscmaths/syllabus');
})


router.get('/upscmaths/linearalgebra', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra');
})
router.get('/upscmaths/linearalgebra/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/coursestart');
})

router.get('/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes');
})
router.get('/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/lineardependenceandindependence', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/lineardependenceandindependence');
})
router.get('/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/vectorspacesandsubspaces', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/vectorspacesandsubspaces');
})
router.get('/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/basisanddimension', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/basisanddimension');
})
router.get('/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/quiz1ectorspacesoverreal(r)andcomplex(c)planes', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/vectorspacesoverrealrandcomplexcplanes/quiz1ectorspacesoverreal(r)andcomplex(c)planes');
})

router.get('/upscmaths/linearalgebra/lineartransformations', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/lineartransformations');
})
router.get('/upscmaths/linearalgebra/lineartransformations/rankandnullity', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/lineartransformations/rankandnullity');
})
router.get('/upscmaths/linearalgebra/lineartransformations/matrixofalineartransformation', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/lineartransformations/matrixofalineartransformation');
})
router.get('/upscmaths/linearalgebra/lineartransformations/quiz2lineartransformations', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/lineartransformations/quiz2lineartransformations');
})

router.get('/upscmaths/linearalgebra/algebraofmatrices', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/rowandcolumnreduction', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/rowandcolumnreduction');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/echelonform', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/echelonform');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/coongruenceandsimilarity', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/coongruenceandsimilarity');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/rankofamatrix', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/rankofamatrix');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/inverseofamatrix', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/inverseofamatrix');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/solutionofasystemoflinearequations', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/solutionofasystemoflinearequations');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/eigenvaluesandeigenvectors', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/eigenvaluesandeigenvectors');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/characteristicpolynomial', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/characteristicpolynomial');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/cayleyhamiltontheorem', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/cayleyhamiltontheorem');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/symmetricandskewsymmetricmatrices', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/symmetricandskewsymmetricmatrices');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/hermitianandskewhermitianmatrices', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/hermitianandskewhermitianmatrices');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/orthogonalandunitarymatricesandtheireigenvalues', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/orthogonalandunitarymatricesandtheireigenvalues');
})
router.get('/upscmaths/linearalgebra/algebraofmatrices/quiz3algebraofmatrices', function(req, res, next){
  res.render('front-end/upscmaths/linearalgebra/algebraofmatrices/quiz3algebraofmatrices');
})

router.get('/upscmaths/calculus', function(req, res, next){
  res.render('front-end/upscmaths/calculus');
})
router.get('/upscmaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/calculus/coursestart');
})

router.get('/upscmaths/calculus/functionsofarealvariable', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable');
})
router.get('/upscmaths/calculus/functionsofarealvariable/introduction', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/introduction');
})
router.get('/upscmaths/calculus/functionsofarealvariable/limits', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/limits');
})
router.get('/upscmaths/calculus/functionsofarealvariable/continuity', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/continuity');
})
router.get('/upscmaths/calculus/functionsofarealvariable/differentiability', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/differentiability');
})
router.get('/upscmaths/calculus/functionsofarealvariable/meanvaluetheorem', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/meanvaluetheorem');
})
router.get('/upscmaths/calculus/functionsofarealvariable/taylorstheoremwithremainders', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/taylorstheoremwithremainders');
})
router.get('/upscmaths/calculus/functionsofarealvariable/indeterminateforms', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/indeterminateforms');
})
router.get('/upscmaths/calculus/functionsofarealvariable/maximaandminima', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/maximaandminima');
})
router.get('/upscmaths/calculus/functionsofarealvariable/lagrangesmethodofmultipliers', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/lagrangesmethodofmultipliers');
})
router.get('/upscmaths/calculus/functionsofarealvariable/jacobian', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/jacobian');
})
router.get('/upscmaths/calculus/functionsofarealvariable/quiz1functionsofarealvariable', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsofarealvariable/quiz1functionsofarealvariable');
})

router.get('/upscmaths/calculus/functionsoftwoorthreevariables', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/limits', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/limits');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/continuity', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/continuity');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/partialderivatives', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/partialderivatives');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/maximaandminima', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/maximaandminima');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/lagrangesmethodofmultipliers', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/lagrangesmethodofmultipliers');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/jacobian', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/jacobian');
})
router.get('/upscmaths/calculus/functionsoftwoorthreevariables/quiz2functionsoftwoorthreevariables', function(req, res, next){
  res.render('front-end/upscmaths/calculus/functionsoftwoorthreevariables/quiz2functionsoftwoorthreevariables');
})

router.get('/upscmaths/calculus/integrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals');
})
router.get('/upscmaths/calculus/integrals/riemannsdefinitionofdefiniteintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/riemannsdefinitionofdefiniteintegrals');
})
router.get('/upscmaths/calculus/integrals/indefiniteintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/indefiniteintegrals');
})
router.get('/upscmaths/calculus/integrals/infiniteintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/infiniteintegrals');
})
router.get('/upscmaths/calculus/integrals/improperintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/improperintegrals');
})
router.get('/upscmaths/calculus/integrals/doubleintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/doubleintegrals');
})
router.get('/upscmaths/calculus/integrals/tripleintegrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/tripleintegrals');
})
router.get('/upscmaths/calculus/integrals/quiz3integrals', function(req, res, next){
  res.render('front-end/upscmaths/calculus/integrals/quiz3integrals');
})

router.get('/upscmaths/calculus/areassurfacesandvolumes', function(req, res, next){
  res.render('front-end/upscmaths/calculus/areassurfacesandvolumes');
})
router.get('/upscmaths/calculus/areassurfacesandvolumes/areas', function(req, res, next){
  res.render('front-end/upscmaths/calculus/areassurfacesandvolumes/areas');
})
router.get('/upscmaths/calculus/areassurfacesandvolumes/surfaces', function(req, res, next){
  res.render('front-end/upscmaths/calculus/areassurfacesandvolumes/surfaces');
})
router.get('/upscmaths/calculus/areassurfacesandvolumes/volumes', function(req, res, next){
  res.render('front-end/upscmaths/calculus/areassurfacesandvolumes/volumes');
})
router.get('/upscmaths/calculus/areassurfacesandvolumes/quiz4areassurfacesandvolumes', function(req, res, next){
  res.render('front-end/upscmaths/calculus/areassurfacesandvolumes/quiz4areassurfacesandvolumes');
})

router.get('/upscmaths/analyticgeometry', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry');
})
router.get('/upscmaths/analyticgeometry/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/coursestart');
})

router.get('/upscmaths/analyticgeometry/cartesianandpolarcoordinates', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/cartesianandpolarcoordinates');
})
router.get('/upscmaths/analyticgeometry/cartesianandpolarcoordinates/cartesianandpolarcoordinatesinthreedimensions', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/cartesianandpolarcoordinates/cartesianandpolarcoordinatesinthreedimensions');
})
router.get('/upscmaths/analyticgeometry/cartesianandpolarcoordinates/quiz1cartesianandpolarcoordinates', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/cartesianandpolarcoordinates/quiz1cartesianandpolarcoordinates');
})

router.get('/upscmaths/analyticgeometry/seconddegreeequations', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/seconddegreeequations');
})
router.get('/upscmaths/analyticgeometry/seconddegreeequations/seconddegreeequationsinthreevariables', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/seconddegreeequations/seconddegreeequationsinthreevariables');
})
router.get('/upscmaths/analyticgeometry/seconddegreeequations/reductiontocanonicalforms', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/seconddegreeequations/reductiontocanonicalforms');
})
router.get('/upscmaths/analyticgeometry/seconddegreeequations/quiz2seconddegreeequations', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/seconddegreeequations/quiz2seconddegreeequations');
})

router.get('/upscmaths/analyticgeometry/straightlines', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/straightlines');
})
router.get('/upscmaths/analyticgeometry/straightlines/straightlines', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/straightlines/straightlines');
})
router.get('/upscmaths/analyticgeometry/straightlines/shortestdistancebetweentwoskewlines', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/straightlines/shortestdistancebetweentwoskewlines');
})
router.get('/upscmaths/analyticgeometry/straightlines/quiz3straightlines', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/straightlines/quiz3straightlines');
})

router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/plane', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/plane');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/sphere', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/sphere');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cone', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cone');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cylinder', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/cylinder');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/paraboloid', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/paraboloid');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/ellipsoid', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/ellipsoid');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/hyperboloid', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/hyperboloid');
})
router.get('/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/quiz4geometricobjectsofoneandtwosheetsandtheirproperties', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/geometricobjectsofoneandtwosheetsandtheirproperties/quiz4geometricobjectsofoneandtwosheetsandtheirproperties');
})

router.get('/upscmaths/ordinarydifferentialequations', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations');
})
router.get('/upscmaths/ordinarydifferentialequations/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/coursestart');
})

router.get('/upscmaths/ordinarydifferentialequations/firstorderodes', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/formulationofdifferentialequations', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/formulationofdifferentialequations');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderandfirstdegree', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderandfirstdegree');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/integratingfactor', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/integratingfactor');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/orthogonaltrajectory', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/orthogonaltrajectory');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderbutnotoffirstdegree', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/equationsoffirstorderbutnotoffirstdegree');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/clairautsequation', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/clairautsequation');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/singularsolution', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/singularsolution');
})
router.get('/upscmaths/ordinarydifferentialequations/firstorderodes/quiz1firstorderodes', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/firstorderodes/quiz1firstorderodes');
})

router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/secondandhigherorderlinearequationswithconstantcoefficients', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/secondandhigherorderlinearequationswithconstantcoefficients');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/complementaryfunction', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/complementaryfunction');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/particularintegralandgeneralsolution', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/particularintegralandgeneralsolution');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/secondorderlinearequationswithvariablecoefficients', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/secondorderlinearequationswithvariablecoefficients');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/eulercauchyequation', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/eulercauchyequation');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/determinationofcompletesolutionwhenonesolutionisknownusingmethodofvariationofparameters', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/determinationofcompletesolutionwhenonesolutionisknownusingmethodofvariationofparameters');
})
router.get('/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/quiz2secondandhigherorderodes', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/secondandhigherorderodes/quiz2secondandhigherorderodes');
})

router.get('/upscmaths/ordinarydifferentialequations/laplacetransform', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/laplacetransform');
})
router.get('/upscmaths/ordinarydifferentialequations/laplacetransform/laplaceandinverselaplacetransformsandtheirproperties', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/laplacetransform/laplaceandinverselaplacetransformsandtheirproperties');
})
router.get('/upscmaths/ordinarydifferentialequations/laplacetransform/laplacetransformsofelementaryfunctions', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/laplacetransform/laplacetransformsofelementaryfunctions');
})
router.get('/upscmaths/ordinarydifferentialequations/laplacetransform/applicationtoinitialvalueproblemsfor2ndorderlinearequationswithconstantcoefficients', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/laplacetransform/applicationtoinitialvalueproblemsfor2ndorderlinearequationswithconstantcoefficients');
})
router.get('/upscmaths/ordinarydifferentialequations/laplacetransform/quiz3laplacetransform', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialequations/laplacetransform/quiz3laplacetransform');
})

router.get('/upscmaths/dynamicsandstatics', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics');
})
router.get('/upscmaths/dynamicsandstatics/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/coursestart');
})

router.get('/upscmaths/dynamicsandstatics/motion', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})
router.get('/upscmaths/dynamicsandstatics/motion/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/motion/');
})

router.get('/upscmaths/dynamicsandstatics/keplerslaws', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/keplerslaws');
})
router.get('/upscmaths/dynamicsandstatics/keplerslaws/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/keplerslaws/');
})
router.get('/upscmaths/dynamicsandstatics/keplerslaws/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/keplerslaws/');
})
router.get('/upscmaths/dynamicsandstatics/keplerslaws/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/keplerslaws/');
})

router.get('/upscmaths/dynamicsandstatics/equilibrium', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})
router.get('/upscmaths/dynamicsandstatics/equilibrium/', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsandstatics/equilibrium/');
})


router.get('/upscmaths/vectoranalysis', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis');
})
router.get('/upscmaths/vectoranalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/coursestart');
})

router.get('/upscmaths/vectoranalysis/scalarandvectorfields', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/scalarandvectorfields');
})
router.get('/upscmaths/vectoranalysis/scalarandvectorfields/scalarfields', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/scalarandvectorfields/scalarfields');
})
router.get('/upscmaths/vectoranalysis/scalarandvectorfields/vectorfields', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/scalarandvectorfields/vectorfields');
})
router.get('/upscmaths/vectoranalysis/scalarandvectorfields/differentiationofavectorfieldofascalarvariable', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/scalarandvectorfields/differentiationofavectorfieldofascalarvariable');
})
router.get('/upscmaths/vectoranalysis/scalarandvectorfields/quiz1scalarandvectorfields', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/scalarandvectorfields/quiz1scalarandvectorfields');
})

router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl');
})
router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl/cartesianandcylindricalcoordinates', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl/cartesianandcylindricalcoordinates');
})
router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl/gradient', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl/gradient');
})
router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl/divergence', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl/divergence');
})
router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl/curl', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl/curl');
})
router.get('/upscmaths/vectoranalysis/gradientdivergenceandcurl/quiz2gradientdivergenceandcurl', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/gradientdivergenceandcurl/quiz2gradientdivergenceandcurl');
})

router.get('/upscmaths/vectoranalysis/higherorderderivatives', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/higherorderderivatives');
})
router.get('/upscmaths/vectoranalysis/higherorderderivatives/higherorderderivatives', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/higherorderderivatives/higherorderderivatives');
})
router.get('/upscmaths/vectoranalysis/higherorderderivatives/quiz3higherorderderivatives', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/higherorderderivatives/quiz3higherorderderivatives');
})

router.get('/upscmaths/vectoranalysis/identitiesandequations', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/identitiesandequations');
})
router.get('/upscmaths/vectoranalysis/identitiesandequations/vectoridentities', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/identitiesandequations/vectoridentities');
})
router.get('/upscmaths/vectoranalysis/identitiesandequations/vectorequations', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/identitiesandequations/vectorequations');
})
router.get('/upscmaths/vectoranalysis/identitiesandequations/quiz4identitiesandequations', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/identitiesandequations/quiz4identitiesandequations');
})

router.get('/upscmaths/vectoranalysis/applicationtogeometry', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/applicationtogeometry');
})
router.get('/upscmaths/vectoranalysis/applicationtogeometry/curvesinspace', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/applicationtogeometry/curvesinspace');
})
router.get('/upscmaths/vectoranalysis/applicationtogeometry/curvatureandtorsion', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/applicationtogeometry/curvatureandtorsion');
})
router.get('/upscmaths/vectoranalysis/applicationtogeometry/serretfrenetsformulae', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/applicationtogeometry/serretfrenetsformulae');
})
router.get('/upscmaths/vectoranalysis/applicationtogeometry/quiz5applicationtotrigonometry', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/applicationtogeometry/quiz5applicationtotrigonometry');
})

router.get('/upscmaths/vectoranalysis/theoremsandidentities', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/theoremsandidentities');
})
router.get('/upscmaths/vectoranalysis/theoremsandidentities/gaussstheorem', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/theoremsandidentities/gaussstheorem');
})
router.get('/upscmaths/vectoranalysis/theoremsandidentities/stokestheorem', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/theoremsandidentities/stokestheorem');
})
router.get('/upscmaths/vectoranalysis/theoremsandidentities/greensidentities', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/theoremsandidentities/greensidentities');
})
router.get('/upscmaths/vectoranalysis/theoremsandidentities/quiz6theoremsandidentities', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/theoremsandidentities/quiz6theoremsandidentities');
})


router.get('/upscmaths/algebra', function(req, res, next){
  res.render('front-end/upscmaths/algebra');
})
router.get('/upscmaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/algebra/coursestart');
})

router.get('/upscmaths/algebra/grouptheory', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory');
})
router.get('/upscmaths/algebra/grouptheory/groups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/groups');
})
router.get('/upscmaths/algebra/grouptheory/subgroups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/subgroups');
})
router.get('/upscmaths/algebra/grouptheory/normalsubgroups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/normalsubgroups');
})
router.get('/upscmaths/algebra/grouptheory/homomorphismofgroups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/homomorphismofgroups');
})
router.get('/upscmaths/algebra/grouptheory/quotientgroups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/quotientgroups');
})
router.get('/upscmaths/algebra/grouptheory/isomorphism', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/isomorphism');
})
router.get('/upscmaths/algebra/algebra/grouptheory/sylowsgroup', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/sylowsgroup');
})
router.get('/upscmaths/algebra/algebra/grouptheory/permutationgroups', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/permutationgroups');
})
router.get('/upscmaths/algebra/grouptheory/cayleystheorem', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/cayleystheorem');
})
router.get('/upscmaths/algebra/grouptheory/quiz1grouptheory', function(req, res, next){
  res.render('front-end/upscmaths/algebra/grouptheory/quiz1grouptheory');
})

router.get('/upscmaths/algebra/ringsidealsanddomains', function(req, res, next){
  res.render('front-end/upscmaths/algebra/ringsidealsanddomains');
})
router.get('/upscmaths/algebra/ringsidealsanddomains/ringsandideals', function(req, res, next){
  res.render('front-end/upscmaths/algebra/ringsidealsanddomains/ringsandideals');
})
router.get('/upscmaths/algebra/ringsidealsanddomains/principalidealdomains', function(req, res, next){
  res.render('front-end/upscmaths/algebra/ringsidealsanddomains/principalidealdomains');
})
router.get('/upscmaths/algebra/ringsidealsanddomains/uniquefactorizationdomains', function(req, res, next){
  res.render('front-end/upscmaths/algebra/ringsidealsanddomains/uniquefactorizationdomains');
})
router.get('/upscmaths/algebra/ringsidealsanddomains/quiz2ringsidealsanddomains', function(req, res, next){
  res.render('front-end/upscmaths/algebra/ringsidealsanddomains/quiz2ringsidealsanddomains');
})

router.get('/upscmaths/algebra/fields', function(req, res, next){
  res.render('front-end/upscmaths/algebra/fields');
})
router.get('/upscmaths/algebra/field/fieldextensions', function(req, res, next){
  res.render('front-end/upscmaths/algebra/fields/fieldextensions');
})
router.get('/upscmaths/algebra/fields/finitefields', function(req, res, next){
  res.render('front-end/upscmaths/algebra/fields/finitefields');
})
router.get('/upscmaths/algebra/fields/quiz3fields', function(req, res, next){
  res.render('front-end/upscmaths/algebra/fields/quiz3fields');
})

router.get('/upscmaths/realanalysis', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis');
})
router.get('/upscmaths/realanalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/coursestart');
})

router.get('/upscmaths/realanalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/coursestart');
})
router.get('/upscmaths/realanalysis/sequence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence');
})
router.get('/upscmaths/realanalysis/sequence/introduction', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence/introduction');
})
router.get('/upscmaths/realanalysis/sequence/limitofasequence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence/limitofasequence');
})
router.get('/upscmaths/realanalysis/sequence/cauchysequence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence/cauchysequence');
})
router.get('/upscmaths/realanalysis/sequence/completenessofrealline', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence/completenessofrealline');
})
router.get('/upscmaths/realanalysis/sequence/quiz1sequence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/sequence/quiz1sequence');
})

router.get('/upscmaths/realanalysis/series', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/series');
})
router.get('/upscmaths/realanalysis/series/seriesanditsconvergence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/series/seriesanditsconvergence');
})
router.get('/upscmaths/realanalysis/series/absoluteandconditionalconvergenceofseriesofrealandcomplexterms', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/series/absoluteandconditionalconvergenceofseriesofrealandcomplexterms');
})
router.get('/upscmaths/realanalysis/series/rearrangementofseries', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/series/rearrangementofseries');
})
router.get('/upscmaths/realanalysis/series/quiz2series', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/series/quiz2series');
})

router.get('/upscmaths/realanalysis/continuity', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/continuity');
})
router.get('/upscmaths/realanalysis/continuity/continuityanduniformcontinuityiffunctions', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/continuity/continuityanduniformcontinuityiffunctions');
})
router.get('/upscmaths/realanalysis/continuity/propertiesofcontinuousfunctionsoncompactsets', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/continuity/propertiesofcontinuousfunctionsoncompactsets');
})
router.get('/upscmaths/realanalysis/continuity/quiz3continuity', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/continuity/quiz3continuity');
})

router.get('/upscmaths/realanalysis/integralcalculus', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/integralcalculus');
})
router.get('/upscmaths/realanalysis/integralcalculus/riemannintegral', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/integralcalculus/riemannintegral');
})
router.get('/upscmaths/realanalysis/integralcalculus/improperintegrals', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/integralcalculus/improperintegrals');
})
router.get('/upscmaths/realanalysis/integralcalculus/fundamentaltheoremofintegralcalculus', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/integralcalculus/fundamentaltheoremofintegralcalculus');
})
router.get('/upscmaths/realanalysis/integralcalculus/quiz4integralcalculus', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/integralcalculus/quiz4integralcalculus');
})

router.get('/upscmaths/realanalysis/analysisofsequenceandseries', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries');
})
router.get('/upscmaths/realanalysis/analysisofsequenceandseries/uniformconvergence', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries/uniformconvergence');
})
router.get('/upscmaths/realanalysis/analysisofsequenceandseries/continuity', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries/continuity');
})
router.get('/upscmaths/realanalysis/analysisofsequenceandseries/differentiability', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries/differentiability');
})
router.get('/upscmaths/realanalysis/analysisofsequenceandseries/integrability', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries/integrability');
})
router.get('/upscmaths/realanalysis/analysisofsequenceandseries/quiz5analysisofsequenceandseries', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/analysisofsequenceandseries/quiz5analysisofsequenceandseries');
})

router.get('/upscmaths/realanalysis/partialderivatives', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/partialderivatives');
})
router.get('/upscmaths/realanalysis/partialderivatives/partialderivativesoffunctionsofseveral(twoorthree)variables', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/partialderivatives/partialderivativesoffunctionsofseveral(twoorthree)variables');
})
router.get('/upscmaths/realanalysis/partialderivatives/maximaandminima', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/partialderivatives/maximaandminima');
})
router.get('/upscmaths/realanalysis/partialderivatives/quiz6partialderivatives', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/partialderivatives/quiz6partialderivatives');
})

router.get('/upscmaths/complexanalysis', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis');
})
router.get('/upscmaths/complexanalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/coursestart');
})

router.get('/upscmaths/complexanalysis/analyticfunctions', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions');
})
router.get('/upscmaths/complexanalysis/analyticfunctions/introduction', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions/introduction');
})
router.get('/upscmaths/complexanalysis/analyticfunctions/cauchyriemannequations', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions/cauchyriemannequations');
})
router.get('/upscmaths/complexanalysis/analyticfunctions/cauchystheorem', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions/cauchystheorem');
})
router.get('/upscmaths/complexanalysis/analyticfunctions/cauchysintegralformula', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions/cauchysintegralformula');
})
router.get('/upscmaths/complexanalysis/analyticfunctions/quiz1analyticfunctions', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/analyticfunctions/quiz1analyticfunctions');
})

router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction');
})
router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/introduction', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/introduction');
})
router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/singularities', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/singularities');
})
router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/taylorsseries', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/taylorsseries');
})
router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/laurentsseries', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/laurentsseries');
})
router.get('/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/quiz2powerseriesrepresentationofananalyticfunction', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/powerseriesrepresentationofananalyticfunction/quiz2powerseriesrepresentationofananalyticfunction');
})

router.get('/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration');
})
router.get('/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/cauchysresiduetheorem', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/cauchysresiduetheorem');
})
router.get('/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/contourintegration', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/contourintegration');
})
router.get('/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/quiz3cauchysresiduetheoremandcontourintegration', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/cauchysresiduetheoremandcontourintegration/quiz3cauchysresiduetheoremandcontourintegration');
})

router.get('/upscmaths/linearprogramming', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming');
})
router.get('/upscmaths/linearprogramming/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/coursestart');
})

router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)');
})
router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/linearprogrammingproblems(lpps)');
})
router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/basicsolution', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/basicsolution');
})
router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/basicfeasiblesolution', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/basicfeasiblesolution');
})
router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/optimalsolution', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/optimalsolution');
})
router.get('/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/quiz1linearprogrammingproblems(lpps)', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/linearprogrammingproblems(lpps)/quiz1linearprogrammingproblems(lpps)');
})

router.get('/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions');
})
router.get('/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/graphicalmethod', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/graphicalmethod');
})
router.get('/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/simplexmethod', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/simplexmethod');
})
router.get('/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/quiz2graphicalandsimplexmethodsofsolutions', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/graphicalandsimplexmethodsofsolutions/quiz2graphicalandsimplexmethodsofsolutions');
})

router.get('/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems');
})
router.get('/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/duality', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/duality');
})
router.get('/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/transportationproblem', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/transportationproblem');
})
router.get('/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/assignmentproblem', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/assignmentproblem');
})
router.get('/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/quiz3dualitytransporationandassignmentptoblems', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/dualitytransporationandassignmentptoblems/quiz3dualitytransporationandassignmentptoblems');
})

router.get('/upscmaths/partialdifferentialequations', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations');
})
router.get('/upscmaths/partialdifferentialequations/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/coursestart');
})

router.get('/upscmaths/partialdifferentialequations/introduction', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/introduction');
})
router.get('/upscmaths/partialdifferentialequations/introduction/familyofsurfacesinthreedimensions', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/introduction/familyofsurfacesinthreedimensions');
})
router.get('/upscmaths/partialdifferentialequations/introduction/formulationofpartialdifferentialequations', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/introduction/formulationofpartialdifferentialequations');
})
router.get('/upscmaths/partialdifferentialequations/introduction/quiz1introduction', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/introduction/quiz1introduction');
})

router.get('/upscmaths/partialdifferentialequations/firstorderpdes', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/firstorderpdes');
})
router.get('/upscmaths/partialdifferentialequations/firstorderpdes/solutionofquasilinearpartialdifferentialequationsofthefirstorder', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/firstorderpdes/solutionofquasilinearpartialdifferentialequationsofthefirstorder');
})
router.get('/upscmaths/partialdifferentialequations/firstorderpdes/cauchysmethodofcharacteristics', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/firstorderpdes/cauchysmethodofcharacteristics');
})
router.get('/upscmaths/partialdifferentialequations/firstorderpdes/quiz2firstorderodes', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/firstorderpdes/quiz2firstorderodes');
})

router.get('/upscmaths/partialdifferentialequations/secondorderpdes', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/secondorderpdes');
})
router.get('/upscmaths/partialdifferentialequations/secondorderpdes/linearpartialdifferentialequationsofthesecondorderwithconstantcoefficients', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/secondorderpdes/linearpartialdifferentialequationsofthesecondorderwithconstantcoefficients');
})
router.get('/upscmaths/partialdifferentialequations/secondorderpdes/canonicalforms', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/secondorderpdes/canonicalforms');
})
router.get('/upscmaths/partialdifferentialequations/secondorderpdes/quiz3secondorderpdes', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/secondorderpdes/quiz3secondorderpdes');
})

router.get('/upscmaths/partialdifferentialequations/examplesofpdes', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/examplesofpdes');
})
router.get('/upscmaths/partialdifferentialequations/examplesofpdes/equationofavibratingstring', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/examplesofpdes/equationofavibratingstring');
})
router.get('/upscmaths/partialdifferentialequations/examplesofpdes/heatequation', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/examplesofpdes/heatequation');
})
router.get('/upscmaths/partialdifferentialequations/examplesofpdes/laplaceequation', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialequations/examplesofpdes/laplaceequation');
})
router.get('/upscmaths/partialdifferentialequations/examplesofpdes/quiz4examplesofpdes', function(req, res, next){
  res.render('front-end/sequencesandseries/partialdifferentialequations/examplesofpdes/quiz4examplesofpdes');
})


router.get('/upscmaths/numericalanalysisandcomputerprogramming', function(req, res, next){
  res.render('front-end/upscmaths/numericalanalysisandcomputerprogramming');
})
router.get('/upscmaths/numericalanalysisandcomputerprogramming/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/numericalanalysisandcomputerprogramming/coursestart');
})


router.get('/upscmaths/numericalintegration', function(req, res, next){
  res.render('front-end/upscmaths/numericalintegration');
})
router.get('/upscmaths/numericalintegration/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/numericalintegration/coursestart');
})


router.get('/upscmaths/mechanicsandfluiddynamics', function(req, res, next){
  res.render('front-end/upscmaths/mechanicsandfluiddynamics');
})
router.get('/upscmaths/mechanicsandfluiddynamics/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/mechanicsandfluiddynamics/coursestart');
})


router.get('/upscmaths/upscmathscomplete', function(req, res, next){
  res.render('front-end/upscmaths/upscmathscomplete');
})
router.get('/upscmaths/upscmathscomplete/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/upscmathscomplete/coursestart');
})


//Routing for JEE Maths files
router.get('/jeemaths', function(req, res, next){
  res.render('front-end/jeemaths');
})

router.get('/jeemaths/syllabus', function(req, res, next){
  res.render('front-end/jeemaths/syllabus');
})
router.get('/jeemaths/algebra', function(req, res, next){
  res.render('front-end/jeemaths/algebra');
})
router.get('/jeemaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/algebra/coursestart');
})
router.get('/jeemaths/algebra/complexnumbers', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers');
})
router.get('/jeemaths/algebra/complexnumbers/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/introduction');
})
router.get('/jeemaths/algebra/complexnumbers/complexnumbers', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/complexnumbers');
})
router.get('/jeemaths/algebra/complexnumbers/algebraofcomplex numbers', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/algebraofcomplex numbers');
})
router.get('/jeemaths/algebra/complexnumbers/modulusandconjugate', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/modulusandconjugate');
})
router.get('/jeemaths/algebra/complexnumbers/argandandpolarrepresentation', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/argandandpolarrepresentation');
})
router.get('/jeemaths/algebra/complexnumbers/cuberootsofnuity', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/cuberootsofnuity');
})
router.get('/jeemaths/algebra/complexnumbers/geometricinterpretation', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/geometricinterpretation');
})
router.get('/jeemaths/algebra/complexnumbers/quiz1complexnumbers', function(req, res, next){
  res.render('front-end/jeemaths/algebra/complexnumbers/quiz1complexnumbers');
})

router.get('/jeemaths/algebra/quadraticequations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations');
})
router.get('/jeemaths/algebra/quadraticequations/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/introduction');
})
router.get('/jeemaths/algebra/quadraticequations/quadraticequationswithrealcoefficients', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/quadraticequationswithrealcoefficients');
})
router.get('/jeemaths/algebra/quadraticequations/relationbetweenrootsandcoefficients', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/relationbetweenrootsandcoefficients');
})
router.get('/jeemaths/algebra/quadraticequations/propertiesandgraphofquadraticequations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/propertiesandgraphofquadraticequations');
})
router.get('/jeemaths/algebra/quadraticequations/symmetricfunctionsofroots', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/symmetricfunctionsofroots');
})
router.get('/jeemaths/algebra/quadraticequations/quiz2quadraticequations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/quadraticequations/quiz2quadraticequations');
})

router.get('/jeemaths/algebra/sequenceandseries', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries');
})
router.get('/jeemaths/algebra/sequenceandseries/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/introduction');
})
router.get('/jeemaths/algebra/sequenceandseries/arithmeticprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/arithmeticprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/propertiesofarithmeticprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/propertiesofarithmeticprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/geometricprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/geometricprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/propertiesofgeometricprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/propertiesofgeometricprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/harmonicprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/harmonicprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/propertiesofharmonicprogression', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/propertiesofharmonicprogression');
})
router.get('/jeemaths/algebra/sequenceandseries/infiniteseries', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/infiniteseries');
})
router.get('/jeemaths/algebra/sequenceandseries/sumsofsquaresandcubes', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/sumsofsquaresandcubes');
})
router.get('/jeemaths/algebra/sequenceandseries/quiz3sequenceandseries', function(req, res, next){
  res.render('front-end/jeemaths/algebra/sequenceandseries/quiz3sequenceandseries');
})

router.get('/jeemaths/algebra/binomialtheorem', function(req, res, next){
  res.render('front-end/jeemaths/algebra/binomialtheorem');
})
router.get('/jeemaths/algebra/binomialtheorem/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/binomialtheorem/introduction');
})
router.get('/jeemaths/algebra/binomialtheorem/binomialtheoremforapositiveintegralindex', function(req, res, next){
  res.render('front-end/jeemaths/algebra/binomialtheorem/binomialtheoremforapositiveintegralindex');
})
router.get('/jeemaths/algebra/binomialtheorem/propertiesofbinomialcoefficients', function(req, res, next){
  res.render('front-end/jeemaths/algebra/binomialtheorem/propertiesofbinomialcoefficients');
})
router.get('/jeemaths/algebra/binomialtheorem/quiz4binomialtheorem', function(req, res, next){
  res.render('front-end/jeemaths/algebra/binomialtheorem/quiz4binomialtheorem');
})

router.get('/jeemaths/algebra/permutationsandcombinations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/permutationsandcombinations');
})
router.get('/jeemaths/algebra/permutationsandcombinations/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/permutationsandcombinations/introduction');
})
router.get('/jeemaths/algebra/permutationsandcombinations/additionandmultiplicationrule', function(req, res, next){
  res.render('front-end/jeemaths/algebra/permutationsandcombinations/additionandmultiplicationrule');
})
router.get('/jeemaths/algebra/permutationsandcombinations/formulaeandproperties', function(req, res, next){
  res.render('front-end/jeemaths/algebra/permutationsandcombinations/formulaeandproperties');
})
router.get('/jeemaths/algebra/permutationsandcombinations/quiz5permutationsandcombinations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/permutationsandcombinations/quiz5permutationsandcombinations');
})

router.get('/jeemaths/algebra/matrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices');
})
router.get('/jeemaths/algebra/matrices/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/introduction');
})
router.get('/jeemaths/algebra/matrices/typesofmatrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/typesofmatrices');
})
router.get('/jeemaths/algebra/matrices/operationsonmatrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/operationsonmatrices');
})
router.get('/jeemaths/algebra/matrices/symmetricandskewsymmetricmatrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/symmetricandskewsymmetricmatrices');
})
router.get('/jeemaths/algebra/matrices/elementaryoperationsonmatrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/elementaryoperationsonmatrices');
})
router.get('/jeemaths/algebra/matrices/invertiblematrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/invertiblematrices');
})
router.get('/jeemaths/algebra/matrices/solutionsofsimultaneouslinearequationsintwoorthreevariables', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/solutionsofsimultaneouslinearequationsintwoorthreevariables');
})
router.get('/jeemaths/algebra/matrices/quiz6matrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/matrices/quiz6matrices');
})

router.get('/jeemaths/algebra/determinants', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants');
})
router.get('/jeemaths/algebra/determinants/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/introduction');
})
router.get('/jeemaths/algebra/determinants/propertiesofdeterminants', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/propertiesofdeterminants');
})
router.get('/jeemaths/algebra/determinants/minorsandcofactors', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/minorsandcofactors');
})
router.get('/jeemaths/algebra/determinants/adjointandinverseofamatrix', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/adjointandinverseofamatrix');
})
router.get('/jeemaths/algebra/determinants/applicationofdeterminantsandmatrices', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/applicationofdeterminantsandmatrices');
})
router.get('/jeemaths/algebra/determinants/quiz7determinants', function(req, res, next){
  res.render('front-end/jeemaths/algebra/determinants/quiz7determinants');
})

router.get('/jeemaths/algebra/probability', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability');
})
router.get('/jeemaths/algebra/probability/introduction', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/introduction');
})
router.get('/jeemaths/algebra/probability/conditionalprobability', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/conditionalprobability');
})
router.get('/jeemaths/algebra/probability/multiplicationtheoremsonprobability', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/multiplicationtheoremsonprobability');
})
router.get('/jeemaths/algebra/probability/independentevents', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/independentevents');
})
router.get('/jeemaths/algebra/probability/bayestheorem', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/bayestheorem');
})
router.get('/jeemaths/algebra/probability/randomvariablesandtheirprobabilitydistributions', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/randomvariablesandtheirprobabilitydistributions');
})
router.get('/jeemaths/algebra/probability/bernoullitrialsandbinomialdistribution', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/bernoullitrialsandbinomialdistribution');
})
router.get('/jeemaths/algebra/probability/computationofprobabilityofeventsusingpermutationsandcombinations', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/computationofprobabilityofeventsusingpermutationsandcombinations');
})
router.get('/jeemaths/algebra/probability/quiz8probability', function(req, res, next){
  res.render('front-end/jeemaths/algebra/probability/quiz8probability');
})

router.get('/jeemaths/trigonometry', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry');
})
router.get('/jeemaths/trigonometry/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/coursestart');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/introduction', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/introduction');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/additionandsubtractionformulae', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/additionandsubtractionformulae');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/graphs', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/graphs');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/formulaeinvolvingmultipleandsubmultipleangles', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/formulaeinvolvingmultipleandsubmultipleangles');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/generalsolutionsoftrignometricequations', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/generalsolutionsoftrignometricequations');
})
router.get('/jeemaths/trigonometry/trigonometricfunctions/quiz1trigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/trigonometricfunctions/quiz1trigonometricfunctions');
})

router.get('/jeemaths/trigonometry/inversetrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/inversetrigonometricfunctions');
})
router.get('/jeemaths/trigonometry/inversetrigonometricfunctions/introduction', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/inversetrigonometricfunctions/introduction');
})
router.get('/jeemaths/trigonometry/inversetrigonometricfunctions/basicconcepts', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/inversetrigonometricfunctions/basicconcepts');
})
router.get('/jeemaths/trigonometry/inversetrigonometricfunctions/propertiesofinversetrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/inversetrigonometricfunctions/propertiesofinversetrigonometricfunctions');
})
router.get('/jeemaths/trigonometry/inversetrigonometricfunctions/quiz2inversetrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/trigonometry/inversetrigonometricfunctions/quiz2inversetrigonometricfunctions');
})

router.get('/jeemaths/analyticalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry');
})
router.get('/jeemaths/analyticalgeometry/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/coursestart');
})
router.get('/jeemaths/analyticalgeometry/straightlines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines');
})
router.get('/jeemaths/analyticalgeometry/straightlines/introduction', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/introduction');
})
router.get('/jeemaths/analyticalgeometry/straightlines/variousformsoftheequationofline', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/variousformsoftheequationofline');
})
router.get('/jeemaths/analyticalgeometry/straightlines/distanceofapointfromaline', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/distanceofapointfromaline');
})
router.get('/jeemaths/analyticalgeometry/straightlines/equationofthebisectoroftheanglebetweentwolines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/equationofthebisectoroftheanglebetweentwolines');
})
router.get('/jeemaths/analyticalgeometry/straightlines/concurrencyoflines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/concurrencyoflines');
})
router.get('/jeemaths/analyticalgeometry/straightlines/centroidorthocentreincentreandcircumcentreofatriangle', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/centroidorthocentreincentreandcircumcentreofatriangle');
})
router.get('/jeemaths/analyticalgeometry/straightlines/quiz1straightlines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/straightlines/quiz1straightlines');
})
router.get('/jeemaths/analyticalgeometry/circles', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles');
})
router.get('/jeemaths/analyticalgeometry/circles/introduction', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/introduction');
})
router.get('/jeemaths/analyticalgeometry/circles/equationofacircleinvariousforms', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/equationofacircleinvariousforms');
})
router.get('/jeemaths/analyticalgeometry/circles/equationsoftangentnormalandchord', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/equationsoftangentnormalandchord');
})
router.get('/jeemaths/analyticalgeometry/circles/parametricequationsofacircle', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/parametricequationsofacircle');
})
router.get('/jeemaths/analyticalgeometry/circles/intersectionofacirclewithastraightlineoracircle', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/intersectionofacirclewithastraightlineoracircle');
})
router.get('/jeemaths/analyticalgeometry/circles/equationofacirclethroughthepointsofintersectionoftwocirclesandthoseofacircleandastraightline', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/equationofacirclethroughthepointsofintersectionoftwocirclesandthoseofacircleandastraightline');
})
router.get('/jeemaths/analyticalgeometry/circles/familyofcircles', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/familyofcircles');
})
router.get('/jeemaths/analyticalgeometry/circles/quiz2circles', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/circles/quiz2circles');
})

router.get('/jeemaths/analyticalgeometry/conicsections', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections');
})
router.get('/jeemaths/analyticalgeometry/conicsections/introduction', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/introduction');
})
router.get('/jeemaths/analyticalgeometry/conicsections/sectionsofacone', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/sectionsofacone');
})
router.get('/jeemaths/analyticalgeometry/conicsections/focidirectricesandeccentricity', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/focidirectricesandeccentricity');
})
router.get('/jeemaths/analyticalgeometry/conicsections/parabola', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/parabola');
})
router.get('/jeemaths/analyticalgeometry/conicsections/ellipse', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/ellipse');
})
router.get('/jeemaths/analyticalgeometry/conicsections/hyperbola', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/hyperbola');
})
router.get('/jeemaths/analyticalgeometry/conicsections/parametricequationsequationsoftangentandnormal', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/parametricequationsequationsoftangentandnormal');
})
router.get('/jeemaths/analyticalgeometry/conicsections/quiz3conicsections', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/conicsections/quiz3conicsections');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/introduction', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/introduction');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/directioncosinesanddirectionratiosofaline', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/directioncosinesanddirectionratiosofaline');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/equationofalineinspace', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/equationofalineinspace');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/anglebetweentwolines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/anglebetweentwolines');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/shortestdistancebetweentwolines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/shortestdistancebetweentwolines');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/plane', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/plane');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/coplanarityoftwolines', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/coplanarityoftwolines');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/distanceofapointfromaplane', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/distanceofapointfromaplane');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/anglebetweenalineandaplane', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/anglebetweenalineandaplane');
})
router.get('/jeemaths/analyticalgeometry/threedimensionalgeometry/quiz4threedimensionalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/analyticalgeometry/threedimensionalgeometry/quiz4threedimensionalgeometry');
})

router.get('/jeemaths/differentialcalculus', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus');
})
router.get('/jeemaths/differentialcalculus/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/coursestart');
})
router.get('/jeemaths/differentialcalculus/functions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions');
})
router.get('/jeemaths/differentialcalculus/functions/introduction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/introduction');
})
router.get('/jeemaths/differentialcalculus/functions/typesofrelationsandfunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/typesofrelationsandfunctions');
})
router.get('/jeemaths/differentialcalculus/functions/realvaluedfunctionsofarealvariableintoontoandonetoonefunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/realvaluedfunctionsofarealvariableintoontoandonetoonefunctions');
})
router.get('/jeemaths/differentialcalculus/functions/sumdifferenceproductandquotientoftwofunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/sumdifferenceproductandquotientoftwofunctions');
})
router.get('/jeemaths/differentialcalculus/functions/compositefunctionsabsolutevaluepolynomialrationaltrigonometricexponentialandlogarithmicfunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/compositefunctionsabsolutevaluepolynomialrationaltrigonometricexponentialandlogarithmicfunctions');
})
router.get('/jeemaths/differentialcalculus/functions/evenandoddfunctionsandinverseofafunction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/evenandoddfunctionsandinverseofafunction');
})
router.get('/jeemaths/differentialcalculus/functions/continuityofcompositefunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/continuityofcompositefunctions');
})
router.get('/jeemaths/differentialcalculus/functions/quiz1functions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/functions/quiz1functions');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/introduction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/introduction');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/limits', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/limits');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/limitsoftrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/limitsoftrigonometricfunctions');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/intuitiveideaofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/intuitiveideaofderivatives');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/derivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/derivatives');
})
router.get('/jeemaths/differentialcalculus/limitsandderivatives/quiz2limitsandderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/limitsandderivatives/quiz2limitsandderivatives');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/inroduction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/inroduction');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/continuity', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/continuity');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/differentiability', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/differentiability');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/exponentialandlogarithmicfunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/exponentialandlogarithmicfunctions');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/logarithmicdifferentiation', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/logarithmicdifferentiation');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/derivativesoffunctionsinparametricforms', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/derivativesoffunctionsinparametricforms');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/secondorderderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/secondorderderivatives');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/lhospitalruleofevaluationoflimitsoffunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/lhospitalruleofevaluationoflimitsoffunctions');
})
router.get('/jeemaths/differentialcalculus/continuityanddifferentiability/quiz3continuityanddifferentiability', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/continuityanddifferentiability/quiz3continuityanddifferentiability');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/introduction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/introduction');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/rateofchangeofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/rateofchangeofderivatives');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/chainrulederivativesofpolynomialrationaltrigonometricinversetrigonometricexponentialandlogarithmicfunctions', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/chainrulederivativesofpolynomialrationaltrigonometricinversetrigonometricexponentialandlogarithmicfunctions');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/derivativesofimplicitfunctionsderivativesuptoordertwogeometricalinterpretationofthederivative', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/derivativesofimplicitfunctionsderivativesuptoordertwogeometricalinterpretationofthederivative');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/tangentsandnormalsincreasinganddecreasingfunctionsmaximumandminimumvaluesofafunction', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/tangentsandnormalsincreasinganddecreasingfunctionsmaximumandminimumvaluesofafunction');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/rollestheoremandlagrangesmeanvaluetheorem', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/rollestheoremandlagrangesmeanvaluetheorem');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/approximations', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/approximations');
})
router.get('/jeemaths/differentialcalculus/applicationsofderivatives/quiz4applicationsofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/differentialcalculus/applicationsofderivatives/quiz4applicationsofderivatives');
})

router.get('/jeemaths/integralcalculus', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus');
})
router.get('/jeemaths/integralcalculus/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/coursestart');
})
router.get('/jeemaths/integralcalculus/integration', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration');
})
router.get('/jeemaths/integralcalculus/integration/introduction', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/introduction');
})
router.get('/jeemaths/integralcalculus/integration/integrationasaninverseprocessofdifferentiation', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/integrationasaninverseprocessofdifferentiation');
})
router.get('/jeemaths/integralcalculus/integration/methodsofintegration', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/methodsofintegration');
})
router.get('/jeemaths/integralcalculus/integration/integralsofsomeparticularfunctions', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/integralsofsomeparticularfunctions');
})
router.get('/jeemaths/integralcalculus/integration/integrationbypartialfunctions', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/integrationbypartialfunctions');
})
router.get('/jeemaths/integralcalculus/integration/definiteintegration', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/definiteintegration');
})
router.get('/jeemaths/integralcalculus/integration/fundamentaltheoremofcalculus', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/fundamentaltheoremofcalculus');
})
router.get('/jeemaths/integralcalculus/integration/evaluationofdefiniteintegralsbysubstitution', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/evaluationofdefiniteintegralsbysubstitution');
})
router.get('/jeemaths/integralcalculus/integration/somepropertiesofdefiniteintegrals', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/somepropertiesofdefiniteintegrals');
})
router.get('/jeemaths/integralcalculus/integration/quiz1integration', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/integration/quiz1integration');
})

router.get('/jeemaths/integralcalculus/applicationofintegrals', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/applicationofintegrals');
})
router.get('/jeemaths/integralcalculus/applicationofintegrals/introduction', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/applicationofintegrals/introduction');
})
router.get('/jeemaths/integralcalculus/applicationofintegrals/areaundersimplecurves', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/applicationofintegrals/areaundersimplecurves');
})
router.get('/jeemaths/integralcalculus/applicationofintegrals/areabetweentwocurves', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/applicationofintegrals/areabetweentwocurves');
})
router.get('/jeemaths/integralcalculus/applicationofintegrals/quiz2applicationofintegrals', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/applicationofintegrals/quiz2applicationofintegrals');
})

router.get('/jeemaths/integralcalculus/differentialequations', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations');
})
router.get('/jeemaths/integralcalculus/differentialequations/introduction', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/introduction');
})
router.get('/jeemaths/integralcalculus/differentialequations/basicconcepts', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/basicconcepts');
})
router.get('/jeemaths/integralcalculus/differentialequations/generalandparticularsolutionsofadifferentialequation', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/generalandparticularsolutionsofadifferentialequation');
})
router.get('/jeemaths/integralcalculus/differentialequations/formationofadifferentialequationwhosegeneralsolutionisgiven', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/formationofadifferentialequationwhosegeneralsolutionisgiven');
})
router.get('/jeemaths/integralcalculus/differentialequations/methodsofsolvingfirstorderfirstdegreedifferentialequations', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/methodsofsolvingfirstorderfirstdegreedifferentialequations');
})
router.get('/jeemaths/integralcalculus/differentialequations/quiz3differentialequations', function(req, res, next){
  res.render('front-end/jeemaths/integralcalculus/differentialequations/quiz3differentialequations');
})

router.get('/jeemaths/vectors', function(req, res, next){
  res.render('front-end/jeemaths/vectors');
})
router.get('/jeemaths/vectors/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/vectors/coursestart');
})
router.get('/jeemaths/vectors/vectoralgebra', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra');
})
router.get('/jeemaths/vectors/vectoralgebra/introduction', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/introduction');
})
router.get('/jeemaths/vectors/vectoralgebra/somebasicconcepts', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/somebasicconcepts');
})
router.get('/jeemaths/vectors/vectoralgebra/typesofvectors', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/typesofvectors');
})
router.get('/jeemaths/vectors/vectoralgebra/additionofvectors', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/additionofvectors');
})
router.get('/jeemaths/vectors/vectoralgebra/multiplicationofavectorbyascalar', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/multiplicationofavectorbyascalar');
})
router.get('/jeemaths/vectors/vectoralgebra/productoftwoscalars', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/productoftwoscalars');
})
router.get('/jeemaths/vectors/vectoralgebra/quiz1vectoralgebra', function(req, res, next){
  res.render('front-end/jeemaths/vectors/vectoralgebra/quiz1vectoralgebra');
})

router.get('/jeemaths/jeemathscomplete', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete');
})
router.get('/jeemaths/jeemathscomplete/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/coursestart');
})
router.get('/jeemaths/jeemathscomplete/algebra', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra');
})
router.get('/jeemaths/jeemathscomplete/algebra/complex/numbers/', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/complexnumbers');
})
router.get('/jeemaths/jeemathscomplete/algebra/quadraticequations', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/quadraticequations');
})
router.get('/jeemaths/jeemathscomplete/algebra/sequenceandseries', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/sequenceandseries');
})
router.get('/jeemaths/jeemathscomplete/algebra/binomialtheorem', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/binomialtheorem');
})
router.get('/jeemaths/jeemathscomplete/algebra/permutationsandcombinations', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/permutationsandcombinations');
})
router.get('/jeemaths/jeemathscomplete/algebra/matrices', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/matrices');
})
router.get('/jeemaths/jeemathscomplete/algebra/determinants', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/determinants');
})
router.get('/jeemaths/jeemathscomplete/algebra/probability', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/algebra/probability');
})

router.get('/jeemaths/jeemathscomplete/trigonometry', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/trigonometry');
})
router.get('/jeemaths/jeemathscomplete/trigonometry/trigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/trigonometry/trigonometricfunctions');
})
router.get('/jeemaths/jeemathscomplete/trigonometry/inversetrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/trigonometry/inversetrigonometricfunctions');
})

router.get('/jeemaths/jeemathscomplete/analyticalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/analyticalgeometry');
})
router.get('/jeemaths/jeemathscomplete/analyticalgeometry/straightlines', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/analyticalgeometry/straightlines');
})
router.get('/jeemaths/jeemathscomplete/analyticalgeometry/circles', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/analyticalgeometry/circles');
})
router.get('/jeemaths/jeemathscomplete/analyticalgeometry/conicsections', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/analyticalgeometry/conicsections');
})
router.get('/jeemaths/jeemathscomplete/analyticalgeometry/threedimensionalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/analyticalgeometry/threedimensionalgeometry');
})

router.get('/jeemaths/jeemathscomplete/differentialcalculus', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/differentialcalculus');
})
router.get('/jeemaths/jeemathscomplete/differentialcalculus/functions', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/differentialcalculus/functions');
})
router.get('/jeemaths/jeemathscomplete/differentialcalculus/limitsandderivatives', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/differentialcalculus/limitsandderivatives');
})
router.get('/jeemaths/jeemathscomplete/differentialcalculus/continuityanddifferentiability', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/differentialcalculus/continuityanddifferentiability');
})
router.get('/jeemaths/jeemathscomplete/differentialcalculus/applicationofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/differentialcalculus/applicationofderivatives');
})

router.get('/jeemaths/jeemathscomplete/integralcalculus', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/integralcalculus');
})
router.get('/jeemaths/jeemathscomplete/integralcalculus/integration', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/integralcalculus/integration');
})
router.get('/jeemaths/jeemathscomplete/integralcalculus/applicationofintegrals', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/integralcalculus/applicationofintegrals');
})
router.get('/jeemaths/jeemathscomplete/integralcalculus/differentialequations', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/integralcalculus/differentialequations');
})

router.get('/jeemaths/jeemathscomplete/vectors', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/vectors');
})
router.get('/jeemaths/jeemathscomplete/vectors/vectoralgebra', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/vectors/vectoralgebra');
})

router.get('/jeemaths/previousyearpapers', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers');
})
router.get('/jeemaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/coursestart');
})
router.get('/jeemaths/previousyearpapers/algebra', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra');
})
router.get('/jeemaths/previousyearpapers/algebra/complexnumbers', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/complexnumbers');
})
router.get('/jeemaths/previousyearpapers/algebra/quadraticequations', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/quadraticequations');
})
router.get('/jeemaths/previousyearpapers/algebra/sequenceandseries', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/sequenceandseries');
})
router.get('/jeemaths/previousyearpapers/algebra/binomialtheorem', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/binomialtheorem');
})
router.get('/jeemaths/previousyearpapers/algebra/permutationsandcombinations', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/permutationsandcombinations');
})
router.get('/jeemaths/previousyearpapers/algebra/matrices', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/matrices');
})
router.get('/jeemaths/previousyearpapers/algebra/determinants', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/determinants');
})
router.get('/jeemaths/previousyearpapers/algebra/probability', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/algebra/probability');
})

router.get('/jeemaths/previousyearpapers/trigonometry', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/trigonometry');
})
router.get('/jeemaths/previousyearpapers/trigonometry/trigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/trigonometry/trigonometricfunctions');
})
router.get('/jeemaths/previousyearpapers/trigonometry/inversetrigonometricfunctions', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/trigonometry/inversetrigonometricfunctions');
})

router.get('/jeemaths/previousyearpapers/analyticalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/analyticalgeometry');
})
router.get('/jeemaths/previousyearpapers/analyticalgeometry/straightlines', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/analyticalgeometry/straightlines');
})
router.get('/jeemaths/previousyearpapers/analyticalgeometry/circles', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/analyticalgeometry/circles');
})
router.get('/jeemaths/previousyearpapers/analyticalgeometry/conicsections', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/analyticalgeometry/conicsections');
})
router.get('/jeemaths/previousyearpapers/analyticalgeometry/threedimensionalgeometry', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/analyticalgeometry/threedimensionalgeometry');
})

router.get('/jeemaths/previousyearpapers/differentialcalculus', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/differentialcalculus');
})
router.get('/jeemaths/previousyearpapers/differentialcalculus/functions', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/differentialcalculus/functions');
})
router.get('/jeemaths/previousyearpapers/differentialcalculus/limitsandderivatives', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/differentialcalculus/limitsandderivatives');
})
router.get('/jeemaths/previousyearpapers/differentialcalculus/continuityanddifferentiability', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/differentialcalculus/continuityanddifferentiability');
})
router.get('/jeemaths/previousyearpapers/differentialcalculus/applicationofderivatives', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapersdifferentialcalculus/applicationofderivatives');
})

router.get('/jeemaths/previousyearpapers/integralcalculus', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/integralcalculus');
})
router.get('/jeemaths/previousyearpapers/integralcalculus/integration', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/integralcalculus/integration');
})
router.get('/jeemaths/previousyearpapers/integralcalculus/applicationofintegrals', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/integralcalculus/applicationofintegrals');
})
router.get('/jeemaths/previousyearpapers/integralcalculus/differentialequations', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/integralcalculus/differentialequations');
})

router.get('/jeemaths/previousyearpapers/vectors', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/vectors');
})
router.get('/jeemaths/previousyearpapers/vectors/vectoralgebra', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/vectors/vectoralgebra');
})


router.get('/xiimaths', function(req, res, next){
  res.render('front-end/xiimaths');
})

router.get('/xiimaths/syllabus', function(req, res, next){
  res.render('front-end/xiimaths/syllabus');
})
router.get('/xiimaths/relationsandfunctions', function(req, res, next){
  res.render('front-end/xiimaths/relationsandfunctions');
})
router.get('/xiimaths/relationsandfunctions/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/relationsandfunctions/coursestart');
})
router.get('/xiimaths/algebra', function(req, res, next){
  res.render('front-end/xiimaths/algebra');
})
router.get('/xiimaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/algebra/coursestart');
})
router.get('/xiimaths/calculus', function(req, res, next){
  res.render('front-end/xiimaths/calculus');
})
router.get('/xiimaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/calculus/coursestart');
})
router.get('/xiimaths/vectorsandthreedimensionalgeometry', function(req, res, next){
  res.render('front-end/xiimaths/vectorsandthreedimensionalgeometry');
})
router.get('/xiimaths/vectorsandthreedimensionalgeometry/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/vectorsandthreedimensionalgeometry/coursestart');
})
router.get('/xiimaths/linearprogramming', function(req, res, next){
  res.render('front-end/xiimaths/linearprogramming');
})
router.get('/xiimaths/linearprogramming/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/linearprogramming/coursestart');
})
router.get('/xiimaths/probability', function(req, res, next){
  res.render('front-end/xiimaths/probability');
})
router.get('/xiimaths/probability/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/probability/coursestart');
})
router.get('/xiimaths/statisticsandprobability', function(req, res, next){
  res.render('front-end/xiimaths/statisticsandprobability');
})
router.get('/xiimaths/statisticsandprobability/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/statisticsandprobability/coursestart');
})
router.get('/xiimaths/xiimathscomplete', function(req, res, next){
  res.render('front-end/xiimaths/xiimathscomplete');
})
router.get('/xiimaths/xiimathscomplete/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/xiimathscomplete/coursestart');
})
router.get('/xiimaths/previousyearpapers', function(req, res, next){
  res.render('front-end/xiimaths/previousyearpapers');
})
router.get('/xiimaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/xiimaths/previousyearpapers/coursestart');
})


router.get('/ximaths', function(req, res, next){
  res.render('front-end/ximaths');
})
router.get('/ximaths/syllabus', function(req, res, next){
  res.render('front-end/ximaths/syllabus');
})
router.get('/ximaths/setsandfunctions', function(req, res, next){
  res.render('front-end/ximaths/setsandfunctions');
})
router.get('/ximaths/setsandfunctions/coursestart', function(req, res, next){
  res.render('front-end/ximaths/setsandfunctions/coursestart');
})
router.get('/ximaths/algebra', function(req, res, next){
  res.render('front-end/ximaths/algebra');
})
router.get('/ximaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/ximaths/algebra/coursestart');
})
router.get('/ximaths/coordinategeometry', function(req, res, next){
  res.render('front-end/ximaths/coordinategeometry');
})
router.get('/ximaths/coordinategeometry/coursestart/coursestart', function(req, res, next){
  res.render('front-end/ximaths/coordinategeometry/coursestart');
})
router.get('/ximaths/calculus', function(req, res, next){
  res.render('front-end/ximaths/calculus');
})
router.get('/ximaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/ximaths/calculus/coursestart');
})
router.get('/ximaths/mathematicalreasoning', function(req, res, next){
  res.render('front-end/ximaths/mathematicalreasoning');
})
router.get('/ximaths/mathematicalreasoning/coursestart', function(req, res, next){
  res.render('front-end/ximaths/mathematicalreasoning/coursestart');
})
router.get('/ximaths/statisticsandprobability', function(req, res, next){
  res.render('front-end/ximaths/statisticsandprobability');
})
router.get('/ximaths/statisticsandprobability/coursestart/coursestart', function(req, res, next){
  res.render('front-end/ximaths/statisticsandprobability/coursestart');
})
router.get('/ximaths/ximathscomplete', function(req, res, next){
  res.render('front-end/ximaths/ximathscomplete');
})
router.get('/ximaths/ximathscomplete/coursestart', function(req, res, next){
  res.render('front-end/ximaths/ximathscomplete/coursestart');
})
router.get('/ximaths/previousyearpapers', function(req, res, next){
  res.render('front-end/ximaths/previousyearpapers');
})
router.get('/ximaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/ximaths/previousyearpapers/coursestart');
})


router.get('/xmaths', function(req, res, next){
  res.render('front-end/xmaths');
})

router.get('/xmaths/syllabus', function(req, res, next){
  res.render('front-end/xmaths/syllabus');
})
router.get('/xmaths/numbersystems', function(req, res, next){
  res.render('front-end/xmaths/numbersystems');
})
router.get('/xmaths/numbersystems/coursestart', function(req, res, next){
  res.render('front-end/xmaths/numbersystems/coursestart');
})
router.get('/xmaths/algebra', function(req, res, next){
  res.render('front-end/xmaths/algebra');
})
router.get('/xmaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/xmaths/algebra/coursestart');
})
router.get('/xmaths/coordinategeometry', function(req, res, next){
  res.render('front-end/xmaths/coordinategeometry');
})
router.get('/xmaths/coordinategeometry/coursestart', function(req, res, next){
  res.render('front-end/xmaths/coordinategeometry/coursestart');
})
router.get('/xmaths/geometry', function(req, res, next){
  res.render('front-end/xmaths/geometry');
})
router.get('/xmaths/geometry/coursestart', function(req, res, next){
  res.render('front-end/xmaths/geometry/coursestart');
})
router.get('/xmaths/trigonometry', function(req, res, next){
  res.render('front-end/xmaths/trigonometry');
})
router.get('/xmaths/trigonometry/coursestart', function(req, res, next){
  res.render('front-end/xmaths/trigonometry/coursestart');
})
router.get('/xmaths/mensuration', function(req, res, next){
  res.render('front-end/xmaths/mensuration');
})
router.get('/xmaths/mensuration/coursestart', function(req, res, next){
  res.render('front-end/xmaths/mensuration/coursestart');
})
router.get('/xmaths/statisticsandprobability', function(req, res, next){
  res.render('front-end/xmaths/statisticsandprobability');
})
router.get('/xmaths/statisticsandprobability/coursestart', function(req, res, next){
  res.render('front-end/xmaths/statisticsandprobability/coursestart');
})
router.get('/xmaths/xmathscomplete', function(req, res, next){
  res.render('front-end/xmaths/xmathscomplete');
})
router.get('/xmaths/xmathscomplete/coursestart', function(req, res, next){
  res.render('front-end/xmaths/xmathscomplete/coursestart');
})
router.get('/xmaths/previousyearpapers', function(req, res, next){
  res.render('front-end/xmaths/previousyearpapers');
})
router.get('/xmaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/xmaths/previousyearpapers/coursestart');
})


router.get('/ixmaths', function(req, res, next){
  res.render('front-end/ixmaths');
})

router.get('/ixmaths/syllabus', function(req, res, next){
  res.render('front-end/ixmaths/syllabus');
})
router.get('/ixmaths/numbersystems', function(req, res, next){
  res.render('front-end/ixmaths/numbersystems');
})
router.get('/ixmaths/numbersystems/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/numbersystems/coursestart');
})
router.get('/ixmaths/algebra', function(req, res, next){
  res.render('front-end/ixmaths/algebra');
})
router.get('/ixmaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/algebra/coursestart');
})
router.get('/ixmaths/coordinategeometry', function(req, res, next){
  res.render('front-end/ixmaths/coordinategeometry');
})
router.get('/ixmaths/coordinategeometry/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/coordinategeometry/coursestart');
})
router.get('/ixmaths/geometry', function(req, res, next){
  res.render('front-end/ixmaths/geometry');
})
router.get('/ixmaths/geometry/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/geometry/coursestart');
})
router.get('/ixmaths/mensuration', function(req, res, next){
  res.render('front-end/ixmaths/mensuration');
})
router.get('/ixmaths/mensuration/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/mensuration/coursestart');
})
router.get('/ixmaths/statisticsandprobability', function(req, res, next){
  res.render('front-end/ixmaths/statisticsandprobability');
})
router.get('/ixmaths/statisticsandprobability/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/statisticsandprobability/coursestart');
})
router.get('/ixmaths/ixmathscomplete', function(req, res, next){
  res.render('front-end/ixmaths/ixmathscomplete');
})
router.get('/ixmaths/ixmathscomplete/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/ixmathscomplete/coursestart');
})
router.get('/ixmaths/previousyearpapers', function(req, res, next){
  res.render('front-end/ixmaths/previousyearpapers');
})
router.get('/ixmaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/ixmaths/previousyearpapers/coursestart');
})

router.get('/careforcareer', function(req, res, next){
  res.render('front-end/careforcareer');
})

router.get('/careforcareer/visitourgroup', function(req, res, next){
  res.redirect('https://www.facebook.com/groups/261170104727090/');
})

router.get('/careforcareer/blogs', function(req, res, next){
  res.render('front-end/careforcareer/blogs');
})

router.get('/careforcareer/podcasts', function(req, res, next){
  res.render('front-end/careforcareer/podcasts');
})



module.exports = router;
