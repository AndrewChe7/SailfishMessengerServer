var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(9000, function() { });

var users = {};
var loggedIn = [];

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
          if (loggedIn.indexOf(connection) != -1 ) {
            console.log("New message!\n", data.message);
            for (login in users) {
              if (users[login] != connection) {
                data = {
                  "type": "text",
                  "message": data.message
                }
                users[login].send(JSON.stringify(data));
              }
            }
          } else {
            data = {
              "type": "error",
              "error": "You are not logged in"
            }
            connection.send(JSON.stringify(data));
          }
          break;
        case "auth":
          if (data.action == "login") {
            login = data.login;
            if (!(login in users)) {
              console.log("New auth:", login);
              users[login] = connection;
              loggedIn.push(connection);
              data = {
                "type": "info",
                "info": "You logged in as" + login
              }
              connection.send(JSON.stringify(data));
              data = {
                "type": "event",
                "event": "loggedIn"
              }
              connection.send(JSON.stringify(data));
              
            } else {
              data = {
                "type": "error",
                "error": "User already exists"
              }
              connection.send(JSON.stringify(data));
            }

          } else if (data.action == "logout") {
            //console.log("log out");
            for (var login in users) {
              if (users[login] == connection) {
                delete users[login];
                console.log(login, "logged out");
                data = {
                  "type": "event",
                  "event": "loggedOut"
                }
                connection.send(JSON.stringify(data));
                data = {
                  "type": "info",
                  "info": "You logged in as" + login
                }
                connection.send(JSON.stringify(data));
              }
            }
            delete loggedIn[loggedIn.indexOf(connection)];
          }
          break;
        default:
          console.log("Wrong type of data!");
      }
  
    }
  });

  connection.on("close", function(connection) {
    for (var login in users) {
      if (users[login] == connection) {
        delete users[login];
        console.log(login, "logged out");
      }
    }
    delete loggedIn[loggedIn.indexOf(connection)];
  });
});