#!/usr/bin/node
(function (){
    const mq            = require('./modules/message-queue')
    const restApi       = require('./modules/rest-api')
    const telegramBot   = require('./modules/telegram-bot')
    const websocket     = require('./modules/websocket')
    const deepstream    = require('deepstream.io-client-js')
    const config        = require('./config')
    
    function init() {
        //Modules initialisation
        ds = deepstream(config.deepstream_app_url)
        ds.login()
        mq.init(ds)
        restApi.init(config.port)
        telegramBot.init(config.telegram_token, config.telegram_admin)
        websocket.init(config.websocket_port)
        //Modules subscription
        telegramBot.subscribe(onNewNotification)
        restApi.subscribe(onNewNotification)
        websocket.subscribe(onNewNotification)
        restApi.run()
    }

    function onNewNotification(message, origin) {
        mq.push({message: message, origin: origin})
        telegramBot.notify({message: message}, origin)
        websocket.notify({message: message}, origin)
    }

    init()    
})();
