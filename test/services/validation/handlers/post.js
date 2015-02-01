'use strict';

exports.schemas = {
   in: {
     '$schema': 'http://json-schema.org/draft-04/schema#',
     title: 'User',
     description: 'User insert schema',
     type: 'object',
     required: true,
     properties: {
       name: {type: 'string', required: true, minLength: 2, description: 'The user\'s name'}
     }
   }
 }

exports.task = function(event, done) {
  return done(null, event.body);
}
