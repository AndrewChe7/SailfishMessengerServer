var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(9000, function() { });

var users = {};


// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on("request", function(request) {
  
  var connection = request.accept(null, request.origin);
  console.log("new client!");

  connection.on("message", function(message) {
    if (message.type === "utf8") {
  
      //console.log("Message", message);
      data = JSON.parse(message.utf8Data);
      switch (data.type) {
        case "text":
          console.log("New message! \n \"", data.message, "\"");
          break;
        case "auth":
          console.log("New auth: ", data.login);
          break;
        case default:
          console.log("Wrong type of data!");
      }
  
    }
  });

  connection.on("close", function(connection) {
    console.log("User disconnected");
  });
});