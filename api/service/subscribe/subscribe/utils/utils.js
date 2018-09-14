let fun = {
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
        // let num4 = Math.ceil(Math.random()*9);
        // let num5 = Math.ceil(Math.random()*9);
        // let num6 = Math.ceil(Math.random()*9);
        let id = time+num1+num2+num3;
        return String(id);
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
};

module.exports = fun;