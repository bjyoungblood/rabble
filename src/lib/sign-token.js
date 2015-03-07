'use strict';

import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

export default function signToken(tokenData) {
  let signedToken = jwt.sign(tokenData, this.privateKey, this.jwtOptions);

  return Promise.resolve(signedToken);
}
