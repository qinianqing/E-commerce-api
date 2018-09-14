// 获取省份和对应发货

// 注意：各地区库房对应表如下
// 此文件在schedule task项目中也维护了一份
/*
        stock:Joi.number(),// 北京仓，主仓
        sh_stock:Joi.number(),// 上海仓
        gz_stock:Joi.number(),// 广州仓
        sz_stock:Joi.number(),// 深圳仓
        cd_stock:Joi.number(),// 成都仓
        direct_stock:Joi.number(),// 直发库存
 */
module.exports = {
    '北京市':'stock',
    '河北省':'stock',
    '天津市':'stock',
    '安徽省':'stock',
    '福建省':'stock',
    '甘肃省':'stock',
    '广东省':'stock',
    '广西壮族自治区':'stock',
    '贵州省':'stock',
    '重庆市':'stock',
    '海南省':'stock',
    '河北省':'stock',
    '河南省':'stock',
    '黑龙江省':'stock',
    '湖北省':'stock',
    '湖南省':'stock',
    '吉林省':'stock',
    '江苏省':'stock',
    '江西省':'stock',
    '辽宁省':'stock',
    '内蒙古自治区':'stock',
    '宁夏回族自治区':'stock',
    '青海省':'stock',
    '山东省':'stock',
    '山西省':'stock',
    '陕西省':'stock',
    '上海市':'stock',
    '四川省':'stock',
    '西藏自治区':'stock',
    '新疆维吾尔自治区':'stock',
    '云南省':'stock',
    '浙江省':'stock'
};