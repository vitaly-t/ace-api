module.exports = (willStop) => (req, res, next) => {
    if(!req.clientId && willStop) return res.status(403).send({err: 'Please define Client-Id in header'});
    req.clientId = req.clientId || 'anonymous';
    next();
};