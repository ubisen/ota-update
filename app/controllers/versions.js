
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
  
  if (!req.body.value||!req.body.image1_name||!req.body.image1_url||!req.body.image2_name||!req.body.image2_url) 
  	return res.redirect('/applications/'+ application.id);
  var version ={
  	value:req.body.value,
  	firmwares:[{
  			name:req.body.image1_name,
  			url:req.body.image1_url
  		},{
  			name:req.body.image2_name,
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
 * Delete version
 */

exports.destroy = function (req, res) {
  var application = req.application;
  application.removeComment(req.param('versionId'), function (err) {
    if (err) {
      req.flash('error', 'Oops! The version was not found');
    } else {
      req.flash('info', 'Removed version');
    }
    res.redirect('/applications/' + application.id);
  });
};
