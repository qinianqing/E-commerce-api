const xml2js = require('xml2js');

module.exports = (content)=>{
    return new Promise((resolve,reject)=>{
        let parser = new xml2js.Parser();
        parser.parseString(content, function (err, result) {
            if (err){
                reject(err);
            }else {
                resolve(result.xml);
            }
        });
    })
};