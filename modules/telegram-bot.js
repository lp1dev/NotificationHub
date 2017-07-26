(function (){
    const TelegramBot = require('node-telegram-bot-api')
    var _bot
    var _callbacks = []
    var _receivers = []

    function _dispatch(message, origin) {
        for (var i = 0; i < _callbacks.length; i++) {
            _callbacks[i](message, origin)
        }
    }
    
    function init(token) {
        _bot = new TelegramBot(token, {polling: true})
        
        _bot.onText(/subscribe (.+)/, (msg, match) => {
            console.log('[+] subscribed', msg.chat.id, 'to topic', match[1])
	        const chatId = msg.chat.id
            if (_receivers.indexOf(chatId) == -1) {
                _receivers.push(chatId)
            }
	        const resp = "(Notification Hub) ~ You successfully subscribed to " + match[1]
	        _bot.sendMessage(chatId, resp)
        })
        
        _bot.onText(/notify (.+)/, (msg, match) => {
            console.log('[+] incoming notification from', msg.chat.id)
	        const chatId = msg.chat.id
            _dispatch(match[1], {type: 'telegram', chat_id: msg.chat.id})
	        const resp = "(Notification Hub) ~ Notification dispatched ~"
	        _bot.sendMessage(chatId, resp)
        })

        console.log('Telegram bot running')
    }

    function subscribe(method) {
        _callbacks.push(method)
    }

    function notify(message, origin) {
        for (var i = 0; i < _receivers.length; i++) {
            _bot.sendMessage(_receivers[i], message.message)
        }
    }
    
    module.exports = {
        init: init,
        subscribe: subscribe,
        notify: notify
    }
    
})();
