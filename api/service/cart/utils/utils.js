// 2018-1-5
const packageFee = 2;

let packageAging = {
    '北京市':1,
    '河北省':1,
    '天津市':1,
    '安徽省':2,
    '福建省':2,
    '甘肃省':2,
    '广东省':2,
    '广西壮族自治区':2,
    '贵州省':2,
    '重庆市':2,
    '海南省':2,
    '河北省':1,
    '河南省':2,
    '黑龙江省':2,
    '湖北省':2,
    '湖南省':2,
    '吉林省':2,
    '江苏省':2,
    '江西省':2,
    '辽宁省':2,
    '内蒙古自治区':2,
    '宁夏回族自治区':2,
    '青海省':2,
    '山东省':2,
    '山西省':2,
    '陕西省':2,
    '上海市':1,
    '四川省':2,
    '西藏自治区':2,
    '新疆维吾尔自治区':2,
    '云南省':2,
    '浙江省':2
};

let regionMethod = require('../../../utils/formatRegion');

let fun = {
    province:regionMethod.province(),
    city:regionMethod.province2city(),
    county:regionMethod.city2county(),
    // 运费计算，单位公斤
    freight_cal_jd:(weight,province) =>{
        if (province){
            if (weight){
                switch (province){
                    case '北京市':
                        if(weight <= 1){
                            return 10;
                        }else {
                            return (Math.ceil(weight)-1)*2+10+packageFee
                        }
                        break;
                    case '天津市':
                        if(weight <= 1){
                            return 12;
                        }else {
                            return (Math.ceil(weight)-1)*2+12+packageFee
                        }
                        break;
                    case '河北省':
                        if(weight <= 1){
                            return 12;
                        }else {
                            return (Math.ceil(weight)-1)*2+12+packageFee
                        }
                        break;

                    case '山西省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '山东省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '内蒙古自治区':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '河南省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '江苏省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '浙江省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '上海市':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '辽宁省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*8+18+packageFee
                        }
                        break;
                    case '陕西省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '宁夏回族自治区':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '湖北省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '安徽省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '湖南省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '吉林省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '黑龙江省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '甘肃省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '福建省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '四川省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '重庆市':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '江西省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '广东省':
                        if(weight <= 1){
                            return 18;
                        }else {
                            return (Math.ceil(weight)-1)*10+18+packageFee
                        }
                        break;
                    case '青海省':
                        if(weight <= 1){
                            return 20;
                        }else {
                            return (Math.ceil(weight)-1)*12+20+packageFee
                        }
                        break;
                    case '海南省':
                        if(weight <= 1){
                            return 20;
                        }else {
                            return (Math.ceil(weight)-1)*12+20+packageFee
                        }
                        break;
                    case '云南省':
                        if(weight <= 1){
                            return 20;
                        }else {
                            return (Math.ceil(weight)-1)*12+20+packageFee
                        }
                        break;
                    case '贵州省':
                        if(weight <= 1){
                            return 20;
                        }else {
                            return (Math.ceil(weight)-1)*12+20+packageFee
                        }
                        break;
                    case '广西壮族自治区':
                        if(weight <= 1){
                            return 20;
                        }else {
                            return (Math.ceil(weight)-1)*12+20+packageFee
                        }
                        break;
                    case '新疆维吾尔自治区':
                        if(weight <= 1){
                            return 23;
                        }else {
                            return (Math.ceil(weight)-1)*16+23+packageFee
                        }
                        break;
                    case '西藏自治区':
                        if(weight <= 1){
                            return 23;
                        }else {
                            return (Math.ceil(weight)-1)*16+23+packageFee
                        }
                        break;
                    default:
                        return new Error('other province is not supported')
                        break;
                }
            }else {
                return new Error('province is needed')
            }
        }else {
            return new Error('province is needed');
        }
    },
    // 满99返5，198返15，满396返36，满600返60，满1000返110
    // 满减提醒
    discount_notice:(money) => {
        let fixedMoney = Number(money.toFixed(2));
        if(fixedMoney < 99){
            return '本周再买'+(99-fixedMoney)+'元可获满额返现5元';
        }else if (fixedMoney>=99 && fixedMoney <198){
            return '本周再买'+(198-fixedMoney)+'元可获满额返现15元';
        }else if (fixedMoney>=198 && fixedMoney <396){
            return '本周再买'+(396-fixedMoney)+'元可获满额返现36元';
        }else if (fixedMoney>=396 && fixedMoney<600){
            return '本周再买'+(600-fixedMoney)+'元可获满额返现60元';
        }else if (fixedMoney>=600 && fixedMoney <1000){
            return '本周再买'+(1000-fixedMoney)+'元可获满额返现110元';
        }else if (fixedMoney >= 1000){
            return '已经享受最高总额返现110元';
        }
    },

    discount:[
        {
            money:99,
            cb:2
        },
        {
            money:198,
            cb:5
        },
        {
            money:396,
            cb:10
        },
        {
            money:600,
            cb:20
        },
        {
            money:1000,
            cb:50
        },
    ],
    // 全场满额返现设置
    discount_cal:(money) => {
        money = Number(money.toFixed(2));
        if(money < 99){
            return 0;
        }else if (money>=99 && money <198){
            return 5;
        }else if (money>=198 && money <396){
            return 15;
        }else if (money>=396 && money<600){
            return 36;
        }else if (money>=600 && money <1000){
            return 60;
        }else if (money >= 1000){
            return 110;
        }
    },

    // 给出偏离当周的周数，计算指定周————周一 00：00的时间戳
    // 后一周是正数，前一周是负数
    cal_this_week_first_second:(n)=>{
        let today = new Date();
        let day = today.getDay();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        today = today.getTime();
        let oneday = 1000*60*60*24;
        let mon;
        if (day){
            mon = today-(day-1)*oneday;
        }else {
            // 周日
            mon = today-6*oneday;
        }
        return String(mon+n*7*oneday)
    },
    // 快递时效
    packageAging:packageAging
};

module.exports = fun;
