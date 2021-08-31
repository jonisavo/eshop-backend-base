const fs = require('fs');
const expressJwt = require('express-jwt');

const PWT_RSA_KEY = fs.readFileSync(fs.realpathSync('jwtRS256.key'));

const isRevokedForCustomers = async (_req, payload, done) => {
  if (!payload.isAdmin) {
    done(null, true);
  } else {
    done();
  }
};

const commonJwtOptions = {
  secret: PWT_RSA_KEY,
  algorithms: ['HS256'],
}

const requireAdminJwt = () => expressJwt({
  ...commonJwtOptions,
  isRevoked: isRevokedForCustomers
});

const useJwt = () => expressJwt({
  ...commonJwtOptions,
  credentialsRequired: false
});

const useJwtNoExpiry = () => (req, res, next) => {
  const handleErrorNext = err => {
    if (err) {
      if (
        err.name === 'UnauthorizedError' &&
        err.inner.name === 'TokenExpiredError'
      ) {
        return next();
      }
    }
    next(err);
  };

  const middleware = expressJwt({
    ...commonJwtOptions,
    credentialsRequired: false
  });

  return middleware(req, res, handleErrorNext);
}

const hasJwt = (req) => typeof req.user?.userId === 'string';

const isAdmin = (req) => req.user?.isAdmin === true;

module.exports = {
  requireAdminJwt,
  useJwt,
  useJwtNoExpiry,
  hasJwt,
  isAdmin,
  PWT_RSA_KEY
};
