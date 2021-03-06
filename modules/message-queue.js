(function (){
    const deepstream    = require('deepstream.io-client-js')
    const queue_size    = require('../config').queue_size
    var _ds
    var _queue
    var _record
    
    function init(ds) {
        _ds = ds
        _record = _ds.record.getRecord('notificationhub')
        _queue = []
    }

    function push(message) {
        if (_queue.length == queue_size) {
            queue.unshift()
        }
        _queue.push(message)
        _record.set(message)
    }

    function pop() {
        return _queue.pop()
    }

    function toString() {
        return _queue.toString()
    }
    
    module.exports = {
        init: init,
        push: push,
        pop: pop
    }
})();
