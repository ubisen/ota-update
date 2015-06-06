
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Firmware = mongoose.model('Firmware')
var utils = require('../../lib/utils')
var extend = require('util')._extend
// var Grid = require('gridfs-stream');
// Grid.mongo = mongoose.mongo;
// var gfs = new Grid(mongoose.connection.db);
// var multer  = require('multer')

/**
 * Load
 */

exports.load = function (req, res, next, id){
  Firmware.loadById(id, function (err, firmware) {
    if (err) return next(err);
    if (!firmware) return next(new Error('not found'));
    req.firmware = firmware;
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

  Firmware.list(options, function (err, firmwares) {
    if (err) return res.render('500');
    Firmware.count().exec(function (err, count) {
      res.render('firmwares/index', {
        title: 'Firmwares',
        firmwares: firmwares,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

/**
 * New firmware
 */

exports.new = function (req, res){
  res.render('firmwares/new', {
    title: 'New Firmware',
    firmware: new Firmware({})
  });
};

/**
 * Create an firmware
 * Upload an image
 */

exports.create = function (req, res) {
  var firmware = new Firmware(req.body);
  
  // If using grs but limit < 16M
  /*var part = req.files.data;
  var writeStream = gfs.createWriteStream({
    filename: part.name,
    mode: 'w',
    content_type:part.mimetype
  });
  writeStream.on('close', function() {
   return res.status(200).send({
    message: 'Success'
  });
 });
  
  writeStream.write(part.data);
  writeStream.end();
  console.log(req.files.data);
  */
  if(req.files && req.files.data && req.files.data.data){
    firmware.data = req.files.data;
    firmware.name = req.files.data.name;
    firmware.mimetype = req.files.data.mimetype;
    firmware.size = req.files.data.size;

    // should validate size on before
    if(firmware.size > 1000000){
      return res.render('firmwares/new', {
        title: 'New Firmware',
        firmware: firmware,
        errors: ["File limit size 1M"]
      });

    }
  }
  
  firmware.user = req.user;
  firmware.save(function (err) {
    if (!err) {
      req.flash('success', 'Successfully created firmware!');
      return res.redirect('/firmwares/'+firmware._id);
    }
    res.render('firmwares/new', {
      title: 'New Firmware',
      firmware: firmware,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Download
 */
exports.download = function (req, res) {
  // if using gfs
  /*
  gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
 
      if(files.length===0){
      return res.status(400).send({
        message: 'File not found'
      });
      }
  
    res.writeHead(200, {'Content-Type': files[0].contentType});
    
    var readstream = gfs.createReadStream({
        filename: files[0].filename
    });
 
      readstream.on('data', function(data) {
          res.write(data);
      });
      
      readstream.on('end', function() {
          res.end();        
      });
 
    readstream.on('error', function (err) {
      console.log('An error occurred!', err);
      throw err;
    });
  });
  */
  res.setHeader('Content-disposition', 'attachment; filename='+req.firmware.name);
  res.setHeader('Content-type', req.firmware.mimetype);
  return res.send(req.firmware.data.data);
}
/**
 * Edit an firmware
 */

exports.edit = function (req, res) {
  res.render('firmwares/edit', {
    title: 'Edit ' + req.firmware.name,
    firmware: req.firmware
  });
};

/**
 * Update firmware
 */

exports.update = function (req, res){
  var firmware = req.firmware;
  
  // make sure no one changes the user
  delete req.body.user;
  delete req.body.name;
  if(!req.body.tags) req.body.tags='';
  firmware = extend(firmware, req.body);
  if(req.files && req.files.data && req.files.data.length > 0){
    firmware.data = req.files.data;
    firmware.name = req.files.data.name;
    firmware.mimetype = req.files.data.mimetype;
    firmware.size = req.files.data.size;
    // should validate size on before
    if(firmware.size > 1000000){
      return res.render('firmwares/new', {
        title: 'New Firmware',
        firmware: firmware,
        errors: ["File limit size 1M"]
      });
    }
  }
  firmware.save(function (err) {
    if (!err) {
      return res.redirect('/firmwares/' + firmware._id);
    }

    res.render('firmwares/edit', {
      title: 'Edit Firmware',
      firmware: firmware,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */

exports.show = function (req, res){
  
  res.render('firmwares/show', {
    title: req.firmware.name,
    firmware: req.firmware
  });
};

/**
 * Delete an firmware
 */

exports.destroy = function (req, res){
  var firmware = req.firmware;
  firmware.remove(function (err){
    req.flash('info', 'Deleted successfully');
    res.redirect('/firmwares');
  });
};
