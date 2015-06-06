
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var utils = require('../../lib/utils');

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  var device = req.device;
  utils.findByParam(device.comments, { id: id }, function (err, comment) {
    if (err) return next(err);
    req.comment = comment;
    next();
  });
};

/**
 * Create comment
 */

exports.create = function (req, res) {
  var device = req.device;
  var user = req.user;
  if (!req.body.body) return res.redirect('/devices/'+ device.id);

  device.addComment(user, req.body, function (err) {
    if (err) return res.render('500');
    res.redirect('/devices/'+ device.id);
  });
}

/**
 * Delete comment
 */

exports.destroy = function (req, res) {
  var device = req.device;
  device.removeComment(req.param('commentId'), function (err) {
    if (err) {
      req.flash('error', 'Oops! The comment was not found');
    } else {
      req.flash('info', 'Removed comment');
    }
    res.redirect('/devices/' + device.id);
  });
};
