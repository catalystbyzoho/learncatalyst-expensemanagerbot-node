'use strict';
const Cliq = require('zcatalyst-integ-cliq');
const catalyst = require('zcatalyst-sdk-node');

module.exports = async(request, response) => {
    try {
        var catalystApp = catalyst.initialize(request);
        const handlerResponse = await Cliq.default(request, catalystApp);
        response.end(handlerResponse);
    } catch (err) {
        console.log('Error while executing handler. ', err);
        throw err;
    }
};