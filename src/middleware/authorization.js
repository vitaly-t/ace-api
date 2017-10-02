const _ = require('lodash');
const db = require('db');

module.exports = privilege => async (req, res, next) => {
  console.log('PRIVILEG', privilege);
  console.log('USER PRIV', req.user.privileges);
  const hasPrivilege = _.find(req.user.privileges, { name: privilege });
  const isOwner = await db.oneOrNone(
    'select true from resources join user_owns_resource on resource_id=resources.id where user_id=$1 and resource_id=$2',
    [req.user.id, req.params.id]
  );
  if (hasPrivilege || isOwner) {
    req.activity = hasPrivilege;
    return next();
  }
  console.error('NOT AUTHORIZED');
  res.status(401).send({ message: 'You do not have privileges to perform this activity' });
};
