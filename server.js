#!/usr/bin/node

(function (){
    //parameters validation
    const usage         = function(){
        console.error('usage : ' + process.argv[0] + ' [deepstream_app_url] [telegram_token] (port)')
        return 1
    }    
    if (process.argv.length < 4){
        return usage()
    }
    
    //constants
    const version       = 0.01
    const queue_size    = 10;
    const deepstream    = require('deepstream.io-client-js')
    const ds            = deepstream(process.argv[2])
    
    //deepstreamhub
    ds.login()
    var messageQueue    = []
    var record          = ds.record.getRecord('notificationhub')
    emitInterval        = setInterval(function() {
        record.set({
            messageQueue: messageQueue
        })
    }, 1000)
    
    //express
    const express	= require('express')
    var app         = express()
    var port		= process.argv[4]

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
    
    //telegram bot
    const TelegramBot = require('node-telegram-bot-api')
    const token = process.argv[3]
    const bot = new TelegramBot(token, {polling: true});    

    bot.onText(/help (.+)/, (msg, match) => {
	    console.log('help')
	    const chatId = msg.chat.id;
	    const rest = "I cannot help you";
	    bot.sendMessage(chatId, rest);
    });
    
    bot.onText(/\/echo (.+)/, (msg, match) => {
	    const chatId = msg.chat.id;
	    const resp = match[1];
	    bot.sendMessage(chatId, resp);
    });

    bot.on('message', (msg) => {
	    const chatId = msg.chat.id;
    });
    
})();
