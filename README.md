# Rabble

Manage a rabble of users.

### API Endpoints

This module provides some helpers for you, but due to the incredibly diverse
nature of databases and user representations, we don't provide any API endpoints.
We do, however, provide some samples:


#### Create User

```javascript
server.route({
  path : '/user',
  method : 'POST',

  handler : function(request, reply) {

    let user = new User(request.payload);

    let hashPassword = Promise.promisify(request.server.methods.hashPassword);

    let promise = hashPassword(request.payload.password)
      .then((hash) => user.set('password', hash))
      .then((user) => user.save())
      .then((user) => _.omit(user.toObject(), 'password'));

    return reply(promise);
  },

  config : {

    description : 'Create a user',
    notes : 'Authentication not required',
    tags : [ 'api', 'users' ],

    auth : false,
    validate : {
      payload : Joi.object().keys({
        email : Joi.string().email().required(),
        password : Joi.string().required(),
      }),
    },

  },
});
```

#### Create Login Token

```javascript

server.route({
  path : '/token',
  method : 'POST',

  handler(request, reply) {

    let compare = Promise.promisify(request.server.methods.comparePassword);

    let promise = User.find({ email : request.payload.email })
      .then((user) => {
        return compare(request.payload.password, user.get('password'))
          .then((same) => {
            if (! same) {
              throw Boom.unauthorized();
            }

            return request.server.methods.signToken(user);
          });
      })
      .then((token) => {
        return { token : token };
      });

    return reply(promise);
  },

  config : {

    description : 'Create a login token',
    notes : 'Authentication not required',
    tags : [ 'api', 'users' ],

    auth : false,
    validate : {
      payload : Joi.object().keys({
        email : Joi.string().email().required(),
        password : Joi.string().required(),
      }),
    },

  },
})
```

### Get Logged In User

`HEAD` - check login
`GET` - fetch user data

```javascript

server.route({
  path : '/user',
  method : [ 'HEAD', 'GET' ],
  handler : function(request, reply) {
    reply(_.omit(request.auth.credentials.toObject(), 'password'));
  },

  config : {

    description : 'Verify login',
    notes : 'Allows GET or HEAD; returns user object for GETs',
    tags : [ 'api' , 'users' ],

  }
});

```
