const
    jwt = require('jsonwebtoken');

module.exports = (willStop) => (req, res, next) => {
    const token = req.headers['x-access-token'] || '';
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err) return willStop ?
            res.status(401).send({message: 'X-Access-Token is not valid'})
            : next();
        req.user = decoded;
        next();
    });
};
