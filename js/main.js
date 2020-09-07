const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const fieldWidth = 150; // 152
const fieldHeight = 200; // 274
const lineWidth = 3;

const ballRadius = 3;
const racketWidth = ballRadius*2 * 6;
const racketHeight = ballRadius*2;

// коэффициент изменения размера игрового поля
let scale = (self.innerHeight-16)/fieldHeight;
(self.innerWidth-16)/fieldWidth < scale ? scale = (self.innerWidth-16)/fieldWidth : null;

canvas.width = `${fieldWidth*scale}`;
canvas.height = `${fieldHeight*scale}`;

// Ракетки игрока и компьютера
let ai = new racket('#3f3f3f', canvas.width/2-racketWidth*scale/2, 30, racketWidth*scale, racketHeight*scale);
let player = new racket('#f44336', canvas.width/2-racketWidth*scale/2, canvas.height-30-racketHeight*scale, racketWidth*scale, racketHeight*scale);

update();

function update() {
    // Отрисовка игрового поля
    ctx.fillStyle = 'rgb(46, 63, 115)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(1, 1, canvas.width-2, canvas.height-2);
    ctx.fillStyle = 'rgb(46, 63, 115)';
    ctx.fillRect(lineWidth*scale, lineWidth*scale, canvas.width-lineWidth*scale*2, canvas.height-lineWidth*scale*2);
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width/2, 1, 1, canvas.height-2);
    ctx.fillRect(1, canvas.height/2-lineWidth*scale/2, canvas.width-2, lineWidth*scale);

    // Отрисовка мяча
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(100, 280*scale/2, ballRadius*scale, 0, 2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#feb741';
    ctx.arc(100, 280*scale/2, ballRadius*scale-1, 0, 2*Math.PI);
    ctx.fill();


    ai.draw();
    player.draw();
}

// Отрисовка ракетки
function racket(color, x, y, w, h) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.draw = function() {
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'black';
        ctx.fillRect(this.x+this.h/2, this.y, this.w-this.h, this.h);
        ctx.strokeRect(this.x+this.h/2, this.y, this.w-this.h, this.h);
        
        ctx.beginPath();
        ctx.arc(this.x+this.h/2+2, this.y+this.h/2, this.h/2, 0.5*Math.PI, 1.5*Math.PI, false);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x+this.w-this.h/2-2, this.y+this.h/2, this.h/2, 0.5*Math.PI, 1.5*Math.PI, true);
        ctx.fill();
        ctx.stroke();
    }
}




document.addEventListener('mousemove', playerMove);
document.addEventListener('touchmove', playerMove);
function playerMove(e) {
    let clientX;
    if (e.type == 'touchmove') clientX = e.touches[0].clientX
    else clientX = e.clientX;

    if (clientX < canvas.offsetLeft + player.w/2) player.x = 0
    else if (clientX > canvas.offsetLeft + canvas.width - player.w/2) player.x = canvas.width - player.w
    else player.x = clientX - canvas.offsetLeft - player.w/2;
    update();
}