(function (){
    const express       = require('express')
    const bodyParser    = require('body-parser')
    const version       = require('../config').version
    const app           = express()
    const _callbacks    = []
    var _port
    
    app.use(bodyParser.json())
    
    function init(port) {       
        if (isNaN(parseFloat(port)) || !isFinite(port)){
            port = 3000;
        }
        _port = port
    }

    function _dispatch(message, topic, ip) {
        console.log('[+] incoming notification from', ip)
        origin = {type: 'web', topic: topic, ip: ip}
        for (var i = 0; i < _callbacks.length; i++) {
            _callbacks[i](message.message, origin)
        }
    }

    app.get('/', function (req, res) {
        res.send('Notification Hub ' + version)
    })

    app.post('/message/:topic', function(req, res) {
        _dispatch(req.body, req.params.topic, req.connection.remoteAddress)
        res.send('OK')
    })
    
    app.post('/message/:topic/:message', function(req, res) {
        _dispatch(JSON.parse(req.params.message), req.params.topic, req.connection.remoteAddress)
        res.send('OK')
    })

    function subscribe(callback) {
        _callbacks.push(callback)
    }
    
    function run() {
        app.listen(_port, function () {
            console.log('Notifications Hub listening on port ' + _port)
        })
    }

    module.exports = {
        init: init,
        run: run,
        subscribe: subscribe
    }
    
})();
