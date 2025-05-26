var proxy = require('node-tcp-proxy')
var util = require('util')

const listeningPort = process.env['LISTENING_PORT']
const forwardingHost = process.env['FORWARDING_HOST']
const forwardingPort = process.env['FORWARDING_PORT']

console.log(listeningPort, forwardingHost, forwardingPort)

var newProxy = proxy.createProxy(listeningPort, forwardingHost, forwardingPort, {
    allowedIPs: '',
    upstream: function (context, data) {
        console.log(
            util.format(
                'Client %s:%s sent:',
                context.proxySocket.remoteAddress,
                context.proxySocket.remotePort
            )
        )
        // do something with the data and return modified data
        return data
    },
    downstream: function (context, data) {
        console.log(
            util.format(
                'Service %s:%s sent:',
                context.serviceSocket.remoteAddress,
                context.serviceSocket.remotePort
            )
        )
        // do something with the data and return modified data
        return data
    },
    serviceHostSelected: function (proxySocket, i) {
        console.log(this)
        return i
    }
})
