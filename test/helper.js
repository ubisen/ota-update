
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , async = require('async')
  , Device = mongoose.model('Device')
  , User = mongoose.model('User')

/**
 * Clear database
 *
 * @param {Function} done
 * @api public
 */

exports.clearDb = function (done) {
  async.parallel([
    function (cb) {
      User.collection.remove(cb)
    },
    function (cb) {
      Device.collection.remove(cb)
    }
  ], done)
}
