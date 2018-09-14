
module.exports = ()=> {
    // 1位随机字母
    // 除去I、O外共24个
    const chars = ['1','2','3','4','5','6','7','8','9','0'];
    let char1 = chars[Math.ceil(Math.random()*9)];
    let char2 = chars[Math.ceil(Math.random()*9)];
    let char3 = chars[Math.ceil(Math.random()*9)];
    let char4 = chars[Math.ceil(Math.random()*9)];
    let char5 = chars[Math.ceil(Math.random()*9)];
    let char6 = chars[Math.ceil(Math.random()*9)];
    let char7 = chars[Math.ceil(Math.random()*9)];
    let char8 = chars[Math.ceil(Math.random()*9)];
    let char9 = chars[Math.ceil(Math.random()*9)];
    let char10 = chars[Math.ceil(Math.random()*9)];
    let char11 = chars[Math.ceil(Math.random()*9)];
    let char12 = chars[Math.ceil(Math.random()*9)];
    let char13 = chars[Math.ceil(Math.random()*9)];
    let char14 = chars[Math.ceil(Math.random()*9)];
    let char15 = chars[Math.ceil(Math.random()*9)];
    let char16 = chars[Math.ceil(Math.random()*9)];
    let char17 = chars[Math.ceil(Math.random()*9)];

    let id = char1+char2+char3+char4+char5+char6+char7+char8+char9+char10+char11+char12+char13+char14+char15+char16+char17;
    return String(id);
};