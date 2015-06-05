var mongoose = require('mongoose');
var User = mongoose.model('User');
var Device = mongoose.model('Device');
var Application = mongoose.model('Application');

var async = require("async")

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
}
exports.loadApplicationByApiKeyByName = function (req, res, next, name) {
  if(!req.headers["api-key"])
      return res.status(401).send({
        errors:["Authenticate fail! Api-key required"]
      });
    async.parallel([function (callback) {
      Device.loadByApiKey(req.headers["api-key"], callback);
    },function (callback) {
      User.findOne({ apiKey : req.headers["api-key"] },callback);
    }],function (err,datas) {
      
      var query = {name:name};
      
      if (err) 
          return res.status(500).send({errors:["Server errors"]});
      
      if(!datas[0] && !datas[1])
        return res.status(403).send({errors:["Access deny!"]});
      
      if(datas[0]){
        req.device = datas[0];
        query.user = datas[0].user;
      }
      
      if(datas[1]){
        req.user = datas[1];
        query.user = datas[1]._id;
      }

      Application.findOne(query, function (err, application) {
        if(err)
          return res.status(500).send({errors:["Server errors"]});
        if(!application)
          return res.status(403).send({errors:["Access deny!"]});
        req.application = application;
        next();
      });
    });
}
/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/users/' + req.profile.id)
    }
    next()
  },
  hasAuthorizationByApiKey : function (req,res,next) {
    if(!req.headers["api-key"])
      return res.status(401).send({
        errors:["Authenticate fail! User Api-key required"]
      });
    var options = {
      criteria: { apiKey : req.headers["api-key"] }
    };
    User.load(options, function (err, user) {
      if (err) 
        return res.status(500).send({errors:["Server errors"]});
      if (!user) return res.status(403).send({errors:["Access deny!"]});
      req.user = user;
      next();
    });
  }
}

/*
 *  Device authorization routing middleware
 */

exports.device = {
  hasAuthorization: function (req, res, next) {
    if (req.device.user.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/devices/' + req.device.id)
    }
    next()
  },
  hasAuthorizationByApiKey : function (req,res,next) {
    
    // if(!req.headers["api-key"])
    //   return res.status(401).send({
    //     errors:["Authenticate fail! Device Api-key required"]
    //   });
    // Device.loadByApiKey(req.headers["api-key"], function (err, device) {
    //   if (err) 
    //     return res.status(500).send({errors:["Server errors"]});
    //   if (!device) return res.status(403).send({errors:["Access deny!"]});
    //   req.device = device;
    //   next();
    // });
  }
}

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or device owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.device.user.id) {
      next()
    } else {
      req.flash('info', 'You are not authorized')
      res.redirect('/devices/' + req.device.id)
    }
  }
}
/**
 * Version authorization routing middleware
 */

exports.version = {
  hasAuthorization: function (req, res, next) {
    // if the current user is version owner or device owner
    // give them authority to delete
    if (req.user.id === req.application.user.id) {
      next()
    } else {
      req.flash('info', 'You are not authorized')
      res.redirect('/applications/' + req.application.id)
    }
  }
}
/*
 *  Application authorization routing middleware
 */
exports.application = {
  hasAuthorization: function (req, res, next) {
    if (req.application.user.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/applications/' + req.application.id)
    }
    next()
  },
  hasAuthorizationByApiKey : function (req,res,next) {
    if(req.device)
      return res.status(403).send({errors:["Access deny! Please use API-Key of user"]});
    next();
  }
}
