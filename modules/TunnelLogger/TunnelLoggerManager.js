
var moment = require('moment');
var Log = require('log');
var fs = require('fs');
var path = require('path');
/*
 var Log = require('log')
 , fs = require('fs')
 , stream = fs.createReadStream(__dirname + '/../logs/file.log')
 , log = new Log('debug', stream);


 this.logManager.stream = fs.createReadStream(process.cwd() + '/logs/file.log');

 console.log(this.logManager);
 */
var TunnelLoggerManager = {
    logger: new Log(),

    initialize: function (configs) {
        //faz as paradas aqui para o logger iniciar
        if (configs.hasOwnProperty('logfileName')) {
            this.setStream(configs.logfileName);
        }

    },
    setStream: function(file) {
        if (this.fileExists(file)) {
            this.logger.stream = fs.createReadStream(process.cwd() + file);
        } else {
            this.createFile(file);
            //throw new Error('definir via arquivo de erros');
        }
    },
    fileExists: function(file) {
        var exists = true;
        try {
            fs.readFileSync(path.join(process.cwd(), file));
        } catch (error) {
            exists = false;
        }

        return exists;
    },
    createFile: function (file) {
        try {
            fs.writeFileSync(process.cwd() + file, '');
        } catch (e) {
            throw new Error('definir via arquivo de erros');
        }

    },
    writeLog: function() {
        //this.logger
    }
};


module.exports = TunnelLoggerManager;