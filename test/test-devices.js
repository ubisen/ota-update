
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , should = require('should')
  , request = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')
  , Device = mongoose.model('Device')
  , agent = request.agent(app)

var count

/**
 * Devices tests
 */

describe('Devices', function () {
  before(function (done) {
    // create a user
    var user = new User({
      email: 'foobar@example.com',
      name: 'Foo bar',
      username: 'foobar',
      password: 'foobar'
    })
    user.save(function (err,user) {
      console.log(err);
      done();
    })
  })

  describe('GET /devices', function () {
    it('should respond with Content-Type text/html', function (done) {
      agent
      .get('/devices')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Devices/)
      .end(done)
    })
  })

  describe('GET /devices/new', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        agent
        .get('/devices/new')
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
        .get('/devices/new')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/New Device/)
        .end(done)
      })
    })
  })

  describe('POST /devices', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        request(app)
        .get('/devices/new')
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
          Device.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should respond with error', function (done) {
          agent
          .post('/devices')
          .field('name', '')
          .field('body', 'foo')
          .expect('Content-Type', /html/)
          .expect(200)
          .expect(/Device name cannot be blank/)
          .end(done)
        })

        it('should not save to the database', function (done) {
          Device.count(function (err, cnt) {
            count.should.equal(cnt)
            done()
          })
        })
      })

      describe('Valid parameters', function () {
        before(function (done) {
          Device.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should redirect to the new device page', function (done) {
          agent
          .post('/devices')
          .field('name', 'foo')
          .field('body', 'bar')
          .expect('Content-Type', /plain/)
          .expect('Location', /\/devices\//)
          .expect(302)
          .expect(/Moved Temporarily/)
          .end(done)
        })

        it('should insert a record to the database', function (done) {
          Device.count(function (err, cnt) {
            cnt.should.equal(count + 1)
            done()
          })
        })

        it('should save the device to the database', function (done) {
          Device
          .findOne({ name: 'foo'})
          .populate('user')
          .exec(function (err, device) {
            should.not.exist(err)
            device.should.be.an.instanceOf(Device)
            device.name.should.equal('foo')
            device.body.should.equal('bar')
            device.user.email.should.equal('foobar@example.com')
            device.user.name.should.equal('Foo bar')
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
