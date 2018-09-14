/*
 *  测试node.js后端代码
 *  当代码部署到test分支时，会执行test脚本
 */

// 引入断言框架
var expect = require('chai').expect;

// 启动服务器
var App = require('./start');
App.start();

// 对接口或API进行断言
// 中文文档：http://www.jianshu.com/p/f200a75a15d2

/*
describe('加法函数的测试', function() {
    it('1 加 1 应该等于 2', function() {
        expect(add(1, 1)).to.be.equal(2);
    });
});
 */

//
