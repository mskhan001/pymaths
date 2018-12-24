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
router.get('/engineeringmaths/calculus', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus');
})
router.get('/engineeringmaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/calculus/coursestart');
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

router.get('/engineeringmaths/analyticgeometry', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry');
})
router.get('/engineeringmaths/analyticgeometry/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/analyticgeometry/coursestart');
})
router.get('/engineeringmaths/complexanalysis', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis');
})
router.get('/engineeringmaths/complexanalysis/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/complexanalysis/coursestart');
})
router.get('/engineeringmaths/linearalgebra', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra');
})
router.get('/engineeringmaths/linearalgebra/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/linearalgebra/coursestart');
})
router.get('/engineeringmaths/linearprogramming', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming');
})
router.get('/engineeringmaths/linearprogramming/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/linearprogramming/coursestart');
})
router.get('/engineeringmaths/numericalmethods', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods');
})
router.get('/engineeringmaths/numericalmethods/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/numericalmethods/coursestart');
})
router.get('/engineeringmaths/ordinarydifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialequations');
})
router.get('/engineeringmaths/ordinarydifferentialquations/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/ordinarydifferentialquations/coursestart');
})
router.get('/engineeringmaths/partialdifferentialequations', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations');
})
router.get('/engineeringmaths/partialdifferentialequations/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/partialdifferentialequations/coursestart');
})
router.get('/engineeringmaths/vectoranalysis', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis');
})
router.get('/engineeringmaths/vectoranalysis/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/vectoranalysis/coursestart');
})
router.get('/engineeringmaths/probabilityandstatistics', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics');
})
router.get('/engineeringmaths/probabilityandstatistics/coursestart', function(req, res, next){
  res.render('front-end/engineeringmaths/probabilityandstatistics/coursestart');
})


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
router.get('/upscmaths/calculus', function(req, res, next){
  res.render('front-end/upscmaths/calculus');
})
router.get('/upscmaths/calculus/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/calculus/coursestart');
})
router.get('/upscmaths/analyticgeometry', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry');
})
router.get('/upscmaths/analyticgeometry/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/analyticgeometry/coursestart');
})
router.get('/upscmaths/ordinarydifferentialquations', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialquations');
})
router.get('/upscmaths/ordinarydifferentialquations/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/ordinarydifferentialquations/coursestart');
})
router.get('/upscmaths/dynamicsstaticsandhydrostatics', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsstaticsandhydrostatics');
})
router.get('/upscmaths/dynamicsstaticsandhydrostatics/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/dynamicsstaticsandhydrostatics/coursestart');
})
router.get('/upscmaths/vectoranalysis', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis');
})
router.get('/upscmaths/vectoranalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/vectoranalysis/coursestart');
})
router.get('/upscmaths/algebra', function(req, res, next){
  res.render('front-end/upscmaths/algebra');
})
router.get('/upscmaths/algebra/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/algebra/coursestart');
})
router.get('/upscmaths/realanalysis', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis');
})
router.get('/upscmaths/realanalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/realanalysis/coursestart');
})
router.get('/upscmaths/complexanalysis', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis');
})
router.get('/upscmaths/complexanalysis/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/complexanalysis/coursestart');
})
router.get('/upscmaths/linearprogramming', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming');
})
router.get('/upscmaths/linearprogramming/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/linearprogramming/coursestart');
})
router.get('/upscmaths/partialdifferentialquations', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialquations');
})
router.get('/upscmaths/partialdifferentialquations/coursestart', function(req, res, next){
  res.render('front-end/upscmaths/partialdifferentialquations/coursestart');
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
router.get('/jeemaths/vectors', function(req, res, next){
  res.render('front-end/jeemaths/vectors');
})
router.get('/jeemaths/vectors/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/vectors/coursestart');
})
router.get('/jeemaths/jeemathscomplete', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete');
})
router.get('/jeemaths/jeemathscomplete/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/jeemathscomplete/coursestart');
})
router.get('/jeemaths/previousyearpapers', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers');
})
router.get('/jeemaths/previousyearpapers/coursestart', function(req, res, next){
  res.render('front-end/jeemaths/previousyearpapers/coursestart');
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
