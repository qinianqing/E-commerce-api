const xml2js = require('xml2js');
/**
 *  @param {string} content
 *  @return {string} a json file
 */
module.exports = (content)=>{
    let options = {
        cdata: true
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(content);
};