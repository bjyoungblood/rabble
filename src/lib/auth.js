'use strict';

import Boom from 'boom';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

function getTokenFromRequest(request) {

  let authorization = request.headers.authorization;
  if (! authorization) {
    throw Boom.unauthorized(null, 'Bearer');
  }

  let parts = authorization.split(/\s+/);

  if (parts.length !== 2) {
    throw Boom.badRequest('Invalid Authentication header format', 'Bearer');
  }

  if (parts[0].toLowerCase() !== 'bearer') {
    throw Boom.unauthorized(null, 'Bearer');
  }

  if (parts[1].split('.').length !== 3) {
    throw Boom.badRequest('Invalid Authentication token format', 'Bearer');
  }

  return parts[1];
}

export default function auth(server, options) {

  var scheme = {
    authenticate : function (request, reply) {

      let token;

      try {
        token = getTokenFromRequest(request.raw.req);
      } catch(err) {
        return reply(err);
      }

      server.methods.verifyToken(token)
        .then((decoded) => {

          if (options.getUser.length === 2) {
            return [ decoded, Promise.fromNode((callback) => {
              options.getUser(decoded, callback);
            }) ];
          } else {
            return [ decoded, options.getUser(decoded) ];
          }

        })
        .spread((decoded, user) => {
          if (! user) {
            throw Boom.notFound('User not found');
          }

          return {
            credentials : user,
            artifacts : {
              token : decoded,
            },
          };
        })
        .catch(jwt.TokenExpiredError, (err) => {
          throw Boom.unauthorized('Token expired');
        })
        .catch(jwt.JsonWebTokenError, (err) => {
          throw Boom.unauthorized('Invalid token or signature');
        })
        .reflect()
        .then((result) => {
          if (result.isFulfilled()) {
            return reply.continue(result.value());
          } else {
            return reply(result.reason());
          }
        });

    }
  };

  return scheme;
}
