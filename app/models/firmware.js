/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var utils = require('../../lib/utils');

var Schema = mongoose.Schema;


var getTags = function (tags) {
  return tags.join(',');
};
var setTags = function (tags) {
  return tags.split(',');
};
var FirmwareSchema = new Schema({
	data: { data: Buffer, contentType: String },
	mimetype:{type : String, default : '', trim : true},
	size:{type : Number, default : 0,max:[1000000,'File max size 1M']},
	name: {type : String, default : '', trim : true},
	user: {type : Schema.ObjectId, ref : 'User'},
  description: {type : String, default : '', trim : true,maxlength:[500,"File desctiption max length {VALUE}"]},
  tags: {type: [], get: getTags, set: setTags},
  createdAt  : {type : Date, default : Date.now}
});

FirmwareSchema.path('name').required(true, 'File upload required');
/**
 * Pre-remove hook
 */

FirmwareSchema.pre('remove', function (next) {
  next();
});
/**
* Pre-save hook
*/

FirmwareSchema.pre('save',function (next) {
	// if(this.data){
	// 	return next(new Error("Firmware data required"));
	// }
 	next();
});


/**
 * Statics
 */

FirmwareSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
  load: function (options, cb) {
    options.select = options.select || 'data name description';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },
  /**
   * Find Application by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  loadById: function (id, cb) {
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
mongoose.model('Firmware', FirmwareSchema);