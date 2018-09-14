const Joi = require("joi");
const dynogels = require("jinshi-dynogels");
const { awsParams } = require('../config');

dynogels.AWS.config.update({
    accessKeyId: awsParams.accessKeyId,
    secretAccessKey: awsParams.secretAccessKey,
    region: awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});
const AccessM = dynogels.define('js_access', {
    hashKey: 'status',
    rangeKey: 'num',
    timestamps: true,
    schema: {
        num: Joi.number(),
        status: Joi.number()

    },
    indexes: [{
        hashKey: 'status',
        rangeKey: 'num',
        type: 'global',
        name: 'StatusIndex'
    }]
})
class Access {
    get num() { return this._num; }
    set num(value) { this._num = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    //批量创造sku_id
    create(numlist, callback) {
        AccessM.create(numlist, (err, accounts) => {
            callback(err, accounts)
        })
    }
    //每次只取一个id
    getOnenum(callback) {
        AccessM
            .query(Number(this.status))
            .usingIndex('StatusIndex')
            .ascending()
            .limit(1)
            .exec((err, data) => {
                callback(err, data)
            })

    }
    //取完id之后，更新状态为1
    getUpdateStatus(callback) {
        AccessM
            .update({
                num: Number(this.num),
                status: Number(1)
            }, ((err, data) => {
                callback(err, data)
            }))
    }
    //删除取完之前的id
    deleteGetid(callback) {
        AccessM
            .destroy({ status: Number(0), num: Number(this.num) }, (err, data) => {
                callback(err, data)
            })
    }
}
module.exports = Access;
