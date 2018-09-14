const { dbRegion } = require('../../config');

const awsParams = {
    accessKeyId:'AKIAPMHW344KV7C4DV3A',
    secretAccessKey:'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',
    region:dbRegion,
    dynamoEndpoint:'http://localhost:8000'
};

const secret = '8294850807894c40b65d76d199b72a7e';

module.exports = {
    awsParams,
    secret
};
