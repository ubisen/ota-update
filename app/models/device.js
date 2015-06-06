
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Imager = require('imager');
var config = require('config');
var crypto = require('crypto');


var imagerConfig = require(config.root + '/config/imager.js');
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
 * Device Schema
 */

var DeviceSchema = new Schema({
  name: {type : String, default : '', trim : true,maxlength:[200,"Device name max length {VALUE}"]},
  description: {type : String, default : '', trim : true},
  user: {type : Schema.ObjectId, ref : 'User'},
  apiKey: { type: String, default: '' },
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
    createdAt: { type : Date, default : Date.now }
  }],
  tags: {type: [], get: getTags, set: setTags},
  // image: {
  //   cdnUri: String,
  //   files: []
  // },
  createdAt  : {type : Date, default : Date.now}
});

/**
 * Validations
 */

DeviceSchema.path('name').required(true, 'Device name cannot be blank');
// DeviceSchema.path('description').required(true, 'Device description cannot be blank');

/**
 * Pre-remove hook
 */

DeviceSchema.pre('remove', function (next) {
  // var imager = new Imager(imagerConfig, 'S3');
  // var files = this.image.files;

  // // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'Device');

  next();
});
/**
* Pre-save hook
*/
DeviceSchema.pre('save',function (next) {
  if (!this.isNew) return next();
  this.apiKey = crypto.randomBytes(32).toString('hex');
  return next();
});


/**
 * Methods
 */

DeviceSchema.methods = {

  /**
   * Save Device and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    // If using upload => comment it
    images = undefined;

    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3');
    var self = this;

    this.validate(function (err) {
      if (err) return cb(err);
      imager.upload(images, function (err, cdnUri, files) {
        if (err) return cb(err);
        if (files.length) {
          self.image = { cdnUri : cdnUri, files : files };
        }
        self.save(cb);
      }, 'Device');
    });
  },

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */

  addComment: function (user, comment, cb) {
    

    this.comments.push({
      body: comment.body,
      user: user._id
    });

    //Uncomment this when not use email notify
    // var notify = require('../mailer');
    // if (!this.user.email) this.user.email = 'email@product.com';
    // notify.comment({
    //   Device: this,
    //   currentUser: user,
    //   comment: comment.body
    // });

    this.save(cb);
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @param {Function} cb
   * @api private
   */

  removeComment: function (commentId, cb) {
    var index = utils.indexof(this.comments, { id: commentId });
    if (~index) this.comments.splice(index, 1);
    else return cb('not found');
    this.save(cb);
  }
}

/**
 * Statics
 */

DeviceSchema.statics = {

  /**
   * Find Device by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  loadById: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb);
  },
  /**
   * Find Device by name
   *
   * @param {String} name
   * @param {Function} cb
   * @api private
   */
  loadByApiKey:function (apiKey,cb) {
    this.findOne({ apiKey : apiKey })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb);
  },
  /**
   * List Devices
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

mongoose.model('Device', DeviceSchema);
