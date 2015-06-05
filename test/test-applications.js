
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , should = require('should')
  , request = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')
  , Application = mongoose.model('Application')
  , agent = request.agent(app)

var count

/**
 * Applications tests
 */

describe('Applications', function () {
  before(function (done) {
    User.remove({},function (err) {
      var user = new User({
        email: 'foobar@example.com',
        name: 'Foo bar',
        username: 'foobar',
        password: 'foobar'
      })
      user.save(function (err,user) {
        done();
      })
    });   
  })
  before(function (done) {
    Application.remove({},function (err) {
      done(err);
    });
  });
  describe('GET /applications', function () {
    it('should respond with Content-Type text/html', function (done) {
      agent
      .get('/applications')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Applications/)
      .end(done)
    })
  })

  describe('GET /applications/new', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        agent
        .get('/applications/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })

    context('When logged in', function () {
      before(function (done) {
        // login the user
        agent
        .post('/users/session')
        .field('email', 'foobar@example.com')
        .field('password', 'foobar')
        .end(done)
      })

      it('should respond with Content-Type text/html', function (done) {
        agent
        .get('/applications/new')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/New Application/)
        .end(done)
      })
    })
  })

  describe('POST /applications', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        request(app)
        .get('/applications/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })

    context('When logged in', function () {
      before(function (done) {
        // login the user
        agent
        .post('/users/session')
        .field('email', 'foobar@example.com')
        .field('password', 'foobar')
        .end(done)
      })

      describe('Invalid parameters', function () {
        before(function (done) {
          Application.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should respond with error', function (done) {
          agent
          .post('/applications')
          .field('name', '')
          .field('description', 'foo')
          .expect('Content-Type', /html/)
          .expect(200)
          .expect(/Application name cannot be blank/)
          .end(done)
        })

        it('should not save to the database', function (done) {
          Application.count(function (err, cnt) {
            count.should.equal(cnt)
            done()
          })
        })
      })

      describe('Valid parameters', function () {
        before(function (done) {
          Application.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should redirect to the new application page', function (done) {
          agent
          .post('/applications')
          .field('name', 'foo')
          .field('description', 'bar')
          .expect('Content-Type', /plain/)
          .expect('Location', /\/applications\//)
          .expect(302)
          .expect(/Moved Temporarily/)
          .end(done)
        })

        it('should insert a record to the database', function (done) {
          Application.count(function (err, cnt) {
            cnt.should.equal(count + 1)
            done()
          })
        })

        it('should save the application to the database', function (done) {
          Application
          .findOne({ name: 'foo'})
          .populate('user')
          .exec(function (err, application) {
            should.not.exist(err)
            application.should.be.an.instanceOf(Application)
            application.name.should.equal('foo')
            application.description.should.equal('bar')
            application.user.email.should.equal('foobar@example.com')
            application.user.name.should.equal('Foo bar')
            done()
          })
        })
      })
    })
  })

  after(function (done) {
    require('./helper').clearDb(done)
  })
})
