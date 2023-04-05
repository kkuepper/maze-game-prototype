var modal = document.getElementById("myModal");
var closeButton = document.getElementsByClassName("close")[0];
var playing = true;
var autoMoveTimeout = null;

document
  .getElementById("play_again")
  .addEventListener("click", () => document.location.reload());

showModal = function (message, bad) {
  modal.style.display = "block";
  var element = document.querySelector(".gamehead");
  element.textContent = message;
  if(bad) {
    document.querySelector(".modal-header").classList.add("bad");
  }
};

closeButton.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

window.addEventListener("keydown", doKeyDown, true);

function doKeyDown(evt) {
  var handled = false;
  m.cancelAutoMove();
  if (playing) {
    switch (evt.keyCode) {
      case 38 /* Up arrow was pressed */:
        m.moveup("canvas");
        handled = true;
        break;
      case 87 /* Up arrow was pressed */:
        m.moveup("canvas");
        handled = true;
        break;
      case 40 /* Down arrow was pressed */:
        m.movedown("canvas");
        handled = true;
        break;
      case 83 /* Down arrow was pressed */:
        m.movedown("canvas");
        handled = true;
        break;
      case 37 /* Left arrow was pressed */:
        m.moveleft("canvas");
        handled = true;
        break;
      case 65 /* Left arrow was pressed */:
        m.moveleft("canvas");
        handled = true;
        break;
      case 39 /* Right arrow was pressed */:
        m.moveright("canvas");
        handled = true;
        break;
      case 68 /* Right arrow was pressed */:
        m.moveright("canvas");
        handled = true;
        break;
    }
    if (m.checker("canvas")) playing = false;
  }
  if (handled) evt.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
}

var dsd = function (size) {
  this.N = size;
  this.P = new Array(this.N);
  this.R = new Array(this.N);

  this.init = function () {
    for (var i = 0; i < this.N; i++) {
      this.P[i] = i;
      this.R[i] = 0;
    }
  };

  this.union = function (x, y) {
    var u = this.find(x);
    var v = this.find(y);
    if (this.R[u] > this.R[v]) {
      this.R[u] = this.R[v] + 1;
      this.P[u] = v;
    } else {
      this.R[v] = this.R[u] + 1;
      this.P[v] = u;
    }
  };

  this.find = function (x) {
    if (x == this.P[x]) return x;
    this.P[x] = this.find(this.P[x]);
    return this.P[x];
  };
};

function random(min, max) {
  return min + Math.random() * (max - min);
}
function randomChoice(choices) {
  return choices[Math.round(random(0, choices.length - 1))];
}

var maze = function (X, Y) {
  this.N = X;
  this.M = Y;
  this.S = 25;
  this.Board = new Array(2 * this.N + 1);
  this.EL = new Array();
  this.vis = new Array(2 * this.N + 1);
  this.delay = 2;
  this.x = 1;
  // Look up which input with name movement-type is checked, and use that value
  this.movementType = Array.from(document.getElementsByTagName("input")).find(input => input.name === 'movement-type' && input.checked).value;

  this.init = function () {
    for (var i = 0; i < 2 * this.N + 1; i++) {
      this.Board[i] = new Array(2 * this.M + 1);
      this.vis[i] = new Array(2 * this.M + 1);
    }

    for (var i = 0; i < 2 * this.N + 1; i++) {
      for (var j = 0; j < 2 * this.M + 1; j++) {
        if (!(i % 2) && !(j % 2)) {
          this.Board[i][j] = "+";
        } else if (!(i % 2)) {
          this.Board[i][j] = "-";
        } else if (!(j % 2)) {
          this.Board[i][j] = "|";
        } else {
          this.Board[i][j] = " ";
        }
        this.vis[i][j] = 0;
      }
    }
  };

  this.add_edges = function () {
    for (var i = 0; i < this.N; i++) {
      for (var j = 0; j < this.M; j++) {
        if (i != this.N - 1) {
          this.EL.push([[i, j], [i + 1, j], 1]);
        }
        if (j != this.M - 1) {
          this.EL.push([[i, j], [i, j + 1], 1]);
        }
      }
    }
  };

  //Hash function
  this.h = function (e) {
    return e[1] * this.N + e[0];
  };
  this.randomize = function (EL) {
    for (var i = 0; i < EL.length; i++) {
      var si = Math.floor(Math.random() * 387) % EL.length;
      var tmp = EL[si];
      EL[si] = EL[i];
      EL[i] = tmp;
    }
    return EL;
  };

  this.breakwall = function (e) {
    var x = e[0][0] + e[1][0] + 1;
    var y = e[0][1] + e[1][1] + 1;
    this.Board[x][y] = " ";
  };

  this.gen_maze = function () {
    this.EL = this.randomize(this.EL);
    var D = new dsd(this.N * this.M);
    D.init();
    var s = this.h([0, 0]);
    var e = this.h([this.N - 1, this.M - 1]);
    this.Board[1][0] = " ";
    this.Board[2 * this.N - 1][2 * this.M] = " ";
    //Run Kruskal
    for (var i = 0; i < this.EL.length; i++) {
      var x = this.h(this.EL[i][0]);
      var y = this.h(this.EL[i][1]);
      if (D.find(s) == D.find(e)) {
        if (!(D.find(x) == D.find(s) && D.find(y) == D.find(s))) {
          if (D.find(x) != D.find(y)) {
            D.union(x, y);
            this.breakwall(this.EL[i]);
            this.EL[i][2] = 0;
          }
        }
      } else if (D.find(x) != D.find(y)) {
        D.union(x, y);
        this.breakwall(this.EL[i]);
        this.EL[i][2] = 0;
      } else {
        continue;
      }
    }
  };

  this.draw_canvas = function (id) {
    this.canvas = document.getElementById(id);
    this.canvas.width = this.N*this.S*2 + this.S;
    this.canvas.height = this.M*this.S*2 + this.S;
    var scale = this.S;
    temp = [];
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext("2d");
      this.Board[1][0] = "$";
      for (var i = 0; i < 2 * this.N + 1; i++) {
        for (var j = 0; j < 2 * this.M + 1; j++) {
          if (this.Board[i][j] != " ") {
            // TODO: understand why this is commented out
            //} && this.Board[i][j] != '&') {
            this.ctx.fillStyle = "#0b052d";
            this.ctx.fillRect(scale * i, scale * j, scale, scale);
          } else if (i < 5 && j < 5) temp.push([i, j]);
        }
      }
      x = randomChoice(temp);
      this.Board[x[0]][x[1]] = "&";
      this.ctx.fillStyle = "#c4192a";
      this.ctx.fillRect(scale * x[0], scale * x[1], scale, scale);
    }
  };

  this.checkPos = function (id) {
    for (var i = 0; i < 2 * this.N + 1; i++) {
      for (var j = 0; j < 2 * this.M + 1; j++) {
        if (this.Board[i][j] == "&") {
          return [i, j];
        }
      }
    }
  };

  this.moveclear = function (a, b) {
    var scale = this.S;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#99AFA3";
    this.ctx.fillRect(scale * a, scale * b, scale, scale);
    this.Board[a][b] = " ";
  };

  this.move = function (a, b) {
    var scale = this.S;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#c4192a";
    this.ctx.fillRect(scale * a, scale * b, scale, scale);
    this.Board[a][b] = "&";
  };

  this.moveup = function (id) {
    if (this.moveUpPossible(id)) {
      this.moveclear(i, j + 1);
      this.move(i, j);
      if (
        this.movementType === 'decision' &&
        !this.moveLeftPossible(id) &&
        !this.moveRightPossible(id)
      ) {
        this.delayed(() => this.moveup(id));
      }
    }
  };

  this.movedown = function (id) {
    if (this.moveDownPossible(id)) {
      this.moveclear(i, j - 1);
      this.move(i, j);
      if (
        this.movementType === 'decision' &&
        !this.moveLeftPossible(id) &&
        !this.moveRightPossible(id)
      ) {
        this.delayed(() => this.movedown(id));
      }
    }
  };

  this.moveleft = function (id) {
    if (this.moveLeftPossible(id)) {
      this.moveclear(i + 1, j);
      this.move(i, j);
      if (
        this.movementType === 'decision' &&
        !this.moveUpPossible(id) &&
        !this.moveDownPossible(id)
      ) {
        this.delayed(() => this.moveleft(id));
      }
    }
  };

  this.moveright = function (id) {
    if (this.moveRightPossible(id)) {
      this.moveclear(i - 1, j);
      this.move(i, j);
      if (
        this.movementType === 'decision' &&
        !this.moveUpPossible(id) &&
        !this.moveDownPossible(id)
      ) {
        this.delayed(() => this.moveright(id));
      }
    }
  };

  this.delayed = function(action) {
    autoMoveTimeout = setTimeout(action, 150);
  }
  this.cancelAutoMove = function() {
    if(autoMoveTimeout != null){
      clearTimeout(autoMoveTimeout);
      autoMoveTimeout = null;
    }
  }

  this.moveUpPossible = function (id) {
    cord = this.checkPos(id);
    i = cord[0];
    j = cord[1];
    j -= 1;
    return this.Board[i][j] == " " ? true : false;
  };

  this.moveDownPossible = function (id) {
    cord = this.checkPos(id);
    i = cord[0];
    j = cord[1];
    j += 1;
    return this.Board[i][j] == " " ? true : false;
  };

  this.moveLeftPossible = function (id) {
    cord = this.checkPos(id);
    i = cord[0];
    j = cord[1];
    i -= 1;
    return this.Board[i][j] == " " ? true : false;
  };

  this.moveRightPossible = function (id) {
    cord = this.checkPos(id);
    i = cord[0];
    j = cord[1];
    i += 1;
    return this.Board[i][j] == " " ? true : false;
  };

  this.checker = function (id) {
    cord = this.checkPos(id);
    i = cord[0];
    j = cord[1];
    if ((i == 2*this.N-1 && j == 2*this.M) || (i == 1 && j == 0)) {
      showModal("Congrats! You Win", false);
      return 1;
    }
    return 0;
  };
};

m = new maze(5, 10);
m.init();
m.add_edges();
m.gen_maze();
m.draw_canvas("canvas");

addEventListener("input", (event) => {
  if (event.target.name === 'movement-type') {
    m.movementType = event.target.value;
  }
});

// The proper game loop
window.requestAnimationFrame(gameLoop);

function gameLoop() {
    if(m.movementType == "gravity") {
        m.movedown("canvas");
    }

    setTimeout(() => {
      window.requestAnimationFrame(gameLoop);
    }, 1000 / 6);
}