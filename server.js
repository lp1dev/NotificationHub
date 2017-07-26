#!/usr/bin/node
(function (){
    const mq            = require('./modules/message-queue')
    const restApi       = require('./modules/rest-api')
    const telegramBot   = require('./modules/telegram-bot')
    const config        = require('./config')

    function test() {
        var randMessage = {value: Math.random()}
        mq.push(randMessage)
        var popped = mq.pop()
        if (randMessage !== popped)
            console.error("[!] The message in the queue is different than the one inserted", randMessage, popped)
    }
    
    function init() {
        //Modules initialisation
        mq.init(config.deepstream_app_url)
        restApi.init(config.port)
        telegramBot.init(config.telegram_token)
        //Modules subscription
        telegramBot.subscribe(onNewNotification)
        restApi.subscribe(onNewNotification)
        restApi.run()
    }

    function onNewNotification(message, origin) {
        mq.push({message: message, origin: origin})
        telegramBot.notify({message: message}, origin)
    }

    init()
    test()
    
})();
