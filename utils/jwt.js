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

const requireAdminJwt = () => expressJwt({
  secret: PWT_RSA_KEY,
  algorithms: ['HS256'],
  isRevoked: isRevokedForCustomers
});

const useJwt = () => expressJwt({
  secret: PWT_RSA_KEY,
  algorithms: ['HS256'],
  credentialsRequired: false
});

const hasJwt = (req) => typeof req.user?.userId === 'string';

const isAdmin = (req) => req.user?.isAdmin === true;

module.exports = {
  requireAdminJwt,
  useJwt,
  hasJwt,
  isAdmin,
  PWT_RSA_KEY
};
