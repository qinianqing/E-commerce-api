const { dbRegion } = require('../../config');

const awsParams = {
    accessKeyId:'AKIAPMHW344KV7C4DV3A',
    secretAccessKey:'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',
    region:dbRegion,
    dynamoEndpoint:'http://localhost:8000'
};

const secret = 'b34441add1e74fbcb3e10f3ffdd12d41';

module.exports = {
    awsParams,
    secret
};