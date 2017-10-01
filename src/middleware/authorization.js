const _ = require('lodash');
const db = require('db');

module.exports = privilege => async (req, res, next) => {
  const hasPrivilege = _.find(req.user.privileges, { name: privilege });
  const isOwner = await db.oneOrNone(
    'select true from resources join user_owns_resource on resource_id=resources.id where user_id=$1 and resource_id=$2',
    [req.user.id, req.params.id]
  );
  if (hasPrivilege || isOwner) {
    req.activity = hasPrivilege;
    return next();
  }
  res.status(401).send({ message: 'You do not have privileges to perform this activity' });
};
