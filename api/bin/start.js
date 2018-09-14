'use strict';

let cluster = require('cluster');

let app = require('../app');
let debug = require('debug')('pay-api:server');
let http = require('http');

// 可用CPU数量
let workers = require('os').cpus().length;

let server;

let Application = {
    start : function () {
        if (cluster.isMaster) {
            // 启动集群

            for (let i = 0; i < workers; i++) {
                cluster.fork();
            }

            cluster.on('listening',function(worker,address){
                console.log('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
            });

            cluster.on('exit', function(worker, code, signal) {
                console.log('worker %s died, restarting...', worker.process.pid);
                cluster.fork();
            });

        } else {
            // 启动线程

            // 设置端口
            let port = normalizePort(process.env.PORT || '3000');
            app.set('port', port);

            // 创建服务器
            server = http.createServer(app);

            // 监听端口
            server.listen(port);
            server.on('error', onError);
            server.on('listening', onListening);

        }
    }
};


/**
 *  序列化端口号
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

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

    let bind = typeof port === 'string'
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
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

module.exports = Application;