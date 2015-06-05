
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var utils = require('../../lib/utils');

/**
 * Load version
 */

exports.load = function (req, res, next, id) {
  var application = req.application;
  utils.findByParam(application.versions, { id: id }, function (err, version) {
    if (err) return next(err);
    req.version = version;
    next();
  });
};

/**
 * Create version
 */

exports.create = function (req, res) {
  var application = req.application;
  
  if (!req.body.version||!req.body.image1_url||!req.body.image2_url) 
  	return res.redirect('/applications/'+ application.id);
  var version ={
  	version:req.body.version,
  	firmwares:[{
  			name:"image1",
  			url:req.body.image1_url
  		},{
  			name:"image2",
  			url:req.body.image2_url
  		}
  	]
  }
  application.addVersion(version, function (err) {
    if (err) return res.render('500');
    res.redirect('/applications/'+ application.id);
  });
}

/**
 * Create version
 */

exports.createApi = function (req, res) {
  var application = req.application;
  application.addVersion(req.body, function (err) {
    if (err){
      // console.log(err);
      errors = utils.errors(err.errors || err);
      return res.status(400).send({errors:errors});
    }
    res.status(201).send(req.body);
  });
}
/**
 * Delete version
 */

exports.destroy = function (req, res) {
  var application = req.application;
  application.removeVersion(req.param('versionId'), function (err) {
    if (err) {
      req.flash('error', 'Oops! The version was not found');
    } else {
      req.flash('info', 'Removed version');
    }
    res.redirect('/applications/' + application.id);
  });
};
