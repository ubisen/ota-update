
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Device = mongoose.model('Device')
var utils = require('../../lib/utils')
var extend = require('util')._extend

/**
 * Load
 */

exports.load = function (req, res, next, id){
  Device.load(id, function (err, device) {
    if (err) return next(err);
    if (!device) return next(new Error('not found'));
    req.device = device;
    next();
  });
};

/**
 * List
 */

exports.index = function (req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 10;
  var options = {
    perPage: perPage,
    page: page
  };

  Device.list(options, function (err, devices) {
    if (err) return res.render('500');
    Device.count().exec(function (err, count) {
      res.render('devices/index', {
        title: 'Devices',
        devices: devices,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

/**
 * New device
 */

exports.new = function (req, res){
  res.render('devices/new', {
    title: 'New Device',
    device: new Device({})
  });
};

/**
 * Create an device
 * Upload an image
 */

exports.create = function (req, res) {
  var device = new Device(req.body);
  var images = req.files.image
    ? [req.files.image]
    : undefined;

  device.user = req.user;
  device.uploadAndSave(images, function (err) {
    if (!err) {
      req.flash('success', 'Successfully created device!');
      return res.redirect('/devices/'+device._id);
    }
    res.render('devices/new', {
      title: 'New Device',
      device: device,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Edit an device
 */

exports.edit = function (req, res) {
  res.render('devices/edit', {
    title: 'Edit ' + req.device.name,
    device: req.device
  });
};

/**
 * Update device
 */

exports.update = function (req, res){
  var device = req.device;
  var images = req.files.image
    ? [req.files.image]
    : undefined;

  // make sure no one changes the user
  delete req.body.user;
  if(!req.body.tags) req.body.tags='';
  device = extend(device, req.body);

  device.uploadAndSave(images, function (err) {
    if (!err) {
      return res.redirect('/devices/' + device._id);
    }

    res.render('devices/edit', {
      title: 'Edit Device',
      device: device,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */

exports.show = function (req, res){
  res.render('devices/show', {
    title: req.device.name,
    device: req.device
  });
};

/**
 * Delete an device
 */

exports.destroy = function (req, res){
  var device = req.device;
  device.remove(function (err){
    req.flash('info', 'Deleted successfully');
    res.redirect('/devices');
  });
};
