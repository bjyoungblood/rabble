'use strict';

import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

let verifyAsync = Promise.promisify(jwt.verify, jwt);

function getVerifyKey(options) {
  return options.publicKey ? options.publicKey : options.privateKey;
}

export default function verifyToken(token, next) {
  let key = getVerifyKey(this);

  return verifyAsync(token, key, this.jwtOptions);
}
