module.exports = {
    // 给出偏离当周的周数，计算指定周————周一 00：00的时间戳
    // 后一周是正数，前一周是负数
    cal_this_week_first_second:(n)=>{
        let today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        today.setSeconds(59);
        today.setMilliseconds(0);
        let oneday = 1000*60*60*24;
        let day = today.getDay();
        today = today.getTime();
        let mon;
        if (day){
            mon = today+(7-day)*oneday;
        }else {
            mon = today;
        }
        return new Date(mon+n*7*oneday).getTime();
    },
};