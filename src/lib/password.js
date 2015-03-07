'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import assert from 'assert';
import bcrypt from 'bcrypt';

Promise.promisifyAll(bcrypt);

function compare(password, hash, next) {
  assert(_.isString(password), 'Password must be a string');
  assert(_.isString(hash), 'Hash must be a string');

  let promise = bcrypt.compareAsync(password, hash);

  if (_.isUndefined(next)) {
    return promise;
  }

  promise.nodeify(next);
}

function hashPassword(password, next) {
  let promise = bcrypt.hashAsync(password, this.bcryptWorkFactor);

  if (_.isUndefined(next)) {
    return promise;
  }

  promise.nodeify(next);
}

export default {
  compare,
  hashPassword,
};
