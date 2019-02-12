var express = require("express");
var app = express();
var server = require("http").Server(app);
var players = {};
var fruit;
var gameLoop;

function generateFruit(){
  return [Math.floor(Math.random() * 80), Math.floor(Math.random() * 60)]
}

var io = require("socket.io").listen(server);
io.on("connection", function(socket) {
  console.log("a user connected");
  // create a new player and add it to our players object
  players[socket.id] = {
    direction: [0,0],
    ready: false,
    x: Math.floor(Math.random() * 80), 
    y: Math.floor(Math.random() * 60),
    positions: []
  };

  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function() {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    players = {};
    fruit = undefined;
    state = undefined;
    if(gameLoop){
      clearInterval(gameLoop);
      gameLoop = undefined;

    }
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });

  
  socket.on("direction", function(id, direction) {
    //console.log('1',data)
    //console.log('2',direction)
    players[id] && (players[id].direction = direction);

  });

  socket.on('ready', function(id){
    if (gameLoop !== undefined){
      return;
    }
    players[id] && (players[id].ready = true);
    console.log('readied', players)
    var ready = 0;
    for(eachPlayer in players){
      players[eachPlayer].ready ? ready++ : null;
    }

    if(ready > 0/*ready === 2*/){ //////////////////////////////////////////////////////////////////////88
      console.log('START')
      io.emit("START");

      gameLoop = setInterval(function(){
        /////////////////////////////GAME LOOP
        var state = {players: {}, scores: {}};
        if(fruit === undefined){
          fruit = generateFruit();
        }

        for(eachPlayer in players){
          players[eachPlayer].x = players[eachPlayer].x + players[eachPlayer].direction[0];
          players[eachPlayer].y = players[eachPlayer].y + players[eachPlayer].direction[1];
          //limit values
          switch(true){
            case players[eachPlayer].x < 0:
            players[eachPlayer].x = 79;
            break;
            case players[eachPlayer].x > 80:
            players[eachPlayer].x = 0;
            break;
          }

          switch(true){
            case players[eachPlayer].y < 0:
            players[eachPlayer].y = 59;
            break;
            case players[eachPlayer].y > 60:
            players[eachPlayer].y = 0;
            break;
          }











          if(fruit && players[eachPlayer].x === fruit[0] && players[eachPlayer].y === fruit[1]){
            players[eachPlayer].positions.push([players[eachPlayer].x,players[eachPlayer].y])
            fruit = undefined;
          }else {
            players[eachPlayer].positions.shift(); //get rid of old position
            players[eachPlayer].positions.push([players[eachPlayer].x,players[eachPlayer].y])
          }

          state.players[eachPlayer] = {
            positions: players[eachPlayer].positions
          }
          state.scores[eachPlayer] = players[eachPlayer].positions.length
        }
          
        state.fruit = fruit;
        io.emit("state",  state);
      }, 66);
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
