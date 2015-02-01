'use strict';

var request = require('supertest');

var app = require('../server.js');

describe('normal responses', function(){
  it('GET respond with 200,json,data', function(done){
    request(app)
       .get('/api/normal/777')
       .set('Accept', 'application/json')
       .expect('Content-Type', /json/)
       .expect(200, { id: '777' } )
       .end(done);
  })

  it('POST respond with 200,json,data', function(done){
    var data = {name: 'test'};
    request(app)
       .post('/api/normal/777')
       .set('Accept', 'application/json')
       .set('content-type', 'application/x-www-form-urlencoded')
       .send(data)
       .expect('Content-Type', /json/)
       .expect(200, data)
       .end(done);
  })
})

describe('custom responses', function(){
  it('GET respond with 201,json,data', function(done){
    request(app)
       .get('/api/custom/777')
       .set('Accept', 'application/json')
       .expect('Content-Type', /json/)
       .expect(201, { id: '777' } )
       .end(done);
  })

  it('POST respond with 201,json,data', function(done){
    var data = {name: 'test'};
    request(app)
       .post('/api/custom/777')
       .set('Accept', 'application/json')
       .set('content-type', 'application/x-www-form-urlencoded')
       .send(data)
       .expect('Content-Type', /json/)
       .expect(201, data)
       .end(done);
  })
})

describe('error responses', function(){
  it('GET respond with 500,json,data', function(done){
    request(app)
       .get('/api/error/777')
       .set('Accept', 'application/json')
       .expect('Content-Type', /json/)
       .expect(500, { message: 'Something went wrong' } )
       .end(done);
  })

  it('POST respond with 500,json,data', function(done){
    var data = {name: 'test'};
    request(app)
       .post('/api/error/777')
       .set('Accept', 'application/json')
       .set('content-type', 'application/x-www-form-urlencoded')
       .send(data)
       .expect('Content-Type', /json/)
       .expect(500, { message: 'Something went wrong' } )
       .end(done);
  })
})
