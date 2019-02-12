this.socket = io();
var gameStarted = false;
//var game = document.querySelector('#gameWindow');
var canvas = document.getElementById("gameWindow");
var ctx = canvas.getContext("2d");
var cache;

this.socket.on("newPlayer", function(data) {
  console.log("new player");
  console.log(data);
});

this.socket.on("START", function(data) {
  console.log("players are ready");
  gameStarted = true;
});

function amReady() {
  this.socket.emit("ready", socket.id);
}

this.socket.on("state", function(data) {
  //ctx.fillStyle = '#ffffff';
  //ctx.fillRect(0, 0, 800, 600);
  //console.log(socket.id);
  //me == socket.id

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 800, 600);
  for (let players in data) {
    if (data[players] === data[socket.id]) {
      //ME
      ctx.fillStyle = "#0000FF";
    } else {
      ctx.fillStyle = "#FF0000";
    }

    console.log(data[players].x - 5, data[players].y - 5, 10, 10);
    ctx.fillRect(data[players].x - 5, data[players].y - 5, 10, 10);
  }

  //Wq3Mi6K7PVmbIzyAAAAD: {x: 0, y: 0}
  //wbSfS0viFWaE2eznAAAC: {x: 0, y: 0}
  //console.log(data)
});

window.addEventListener("keydown", function(event) {
  if (!gameStarted) {
    return;
  }
  //[LEFT : 37, RIGHT:39 TOP :38 BOTTOM: 40];
  var accepted = [32, 37, 38, 39, 40];
  if (accepted.indexOf(event.keyCode) > -1) {
    var direction;
    switch (event.keyCode) {
      case 37: //left
        direction = [-1, 0];
        break;
      case 38: //top
        direction = [0, -1];
        break;
      case 39: //right
        direction = [1, 0];
        break;
      case 40: //bottom
        direction = [0, 1];
        break;
      case 32:
        direction = [0, 0];
        break;
    }

    this.socket.emit("direction", socket.id, direction);
  }
});