const utils = {
    ascending:(list) => {
        if (list.length) {
            // 按index属性，正向排序
            const sortFun = (a,b) => {
                return a.index-b.index
            }
            return list.sort(sortFun)
        }else{
            return 'need an array'
        }
    },
    decending:(list) => {
        if (list.length) {
            // 按index属性，倒序排列
            const sortFun = (a,b) => {
                return b.index-a.index
            };
            return list.sort(sortFun)
        }else{
            return 'need an array'
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
};

module.exports = utils;