/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Device = mongoose.model('Device');

/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {
  var criteria = { tags: req.param('tag') };
  var perPage = 5;
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria: criteria
  };

  Device.list(options, function(err, articles) {
    if (err) return res.render('500');
    Device.count(criteria).exec(function (err, count) {
      res.render('articles/index', {
        title: 'Devices tagged ' + req.param('tag'),
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};
