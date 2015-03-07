'use strict';

import Joi from 'joi';

import pkg from '../package.json';
import auth from './lib/auth';
import signToken from './lib/sign-token';
import verifyToken from './lib/verify-token';
import password from './lib/password';

var optionsSchema = Joi.object().keys({

  getUser : Joi.func().required(),

  bcryptWorkFactor : Joi.number().integer().greater(0).default(10),

  privateKey : Joi.string().required(),
  publicKey : Joi.string().optional(),

  jwtOptions : Joi.object().keys({

    algorithm : Joi.valid([
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
      'ES256',
      'ES384',
      'ES512',
      'none',
    ]).default('HS256'),

    expiresInSeconds : Joi.number().optional().min(0),

    audience : Joi.string().optional(),

    subject : Joi.string().optional(),

    issuer : Joi.string().optional(),

    noTimestamp : Joi.boolean().default(false),

  }).optional(),
});

function register(server, options, next) {

  // Validate options and send an error back to Hapi if invalid
  let validate = Joi.validate(options, optionsSchema);

  if (validate.error) {
    return next(validate.error);
  }

  options = validate.value;

  require('./api/index')(server, options);

  // Expose the options that were passed to this plugin
  server.expose(options);

  // Expose the signToken and verifyToken methods
  server.method([
    {
      name : 'signToken',
      method : signToken,
      options : {
        bind : options,
        callback : false,
      },
    },
    {
      name : 'verifyToken',
      method : verifyToken,
      options : {
        bind : options,
        callback : false,
      },
    },
    {
      name : 'hashPassword',
      method : password.hashPassword,
      options : {
        bind : options,
      },
    },
    {
      name : 'comparePassword',
      method : password.compare,
      options : {
        bind : options,
      },
    },
  ]);

  // Register the 'jwt' auth scheme
  server.auth.scheme('jwt', auth);

  // Register the 'rabble' auth strategy using the 'jwt' scheme and the
  // options passed to the plugin
  server.auth.strategy('rabble', 'jwt', {
    privateKey : options.privateKey,
    publicKey : options.publicKey,
    jwtOptions : options.jwtOptions,
  });

  // Set the default auth strategy to 'rabble'
  server.auth.default('rabble');

  next();
}

register.attributes = {
  name : pkg.name,
  version : pkg.version,
  multiple : false,
};

export default register;
