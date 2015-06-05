
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Application = mongoose.model('Application')
var utils = require('../../lib/utils')
var extend = require('util')._extend

/**
 * Load
 */

exports.load = function (req, res, next, id){
  // var User = mongoose.model('User');

  Application.loadById(id, function (err, application) {
    if (err) return next(err);
    if (!application) return next(new Error('not found'));
    req.application = application;
    next();
  });
};

/**
 * List
 */

exports.index = function (req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    criteria:{user:req.user.id},
    perPage: perPage,
    page: page
  };

  Application.list(options, function (err, applications) {
    if (err) return res.render('500');
    Application.count().exec(function (err, count) {
      res.render('applications/index', {
        title: 'Applications',
        applications: applications,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

/**
 * New application
 */

exports.new = function (req, res){
  res.render('applications/new', {
    title: 'New Application',
    application: new Application({})
  });
};

/**
 * Create an application
 * Upload an image
 */

exports.create = function (req, res) {
  var application = new Application(req.body);
  application.user = req.user;
  application.save(function (err) {
    if (!err) {
      req.flash('success', 'Successfully created application!');
      return res.redirect('/applications/'+application._id);
    }
    res.render('applications/new', {
      title: 'New Application',
      application: application,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Edit an application
 */

exports.edit = function (req, res) {
  res.render('applications/edit', {
    title: 'Edit ' + req.application.name,
    application: req.application
  });
};

/**
 * Update application
 */

exports.update = function (req, res){
  var application = req.application;
  
  // make sure no one changes the user
  delete req.body.user;
  if(!req.body.tags) req.body.tags='';
  application = extend(application, req.body);

  application.save(function (err) {
    if (!err) {
      return res.redirect('/applications/' + application._id);
    }

    res.render('applications/edit', {
      title: 'Edit Application',
      application: application,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */

exports.show = function (req, res){
  res.render('applications/show', {
    title: req.application.name,
    application: req.application
  });
};

/**
 * Delete an application
 */

exports.destroy = function (req, res){
  var application = req.application;
  application.remove(function (err){
    req.flash('info', 'Deleted successfully');
    res.redirect('/applications');
  });
};
