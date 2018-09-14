'use strict';

var app = require('../app');
var debug = require('debug')('pay-api:server');
var http = require('http');


var server;

var port;

var Application = {
    start : function () {
            // 启动线程

            // 设置端口
            port = normalizePort(process.env.PORT || '3001');
            app.set('port', port);

            // 创建服务器
            server = http.createServer(app);

            // 监听端口
            server.listen(port);
            server.on('error', onError);
            server.on('listening', onListening);

    }
}


/**
 *  序列化端口号
 */

function normalizePort(val) {
    port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 *  错误处理
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 *  监听服务
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

module.exports = Application;