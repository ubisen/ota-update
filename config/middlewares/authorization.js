
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
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
