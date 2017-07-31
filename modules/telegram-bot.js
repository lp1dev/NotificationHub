(function (){
    const TelegramBot = require('node-telegram-bot-api')
    var _bot
    var _callbacks = []
    var _topics = {'all': []}

    function _dispatch(message, origin) {
        for (var i = 0; i < _callbacks.length; i++) {
            _callbacks[i](message, origin)
        }
    }
    
    function init(token, telegramAdmin) {
        _topics['all'].push(telegramAdmin)
        _bot = new TelegramBot(token, {polling: true})
        
        _bot.onText(/subscribe (.+)/, (msg, match) => {
            console.log('[+] subscribed', msg.chat.id, 'to topic', match[1])
	        const chatId = msg.chat.id
            if (!_topics[match[1]]) {
                _topics[match[1]] = []
            }
            if (_topics[match[1]].indexOf(chatId) == -1) {
                _topics[match[1]].push(chatId)
            }
	        const resp = "(Notification Hub) ~ You successfully subscribed to " + match[1]
	        _bot.sendMessage(chatId, resp)
        })
        
        _bot.onText(/notify (#\w+) (.+)/, (msg, match) => {
            console.log('[+] incoming notification from', msg.chat.id, 'to', match[1])
	        const chatId = msg.chat.id
            _dispatch(match[2], {type: 'telegram', chat_id: msg.chat.id, topic: match[1].replace('#', '')})
	        const resp = "(Notification Hub) ~ Notification dispatched to " + match[1]
	        _bot.sendMessage(chatId, resp)
        })

        console.log('Telegram bot running')
    }

    function subscribe(method) {
        _callbacks.push(method)
    }

    function notify(message, origin) {
        topic = origin['topic'] || 'all'
        if (!_topics[topic]) {
            _topics[topic] = []
        }
        chatIds = (topic === 'all') ? _topics[topic] :_topics[topic].concat(_topics['all'])
        for (var i = 0; i < chatIds.length; i++) {
            if (chatIds[i] !== origin.chat_id && chatIds[i] !== origin.author) {
                _bot.sendMessage(chatIds[i], '#' + topic + ': ' + message.message)
            }
        }
    }
    
    module.exports = {
        init: init,
        subscribe: subscribe,
        notify: notify
    }
    
})();
