#!/usr/bin/node

(function (){
    //constants
    const version       = 0.01
    const queue_size    = 10;
    const deepstream    = require('deepstream.io-client-js')
    const express       = require('express')
    const usage         = function(){
        console.error('usage : ' + process.argv[0] + ' [appUrl] (port)')
        return 1
    }    
    if (process.argv.length < 3){
        return usage()
    }
    const ds            = deepstream(process.argv[2])
    
    //deepstreamhub
    ds.login()
    var messageQueue    = []
    var record          = ds.record.getRecord('test')
    emitInterval        = setInterval(function() {
        record.set({
            messageQueue: messageQueue
        })
    }, 1000)
    
    //express
    var app         = express()
    var port        = process.argv[3]
    
    if (isNaN(parseFloat(port)) || !isFinite(port)){
        port = 3000;
    }
    
    app.get('/', function (req, res) {
        res.send('Notification Hub ' + version)
    })

    app.post('/message/:uri/:message', function(req, res){
        var message = JSON.parse(req.params.message)
        message['source'] = req.params.uri
        if (messageQueue.length >= queue_size){
            messageQueue.pop()
        }
        messageQueue.unshift(message)
        res.send('OK')
    })
    
    app.listen(port, function () {
        console.log('Notifications Hub listening on port ' + port)
    })
    
})();
