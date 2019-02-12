var express = require("express");
var app = express();
var server = require("http").Server(app);
var players = {};


var io = require("socket.io").listen(server);
io.on("connection", function(socket) {
  console.log("a user connected");
  // create a new player and add it to our players object
  players[socket.id] = {
    direction: [0,0],
    playerId: socket.id,
    ready: false,
    x: Math.floor(Math.random() * 800), 
    y: Math.floor(Math.random() * 600)
  };

  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function() {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });

  
  socket.on("direction", function(id, direction) {
    //console.log('1',data)
    //console.log('2',direction)
    players[id].direction = direction;

  });

  socket.on('ready', function(id){
    players[id].ready = true;
    console.log('readied', players)
    var ready = 0;
    for(eachPlayer in players){
      players[eachPlayer].ready ? ready++ : null;
    }

    if(ready > 0/*ready === 2*/){ //////////////////////////////////////////////////////////////////////88
      console.log('START')
      io.emit("START");

      setInterval(function(){
        var state = {};

        for(eachPlayer in players){
          players[eachPlayer].x = players[eachPlayer].x + players[eachPlayer].direction[0];
          players[eachPlayer].y = players[eachPlayer].y + players[eachPlayer].direction[1];

          state[eachPlayer] = {
            x: players[eachPlayer].x,
            y: players[eachPlayer].y
          }
        }
          
        io.emit("state",  state);
      }, 5);
    }

  })
});

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, function() {
  console.log(`Listening on ${server.address().port}`);
});
