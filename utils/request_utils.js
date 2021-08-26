const requestBasePath = (req) => `${req.protocol}://${req.get('host')}`;

const requestContainsNonEmptyStringField = (req, field) => typeof req.body[field] === 'string' && req.body[field].length > 0

module.exports = {
  requestBasePath,
  requestContainsNonEmptyStringField
};
