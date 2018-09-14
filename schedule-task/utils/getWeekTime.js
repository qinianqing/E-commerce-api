module.exports = (n)=>{
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
}