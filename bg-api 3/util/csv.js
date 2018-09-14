var fs = require("fs");
var csv = require("fast-csv");
module.exports = {
    downLoad: function (req, res, getTitle, rows, fileName) {
        //用于判断是否是最后一个数据信息  
        // res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        var endLine = false;
        var stream = null;
        var argus = process.argv.splice(2);
        if (!argus || argus.length == 0) {
            stream = fs.createWriteStream("./temp.csv");
        } else {
            stream = fs.createWriteStream(argus[0]);
        }
        stream.on("finish", function () {
            // res.setHeader('Content-disposition', 'attachment; filename=data.xlsx');
            // res.setHeader('Content-type', 'application/vnd.openxmlformats');
            res.download('./temp.csv', fileName + '.csv', function (err) {
                if (err) {
                    console.log(err)
                } else {
                   
                    fs.unlinkSync('./temp.csv'); //删除临时文件  
                }

            });

        });
        stream.on("error", function (error) {
console.log("dsds",error.message)
        })

        //生成头部  
        var csvStream = csv.format({
                headers: true
            })
            .transform(getTitle);
        csvStream.pipe(stream);
        rows.forEach(function (row) {
            csvStream.write(row);
        });
        //关闭写入  
        csvStream.end(function () {

            console.log("end");
        });
    }
}