// 注意：
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

let fun = {
    get_handle_date:(arrival_date,province)=>{
        // arrival_date = new Date(arrival_date);
        // let age = packageAging[province];
        let now = new Date();
        // TODO： NOTICE:aws服务器是UTC时间，本地和云端不一样
        if (now.getHours()+8>=15){
            // 明天发货
            return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+(now.getDate()+1);
        }else {
            // 今天发货
            return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }
        // if (typeof age === 'number'){
        //     age = age+1;//补一天的生产时间
        //     age = parseInt(age);
        //     let day = 1000*60*60*24;
        //     let targetDateTime = arrival_date.getTime()-age*day;
        //     let targetDate = new Date();
        //     targetDate.setTime(targetDateTime);
        //     return targetDate.getFullYear()+'-'+(targetDate.getMonth()+1)+'-'+targetDate.getDate();
        // }else {
        //     let now = new Date();
        //     now.setHours(0);
        //     now.setMinutes(0);
        //     now.setSeconds(0);
        //     now.setMilliseconds(0);
        //     return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        // }
    },
    // 计算唯一20位订单号
    // 时间戳前面加一个字母，后面加两位随机数
    get_order_id:() => {
        // // 1位随机字母
        // // 除去I、O外共24个
        // const chars = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'];
        // let char1 = chars[Math.ceil(Math.random()*23)];
        // 全时间戳
        // let time = Date.now();
        // time = String(time);
        // 年后两位，月，日，时，分
        let now = new Date();
        let year = String(Number(now.getFullYear())-2000);// 21XX年就不能用了
        let month = String(now.getMonth()+1);
        if (Number(now.getMonth()+1)<10){
            month = '0'+String(now.getMonth()+1);
        }
        let date = String(now.getDate());
        if (Number(now.getDate())<10){
            date = '0'+ String(now.getDate());
        }
        let minutes = String(now.getMinutes());
        if (Number(now.getMinutes())<10){
            minutes = '0'+ String(now.getMinutes());
        }
        let time = year+month+date+minutes;
        // 3位随机数
        let num1 = Math.ceil(Math.random()*9);
        let num2 = Math.ceil(Math.random()*9);
        let num3 = Math.ceil(Math.random()*9);
        let num4 = Math.ceil(Math.random()*9);
        let num5 = Math.ceil(Math.random()*9);
        let num6 = Math.ceil(Math.random()*9);
        let id = time+num1+num2+num3+num4+num5+num6;
        return String(id);
    },

    // 运费计算，单位公斤
    freight_cal_jd:(weight,province) =>{
        if (province){
            if (weight){
                switch (province){
                    case '北京市':
                        return 7;
                        // if(weight <= 1){
                        //     return 10;
                        // }else {
                        //     return (Math.ceil(weight)-1)*2+10+packageFee
                        // }
                        break;
                    case '天津市':
                        return 8;
                        // if(weight <= 1){
                        //     return 12;
                        // }else {
                        //     return (Math.ceil(weight)-1)*2+12+packageFee
                        // }
                        break;
                    case '河北省':
                        return 8;
                        // if(weight <= 1){
                        //     return 12;
                        // }else {
                        //     return (Math.ceil(weight)-1)*2+12+packageFee
                        // }
                        break;

                    case '山西省':
                        return 10;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '山东省':
                        return 10;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '内蒙古自治区':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '河南省':
                        return 10;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '江苏省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '浙江省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '上海市':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '辽宁省':
                        return 10;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*8+18+packageFee
                        // }
                        break;
                    case '陕西省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '宁夏回族自治区':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '湖北省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '安徽省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '湖南省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '吉林省':
                        return 11;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '黑龙江省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '甘肃省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '福建省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '四川省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '重庆市':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '江西省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '广东省':
                        return 12;
                        // if(weight <= 1){
                        //     return 18;
                        // }else {
                        //     return (Math.ceil(weight)-1)*10+18+packageFee
                        // }
                        break;
                    case '青海省':
                        return 12;
                        // if(weight <= 1){
                        //     return 20;
                        // }else {
                        //     return (Math.ceil(weight)-1)*12+20+packageFee
                        // }
                        break;
                    case '海南省':
                        return 13;
                        // if(weight <= 1){
                        //     return 20;
                        // }else {
                        //     return (Math.ceil(weight)-1)*12+20+packageFee
                        // }
                        break;
                    case '云南省':
                        return 13;
                        // if(weight <= 1){
                        //     return 20;
                        // }else {
                        //     return (Math.ceil(weight)-1)*12+20+packageFee
                        // }
                        break;
                    case '贵州省':
                        return 12;
                        // if(weight <= 1){
                        //     return 20;
                        // }else {
                        //     return (Math.ceil(weight)-1)*12+20+packageFee
                        // }
                        break;
                    case '广西壮族自治区':
                        return 12;
                        // if(weight <= 1){
                        //     return 20;
                        // }else {
                        //     return (Math.ceil(weight)-1)*12+20+packageFee
                        // }
                        break;
                    case '新疆维吾尔自治区':
                        return 17;
                        // if(weight <= 1){
                        //     return 23;
                        // }else {
                        //     return (Math.ceil(weight)-1)*16+23+packageFee
                        // }
                        break;
                    case '西藏自治区':
                        return 17;
                        // if(weight <= 1){
                        //     return 23;
                        // }else {
                        //     return (Math.ceil(weight)-1)*16+23+packageFee
                        // }
                        break;
                    default:
                        return new Error('other province is not supported')
                        break;
                }
            }else {
                return 0;
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
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        let oneday = 1000*60*60*24;
        let day = today.getDay();
        today = today.getTime();
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