
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var BearerStrategy = require('passport-http-bearer').Strategy;
var config = require('config');
var User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new BearerStrategy(
  function(token, done) {
    var options = {
      criteria: { token: token },
      select: 'name username email hashed_password salt'
    };
    User.load(options, function (err, user) {
      if (err) return done(err)
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      return done(null, user);
    });
  }
);
