WebSocket-Node includes both client and server functionality, available through WebSocketClient and WebSocketServer respectively.  Once a connection is established, the API for sending and receiving messages is identical whether you're acting as a client or server.  
WebSocket-Node 是一个Node.js的依赖包,其可以创建基于WebSocket的服务器或者客户端,建立后连接不会中断,发送和接收信息的API在服务器端或者客户端都是一样的.

WebSocketServer - 服务器端
==========================

`var WebSocketServer = require('websocket').server`

Constructor - 构造函数
----------------------

```javascript
new WebSocketServer([serverConfig]);
```

Methods - 方法
--------------

###mount(serverConfig)

`mount` will attach the WebSocketServer instance to a Node http.Server instance. `serverConfig` is required, and is an object with configuration values.  For those values, see **Server Config Options** below.  If you passed `serverConfig` to the constructor, this function will automatically be invoked.  
`mount` 将一个WebSocketServer的实例传入Node的http.Server实例,`serverConfig`参数是必须的,它是一个有详细配置值的对象.详细配置值的定义,可以参考下面的 **Server Config Options** .如果你将`serverconfig`传入构造函数,构造函数会自动处理这个值.  

###unmount()

`unmount` will detach the WebSocketServer instance from the Node http.Server instance.  All existing connections are left alone and will not be affected, but no new WebSocket connections will be accepted.  
`unmount` 会把WebSocketServer的实例从node的httpServer实例中删除,所有的连接会被孤立,而且不能操作这些连接.新的WebSocket连接也不会被接受.  

###closeAllConnections()

Will gracefully close all open WebSocket connections.  
会优雅地断开所有WebSocket连接.  

###shutDown()

Gracefully closes all open WebSocket connections and unmounts the server from the Node http.Server instance.  
优雅地断开所有连接,并删除http.Server实例中的WebSocketServer实例.  

Server Config Options
---------------------
**httpServer** - (http.Server instance)  
The http server instance to attach to.  **Required**.

**maxReceivedFrameSize** - uint - *Default: 64KiB*  
The maximum allowed received frame size in bytes.  Single frame messages will also be limited to this maximum.

**maxReceivedMessageSize** - uint - *Default: 1MiB*  
The maximum allowed aggregate message size (for fragmented messages) in bytes.
            
**fragmentOutgoingMessages** - Boolean - *Default: true*  
Whether or not to fragment outgoing messages.  If true, messages will be automatically fragmented into chunks of up to `fragmentationThreshold` bytes.
            
**fragmentationThreshold** - uint - *Default: 16KiB*  
The maximum size of a frame in bytes before it is automatically fragmented.

**keepalive** - boolean - *Default: true*  
If true, the server will automatically send a ping to all clients every `keepaliveInterval` milliseconds.  Each client has an independent keepalive timer, which is reset when any data is received from that client.

**keepaliveInterval** - uint - *Default: 20000*  
The interval in milliseconds to send keepalive pings to connected clients.

**dropConnectionOnKeepaliveTimeout** - boolean - *Default: true*  
If true, the server will consider any connection that has not received any data within the amount of time specified by `keepaliveGracePeriod` after a keepalive ping has been sent. Ignored if `keepalive` is false.

**keepaliveGracePeriod** - uint - *Default: 10000*  
The amount of time to wait after sending a keepalive ping before closing the connection if the connected peer does not respond. Ignored if `keepalive` or `dropConnectionOnKeepaliveTimeout` are false.  The grace period timer is reset when any data is received from the client.

**assembleFragments** - boolean - *Default: true*  
If true, fragmented messages will be automatically assembled and the full message will be emitted via a `message` event. If false, each frame will be emitted on the WebSocketConnection object via a `frame` event and the application will be responsible for aggregating multiple fragmented frames.  Single-frame messages will emit a `message` event in addition to the `frame` event. Most users will want to leave this set to `true`.

**autoAcceptConnections** - boolean - *Default: false*  
If this is true, websocket connections will be accepted regardless of the path and protocol specified by the client. The protocol accepted will be the first that was requested by the client.  Clients from any origin will be accepted. This should only be used in the simplest of cases.  You should probably leave this set to `false`; and inspect the request object to make sure it's acceptable before accepting it.

**closeTimeout** - uint - *Default: 5000*  
The number of milliseconds to wait after sending a close frame for an acknowledgement to come back before giving up and just closing the socket.

**disableNagleAlgorithm** - boolean - *Default: true*  
The Nagle Algorithm makes more efficient use of network resources by introducing a small delay before sending small packets so that multiple messages can be batched together before going onto the wire.  This however comes at the cost of latency, so the default is to disable it.  If you don't need low latency and are streaming lots of small messages, you can change this to 'false';

Events - 事件
-------------
There are three events emitted by a WebSocketServer instance that allow you to handle incoming requests, establish connections, and detect when a connection has been closed.  
WebSocketServer有三个待触发的事件,能分别处理 **请求** **建立连接** **侦察连接的断开**  

###request
`function(webSocketRequest)`

If `autoAcceptConnections` is set to `false`, a `request` event will be emitted by the server whenever a new WebSocket request is made.  You should inspect the requested protocols and the user's origin to verify the connection, and then accept or reject it by calling webSocketRequest.accept('chosen-protocol', 'accepted-origin') or webSocketRequest.reject()  
如果 `autoAccpetConnections` 被设置到 `false` ,一个 `request` 事件会被一个新的WebSocket请求触发. 你应该检查请求协议即 **requested protocols** 和用户来源即 **user's origin** 以验证连接的合法性.然后调用 `webSocketRequest.accept('chosen-protocol','accepted-origin')`来允许连接,或用`webSocketRequest.reject()`来拒绝连接.  

###connect
`function(webSocketConnection)`

If `autoAcceptConnections` is set to `true`, a `connect` event will be emitted by the server when a new WebSocket request is made.  The server automatically accepts all connections, so the `connect` event will pass the established WebSocketConnection object.  *This should only be used in extremely simplistic test servers etc. for security reasons, as it will accept connections from any source domain.*  
如果 `autoAcceptConnections` 设置为 `true` ,一个 `connect` 事件会被一个新的WebSocket请求触发.但服务器会自动接受所有连接请求,所以 `connect`时间会长期持久地调用 `WebSocketConnection` 对象. *基于安全原因,强烈建议这个事件只用在极其简单的测试型服务器或者开发环境中,因为这个事件会接受所有域的所有连接.*  

###close
`function(webSocketConnection, closeReason, description)`

Whenever a connection is closed for any reason, the WebSocketServer instance will emit a `close` event, passing a reference to the WebSocketConnection instance that was closed.  `closeReason` is the numeric reason status code for the connection closure, and `description` is a textual description of the close reason, if available.  
当一个连接因为任何原因断开,`WebSocketServer` 实例都会触发 `close` 事件,并对相应关闭的`WebSocketConnection`实例给出一个参考值-- `closeReason` ,它是一个连接断开的状态码.还有 `description` ,如果可能,它的内容会是描述连接断开原因的文本.  


WebSocketRequest
================
This object represents a client requesting to connect to the server, and allows you to accept or reject the connection based on whatever criteria you decide.  
这个对象在一个客户端请求连接到服务器时创建,允许你基于自定义规则选择接受还是拒绝连接.

Constructor - 构造函数
----------------------
This object is created internally by `WebSocketServer`.  
这个对象是 `WebSocketServer` 内部建立的.

However if you need to integrate WebSocket support without mounting an instance of `WebSocketServer` to your http server directly, you can handle the `upgrade` event yourself and pass the appropriate parameters to the `WebSocketRequest` constructor.  **NOTE:** You *must* pass a complete set of config options to the constructor.  See the section *'Server Config Options'* above.  The only option that isn't required in this context is `httpServer`.  
然而,如果你需要除去创建`WebSocketServer`的实例直接独立地编写 `WebSocket`服务器,你可以自己处理 `upgrade` 事件并传入适当的参数给构造函数`WebSocketRequest`.  
**注意:** 你 *必须* 传入一个完整的设置参数给构造函数`WebSocketRequest`,详细可以参考上面的 **Server Config Options** ,在这个情况下,唯一不需要的选项只有`httpServer`.

```javascript
new WebSocketRequest(socket, httpRequest, config);
```

The constructor won't immediately parse and validate the handshake from the client, so you need to call `readHandshake()`, which will `throw` an error if the handshake from the client is invalid or if an error is encountered, so it must always be wrapped in a try/catch block.

Properties
----------
###httpRequest

A reference to the original Node HTTP request object.  This may be useful in combination with some other Node-based web server, such as Express, for accessing cookies or session data.


###host

A string containing the contents of the `Host` header passed by the client.  This will include the port number if a non-standard port is used.

Examples:
```
www.example.com
www.example.com:8080
127.0.0.1:3000
```

###resource

A string containing the path that was requested by the client.

###resourceURL

A Node URL object containing the parsed `resource`, including the query string parameters.

###remoteAddress

The remote client's IP Address as a string.  If an `X-Forwarded-For` header is present, the value will be taken from that header to facilitate WebSocket servers that live behind a reverse-proxy.

###websocketVersion

**Deprecated, renamed to webSocketVersion**

###webSocketVersion

A number indicating the version of the WebSocket protocol requested by the client.

###origin

If the client is a web browser, `origin` will be a string containing the URL of the page containing the script that opened the connection.  If the client is **not** a web browser, `origin` may be `null` or "*".

###requestedExtensions

An array containing a list of extensions requested by the client.  This is not currently used for anything. **Example:**

```javascript
[
    {
        name: "simple-extension";
    },
    {
        name: "my-great-compression-extension",
        params: [
            {
                name: "compressionLevel",
                value: "10";
            }
        ]
    }
]
```

###requestedProtocols

An array containing a list of strings that indicate the subprotocols the client would like to speak.  The server should select the best one that it can support from the list and pass it to the accept() function when accepting the connection.  Note that all the strings in the `requestedProtocols` array will have been converted to lower case, so that acceptance of a subprotocol can be case-insensitive.

Methods
-------

###accept(acceptedProtocol, allowedOrigin)
*Returns: WebSocketConnection instance*

After inspecting the WebSocketRequest's properties, call this function on the request object to accept the connection.  If you don't have a particular subprotocol you wish to speak, you may pass `null` for the `acceptedProtocol` parameter.  Note that the `acceptedProtocol` parameter is *case-insensitive*, and you must either pass a value that was originally requested by the client or `null`.  For browser clients (in which the `origin` property would be non-null) you must pass that user's origin as the `allowedOrigin` parameter to confirm that you wish to accept connections from the given origin.  The return value contains the established `WebSocketConnection` instance that can be used to communicate with the connected client.

###reject([httpStatus], [reason])

If you decide to reject the connection, you must call `reject`.  You may optionally pass in an HTTP Status code (such as 404) and a textual description that will be sent to the client in the form of an "X-WebSocket-Reject-Reason" header.  The connection will then be closed.

Events
------

###requestAccepted
`function(webSocketConnection)`

Emitted by the WebSocketRequest object when the `accept` method has been called and the connection has been established.  `webSocketConnection` is the established `WebSocketConnection` instance that can be used to communicate with the connected client.

###requestRejected
`function()`

Emitted by the WebSocketRequest object when the `reject` method has been called and the connection has been terminated.


WebSocketConnection
===================

This object provides the interface through which you can communicate with connected peers.  It is used in both WebSocketServer and WebSocketClient situations.

Constructor
-----------
This object is created internally by `WebSocketRequest`.

Properties
----------

###closeDescription

After the connection is closed, contains a textual description of the reason for the connection closure, or `null` if the connection is still open.

###closeReasonCode

After the connection is closed, contains the numeric close reason status code, or `-1` if the connection is still open.

###socket

The underlying net.Socket instance for the connection.

###protocol

The subprotocol that was chosen to be spoken on this connection.  This field will have been converted to lower case.

###extensions

An array of extensions that were negotiated for this connection.  Currently unused, will always be an empty array.

###remoteAddress

The IP address of the remote peer as a string.  In the case of a server, the `X-Forwarded-For` header will be respected and preferred for the purposes of populating this field.  If you need to get to the actual remote IP address, `webSocketConnection.socket.remoteAddress` will provide it.

###websocketVersion

**Deprecated, renamed to webSocketVersion.**

###webSocketVersion

A number indicating the version of the WebSocket protocol being spoken on this connection.

###connected

A boolean value indicating whether or not the connection is still connected.  *Read-only*

Methods
-------
###close

Will gracefully close the connection.  A close frame will be sent to the remote peer indicating that we wish to close the connection, and we will then wait for up to `config.closeTimeout` milliseconds for an acknowledgment from the remote peer before terminating the underlying socket connection.  The `closeTimeout` is passed as part of the `serverOptions` or `clientOptions` hashes to either the `WebSocketServer` or `WebSocketClient` constructors.

###drop([reasonCode], [description])

Will send a close frame to the remote peer with the provided `reasonCode` and `description` and will immediately close the socket without waiting for a response.  This should generally be used only in error conditions.  The default `reasonCode` is 1002 (Protocol Error).  Close reasons defined by the WebSocket protocol draft include:

```javascript
WebSocketConnection.CLOSE_REASON_NORMAL = 1000;
WebSocketConnection.CLOSE_REASON_GOING_AWAY = 1001;
WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR = 1002;
WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
WebSocketConnection.CLOSE_REASON_RESERVED = 1004; // Reserved value.  Undefined meaning.
WebSocketConnection.CLOSE_REASON_NOT_PROVIDED = 1005; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_INVALID_DATA = 1007;
WebSocketConnection.CLOSE_REASON_POLICY_VIOLATION = 1008;
WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
WebSocketConnection.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
```
###sendUTF(string)

Immediately sends the specified string as a UTF-8 WebSocket message to the remote peer.  If `config.fragmentOutgoingMessages` is `true` the message may be sent as multiple fragments if it exceeds `config.fragmentationThreshold` bytes.  Any object that implements the `toString()` method may be passed to `sendUTF()`

###sendBytes(buffer)

Immediately sends the specified Node `Buffer` object as a Binary WebSocket message to the remote peer.  If `config.fragmentOutgoingMessages` is `true` the message may be sent as multiple fragments if it exceeds `config.fragmentationThreshold` bytes.

###send(data)

A convenience function that will auto-detect the data type and send the appropriate WebSocket message accordingly.  Immediately sends the specified data as either a UTF-8 or Binary message.  If `data` is a Node Buffer, a binary message will be sent.  Otherwise, the object provided must implement the `toString()` method, and the result of calling `toString()` on the `data` object will be sent as a UTF-8 message.

###ping(data)

Sends a ping frame to the remote peer.  `data` can be a Node `Buffer` or any object that implements `toString()`, such as a `string` or `number`.  Ping frames must not exceed 125 bytes in length.

###pong(buffer)

Sends a pong frame to the remote peer.  Pong frames may be sent unsolicited and such pong frames will trigger no action on the receiving peer.  Pong frames sent in response to a ping frame must mirror the payload data of the ping frame exactly.  The `WebSocketConnection` object handles this internally for you, so there should be no need to use this method to respond to pings.  Pong frames must not exceed 125 bytes in length.

###sendFrame(webSocketFrame)

Serializes a `WebSocketFrame` object into binary data and immediately sends it to the remote peer.  This is an advanced function, requiring you to manually compose your own `WebSocketFrame`.  You should probably use `sendUTF` or `sendBytes` instead.

Events
------
###message
`function(message)`

Emitted whenever a complete single-frame message is received, or if `config.assembleFragments` is `true` (the default), it will also be emitted with a complete message assembled from multiple fragmented frames.  This is the primary event to listen for to receive messages from the remote peer.  The `message` object looks like the following:

```javascript
// For Text Frames:
{
    type: "utf8",
    utf8Data: "A string containing the received message."
}

// For Binary Frames:
{
    type: "binary",
    binaryData: binaryDataBuffer // a Buffer object containing the binary message payload
}
```

###frame
`function(webSocketFrame)`

This event is emitted only if `config.assembleFragments` is `false` (default is `true`).  This allows you to handle individual fragments as they are received without waiting on `WebSocketConnection` to buffer them into a single `message` event for you.  This may be desirable if you are working with streaming data, as it is possible to send fragments continually without ever stopping.  `webSocketFrame` is an instance of `WebSocketFrame` which has properties that represent all the individual fields in WebSocket's binary framing protocol.

###close
`function(reasonCode, description)`

This event is emitted when the connection has been fully closed and the socket is no longer connected.  `reasonCode` is the numeric reason code for the connection closure.  `description` is a textual explanation for the connection closure, if available.

###error
`function(error)`

This event is emitted when there has been a socket error.  If this occurs, a `close` event will also be emitted.


WebSocketFrame
==============
`var WebSocketFrame = require('websocket').frame`

This object represents the low level individual frame and is used to drive how the bytes are serialized onto the wire.

Constructor
-----------
```javascript
new WebSocketFrame();
```

Properties
----------

###fin
*Boolean*

Indicates that this is either the only frame in a message, or the last frame in a fragmentation sequence.

###rsv1
*Boolean*

Represents the RSV1 field in the framing, which is currently not used.  Setting this to true will result in a Protocol Error on the receiving peer.

###rsv2
*Boolean*

Represents the RSV2 field in the framing, which is currently not used.  Setting this to true will result in a Protocol Error on the receiving peer.

###rsv3
*Boolean*

Represents the RSV3 field in the framing, which is currently not used.  Setting this to true will result in a Protocol Error on the receiving peer.

###mask
*uint*

Whether or not this frame is (or should be) masked.  For outgoing frames, when connected as a client, this flag is automatically forced to `true` by WebSocketConnection.  Outgoing frames sent from the server-side of a connection are not masked.

###opcode
*uint*

Identifies which kind of frame this is.  List of Opcodes:

    Hex  - Dec - Description
    0x00 -   0 - Continuation
    0x01 -   1 - Text Frame
    0x02 -   2 - Binary Frame
    0x08 -   8 - Close Frame
    0x09 -   9 - Ping Frame
    0x0A -  10 - Pong Frame

###length
*Read-only, uint*

Identifies the length of the payload data on a received frame.  When sending a frame, the length will be automatically calculated from the `binaryPayload` object.

###binaryPayload
*Buffer object*

The binary payload data.  **NOTE**: Even text frames are sent with a Buffer providing the binary payload data.  When sending a UTF-8 Text Frame, you must serialize your string into a Buffer object before constructing your frame, and when receiving a UTF-8 Text Frame, you must deserialize the string from the provided Buffer object.  Do not read UTF-8 data from fragmented Text Frames, as it may have fragmented the data in the middle of a UTF-8 encoded character.  You should buffer all fragments of a text message before attempting to decode the UTF-8 data.


WebSocketClient
===============
`var WebSocketClient = require('websocket').client`

This object allows you to make client connections to a WebSocket server.

Constructor
-----------
```javascript
new WebSocketClient([clientConfig]);
```

Client Config Options
---------------------
**websocketVersion** - uint - *Default: 13*  
**Deprecated, renamed to webSocketVersion.**

**webSocketVersion** - uint - *Default: 13*
Which version of the WebSocket protocol to use when making the connection.  Currently supported values are 8 and 13.
This option will be removed once the protocol is finalized by the IETF It is only available to ease the transition through the intermediate draft protocol versions. The only thing this affects the name of the Origin header.

**maxReceivedFrameSize** - uint - *Default: 1MiB*  
The maximum allowed received frame size in bytes.  Single frame messages will also be limited to this maximum.

**maxReceivedMessageSize** - uint - *Default: 8MiB*  
The maximum allowed aggregate message size (for fragmented messages) in bytes.
            
**fragmentOutgoingMessages** - Boolean - *Default: true*  
Whether or not to fragment outgoing messages.  If true, messages will be automatically fragmented into chunks of up to `fragmentationThreshold` bytes.
            
**fragmentationThreshold** - uint - *Default: 16KiB*  
The maximum size of a frame in bytes before it is automatically fragmented.

**assembleFragments** - boolean - *Default: true*  
If true, fragmented messages will be automatically assembled and the full message will be emitted via a `message` event. If false, each frame will be emitted on the WebSocketConnection object via a `frame` event and the application will be responsible for aggregating multiple fragmented frames.  Single-frame messages will emit a `message` event in addition to the `frame` event. Most users will want to leave this set to `true`.

**closeTimeout** - uint - *Default: 5000*  
The number of milliseconds to wait after sending a close frame for an acknowledgement to come back before giving up and just closing the socket.


Methods
-------
###connect(requestUrl, requestedProtocols, origin)

Will establish a connection to the given `requestUrl`.  `requestedProtocols` indicates a list of multiple subprotocols supported by the client.  The remote server will select the best subprotocol that it supports and send that back when establishing the connection.  `origin` is an optional field that can be used in user-agent scenarios to identify the page containing any scripting content that caused the connection to be requested.  (This seems unlikely in node.. probably should leave it null most of the time.)  `requestUrl` should be a standard websocket url, such as:

`ws://www.mygreatapp.com:1234/websocketapp/`


Events
------
###connect
`function(webSocketConnection)`

Emitted upon successfully negotiating the WebSocket handshake with the remote server.  `webSocketConnection` is an instance of `WebSocketConnection` that can be used to send and receive messages with the remote server.

###connectFailed
`function(errorDescription)`

Emitted when there is an error connecting to the remote host or the handshake response sent by the server is invalid.  

WebSocketServer伪代码
---------------------
```js
var WebSocketServer = function WebSocketServer(config){
    this.mount(config);
};

WebSocketServer.prototype.mount = function(config){
    this.config = {//config
    };
    this.config.httpServer.on('upgrade', this.handleUpgrade);//upgrade pass 'request' 'socket' instance
};

WebSocketServer.prototype.handleUpgrade = function(request, socket){
    var wsRequest = new WebSocketRequest(socket, request, this.config);
    wsRequest.readHandshake();
    wsRequest.once('requestAccepted', function(wsConnection){
        var self = this;
        wsConnection.once('close', function(closeReason, description){
            wsRequest.handleConnectionClose(wsConnection, closeReason, description);
        });
        wsRequest.connections.push(wsConnection);
    });
    this.emit('request', wsRequest);
};

function WebSocketRequest(socket, httpRequest, serverConfig) {
    this.socket = socket;
    this.httpRequest = httpRequest;
    this.resource = httpRequest.url;
    this.remoteAddress = socket.remoteAddress;
    this.serverConfig = serverConfig;
};

WebSocketRequest.accept = function(acceptedProtocol, allowedOrigin){
    var wsConnection = new WebSocketConnection(this.socket, [], acceptedProtocol, false, this.serverConfig);
    wsConnection.webSocketVersion = this.webSocketVersion;
    wsConnection.remoteAddress = this.remoteAddress;

    var acceptKey = crypto.createHash('sha1').update(this.key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest('base64');
    var response = "HTTP/1.1 101 Switching Protocols\r\n" +
                   "Upgrade: websocket\r\n" +
                   "Connection: Upgrade\r\n" +
                   "Sec-WebSocket-Accept: " + acceptKey + "\r\n" +
                   "Sec-WebSocket-Protocol: " + acceptedProtocol + "\r\n" +
                   "Origin: " + allowedOrigin + "\r\n";
    this.socket.write(response, 'ascii');
    this.emit('requestAccepted', wsConnection);
    return wsConnection;
};

var wsServer = new WebSocketServer(config);
wsServer.on('request', function(wsRequest){
    var wsConnection = wsRequest.accept('big-protocol', wsRequest.origin);
    wsConnection.on('message', function(message){
        wsConnection.sendUTF(message.utf8Data);
    });
    wsConnection.on('close', function(reasonCode, description){
    });
});
```
