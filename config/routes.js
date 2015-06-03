
/*!
 * Module dependencies.
 */

// Note: We can require users, devices and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

var users = require('users');
var devices = require('devices');
var comments = require('comments');
var versions = require('versions');
var applications = require('applications');
var tags = require('tags');
var auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var deviceAuth = [auth.requiresLogin, auth.device.hasAuthorization];
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];
var userAuth = [auth.requiresLogin, auth.user.hasAuthorization];
var applicationAuth = [auth.requiresLogin, auth.application.hasAuthorization];
var versionAuth=[auth.requiresLogin, auth.version.hasAuthorization];
/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
      failureRedirect: '/login',
      scope: [
        'r_emailaddress'
      ]
    }), users.signin);
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), users.authCallback);

  app.param('userId', users.load);
  app.get('/users/:userId',userAuth, users.show);
  // application route
  app.param('applicationId', applications.load);
  app.get('/applications', applications.index);
  app.get('/applications/new', auth.requiresLogin, applications.new);
  app.post('/applications', auth.requiresLogin, applications.create);
  app.get('/applications/:applicationId', applications.show);
  app.get('/applications/:applicationId/edit', applicationAuth, applications.edit);
  app.put('/applications/:applicationId', applicationAuth, applications.update);
  app.delete('/applications/:applicationId', applicationAuth, applications.destroy);
  // device routes
  app.param('deviceId', devices.load);
  app.get('/devices', devices.index);
  app.get('/devices/new', auth.requiresLogin, devices.new);
  app.post('/devices', auth.requiresLogin, devices.create);
  app.get('/devices/:deviceId', devices.show);
  app.get('/devices/:deviceId/edit', deviceAuth, devices.edit);
  app.put('/devices/:deviceId', deviceAuth, devices.update);
  app.delete('/devices/:deviceId', deviceAuth, devices.destroy);

  // home route
  app.get('/', devices.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/devices/:deviceId/comments', auth.requiresLogin, comments.create);
  app.get('/devices/:deviceId/comments', auth.requiresLogin, comments.create);
  app.delete('/devices/:deviceId/comments/:commentId', commentAuth, comments.destroy);
  // comment routes
  app.param('versionId', versions.load);
  app.post('/applications/:applicationId/versions', auth.requiresLogin, versions.create);
  app.get('/applications/:applicationId/versions', auth.requiresLogin, versions.create);
  app.delete('/applications/:applicationId/versions/:versionId', versionAuth, versions.destroy);
  // tag routes
  app.get('/tags/:tag', tags.index);


  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
}
