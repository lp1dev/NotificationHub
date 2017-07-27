(function() {
    'use strict'
    const WebSocket = require('nodejs-websocket')
    var _server
    var _callbacks = []
    var _topics = {}
    var _ips = {}

    function init(port) {
        _server = WebSocket.createServer(_onConnect)
        _server.listen(port)
    }

    function _onConnect(connection) {
        var ip = connection.socket.remoteAddress
        if (_ips[ip]) {
            console.log(' - client associated to ', _ips[ip])
            _topics[_ips[ip]].push(connection)
        }
        connection.on('text', function(message) {_onMessage(connection, message)})
        connection.on('close', function(reason, code) {_onClose(connection, reason, code)})
        console.log('[+] client connected', ip)
    }

    function _dispatch(message, origin) {
        for (var i = 0; i < _callbacks.length; i++) {
            _callbacks[i](message, origin)            
        }
    }
    
    function _onMessage(connection, message) {
        try {
            message = JSON.parse(message)
            if (undefined === _topics[message.origin.topic]) {
                _topics[message.origin.topic] = []
                console.log('[+] created chat topic', message.origin.topic)
            }
            if (_topics[message.origin.topic].indexOf(connection) === -1) {
                _topics[message.origin.topic].push(connection)
                _ips[connection.socket.remoteAddress] = message.origin.topic
            }
        }
        catch (err) {
            console.log(err)
            return
        }
        message.message = '(' + message.origin.author + ') ' + message.message
        _dispatch(message.message, message.origin)
    }

    function _onClose(connection, reason, code) {
        var connections = _topics[_ips[connection.socket.remoteAddress]]
        if (connections) {
            for (var i = 0; i < connections.length; i++) {
                var index = connections.indexOf(connection)                
                if (index !== -1) {
                    _topics[_ips[connection.socket.remoteAddress]].splice(index, 1)
                }
            }
        }
        console.log('[-] connection closed', code)
    }
    
    function subscribe(callback) {
        _callbacks.push(callback)
    }

    function notify(message, origin) {
        if (origin.type === 'telegram') {
            origin.author = 'Jeremie'
            var message = {message: message.message, origin: origin}
            if (origin.topic) {
                if (_topics[origin.topic]) {
                    for (var i = 0; i < _topics[origin.topic].length; i++) {
                        _topics[origin.topic][i].sendText(JSON.stringify(message))
                    }
                }
            }
        }
    }
    
    module.exports = {
        init: init,
        subscribe: subscribe,
        notify: notify
    }
})();
