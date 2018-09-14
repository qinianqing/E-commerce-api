module.exports = (n)=>{
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    let oneday = 1000*60*60*24;
    let day = today.getDay();
    let mon = today-(day-1)*oneday;
    return String(mon+n*oneday)
};