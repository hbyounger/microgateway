'use strict';

var _ = require('lodash');
var debug = require('debug')('context-test');
var loopback = require('loopback');
var request = require('supertest');

var context = require('../lib/context');
var errhandler = require('../lib/error-handler');

describe('Error middleware', function() {

  it ('should return default status code and message', function(done) {
    var app = loopback();
    app.use(context());
    app.use(function(req, resp, next) {
      next("Error on purpose");
    });
    app.use(errhandler());
    request(app)
      .get('/')
      .expect(500, {name: "GatewayError", message: "Internal Server Error", value: "Error on purpose"}, done);
  });

  it ('should return error message', function(done) {
    var errorObject = {
      name: 'TestError',
    }
    var app = loopback();
    app.use(context());
    app.use(function(req, resp, next) {
      next(errorObject);
    });
    app.use(errhandler());
    request(app)
      .get('/')
      .expect(500, errorObject, done);
  });

  it('should return customized status code and message', function(done) {
    var app = loopback();
    app.use(context());
    app.use(function(req, resp, next) {
      req.ctx.set('error.statusCode', 777);
      req.ctx.set('error.statusMessage', 'Not Allowed');
      next('error');
    });
    app.use(errhandler());
    request(app)
      .get('/')
      .expect(function(res) {
        if (res.statusCode !== 777)
          throw new Error('status code not correct');
        if (res.res.statusMessage !== 'Not Allowed')
          throw new Error('status message not correct');
      })
      .end(done);
  });

  it ('should return customized headers', function(done) {
    var errorHeaders = {
      'X-Error': 'Not working'
    };
    var app = loopback();
    app.use(context());
    app.use(function(req, resp, next) {
      req.ctx.set('error.headers', errorHeaders);
      next('error');
    });
    app.use(errhandler());
    request(app)
      .get('/')
      .expect('X-Error', 'Not working', done);
  });

});