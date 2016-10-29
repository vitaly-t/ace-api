const
    Ajv = require('ajv'),
    ajv = new Ajv(),
    util = require('util');

module.exports = (schema) => {
    return (req, res, next) => {
        const valid = ajv.validate(schema, req.body);
        if (valid && req.body) next();
        else {
            console.log(ajv.errors);
            console.log(util.inspect(req.body, {showHidden: false, depth: null}));
            res.status(400).send({message: 'Wrong format or something', errors: ajv.errors || 'Not because of ajv'});
        }
    }
};