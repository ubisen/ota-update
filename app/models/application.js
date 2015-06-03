
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var utils = require('../../lib/utils');

var Schema = mongoose.Schema;

/**
 * Getters
 */

var getTags = function (tags) {
  return tags.join(',');
};

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',');
};


/**
 * Application Schema
 */

var ApplicationSchema = new Schema({
  name: {type : String, default : '', trim : true},
  description: {type : String, default : '', trim : true,maxlength:[200,"Application desctiption max length {VALUE}"]},
  user: {type : Schema.ObjectId, ref : 'User'},
  createdAt  : {type : Date, default : Date.now},
  versions: [{
    value: { type : String, default : '', trim : true, required: [true,'Version value cannot be blank']},
    firmwares: [
      {
        name:{type : String, default : '', trim : true, required: [true,'Firmware name cannot be blank']},
        url:{type : String, default : '', trim : true, required: [true,'Firmware url cannot be blank']}
      }
    ],
    createdAt: { type : Date, default : Date.now }
  }],
  tags: {type: [], get: getTags, set: setTags}
});

/**
 * Validations
 */

ApplicationSchema.path('name').required(true, 'Application name cannot be blank');
ApplicationSchema.path('name').match(/^[a-z0-9_+-]+$/i, 'Application name only +, -, _, letters and numbers allowed');

/**
 * Pre-remove hook
 */

ApplicationSchema.pre('remove', function (next) {
  next();
});
/**
* Pre-save hook
*/
ApplicationSchema.pre('save',function (next) {
  if (!this.isNew) return next();
  return next();
});


/**
 * Methods
 */

ApplicationSchema.methods = {

  /**
   * Add version
   *
   * @param {User} user
   * @param {Object} version
   * @param {Function} cb
   * @api private
   */

  addVersion: function (version, cb) {
    
    console.log(version);
    this.versions.push(version);
    this.save(cb);
  },

  /**
   * Remove version
   *
   * @param {versionId} String
   * @param {Function} cb
   * @api private
   */

  removeComment: function (versionId, cb) {
    var index = utils.indexof(this.versions, { id: versionId });
    if (~index) this.versions.splice(index, 1);
    else return cb('not found');
    this.save(cb);
  }
}



/**
 * Statics
 */

ApplicationSchema.statics = {

  /**
   * Find Application by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb);
  },

  /**
   * List Applications
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }
}

mongoose.model('Application', ApplicationSchema);
