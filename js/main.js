const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const fieldWidth = 150; // 152
const fieldHeight = 200; // 274
const lineWidth = 3;

const ballRadius = 3;

const racketWidth = ballRadius*2 * 6;
const racketHeight = ballRadius*2;


// коэффициент изменения размера игрового поля(для мобильной адаптации)
let scale = (self.innerHeight-16)/fieldHeight;
(self.innerWidth-16)/fieldWidth < scale ? scale = (self.innerWidth-16)/fieldWidth : null;

// Размеры поля
canvas.width = `${fieldWidth*scale}`;
canvas.height = `${fieldHeight*scale}`;

let gameInterval, velocityInterval;
let ballVelocity;

// Ракетки игрока и компьютера и мяч
let ai = new racket('#3f3f3f', canvas.width/2-racketWidth*scale/2, 30, racketWidth*scale, racketHeight*scale);
let player = new racket('#f44336', canvas.width/2-racketWidth*scale/2, canvas.height-30-racketHeight*scale, racketWidth*scale, racketHeight*scale);
let newBall = new ball('#feb741', canvas.width/2, canvas.height/2, ballRadius*scale);




update();
document.addEventListener('click', play);

function play(e) {
    document.addEventListener('mousemove', playerMove);
    document.addEventListener('touchmove', playerMove);

    ballVelocity = 0.7;
    ai.score = 0;
    player.score = 0;

    newBall.vX = ballVelocity*scale*0.2;
    newBall.vY = -ballVelocity*scale*1.5;
    newBall.x = canvas.width/2;
    newBall.y = canvas.height/2;

    velocityInterval = setInterval(()=>{if (ballVelocity < 1.1) ballVelocity += 0.05}, 4000)
    gameInterval = setInterval(game, 1000/120);
    document.removeEventListener(e.type, play);
}


function game() {
    update();

    // Касание мяча ракеткой
    let obj = null;
    if (collision(player, newBall, true)) {
        obj = player;
    } else if (collision(ai, newBall, false)) {
        obj = ai;
    }
    if (obj) {
        newBall.vY = -newBall.vY;
        newBall.vY > 0 ? newBall.vY += ballVelocity*scale*0.02 : newBall.vY -= ballVelocity*scale*0.02; // Увеличение вертикальной скорости
        newBall.vX += ballDirection(obj, newBall)*scale*ballVelocity*2;
        // Ограничение боковой скорости мяча
        let maxSpeed = (ballVelocity**1.2)*scale*1.5;
        if (newBall.vX > maxSpeed) newBall.vX = maxSpeed
        else if (newBall.vX < -maxSpeed) newBall.vX = -maxSpeed;
    }

    // Касание боковых стенок
    if (newBall.x+newBall.r*2 >= canvas.width || newBall.x <= 0) {
        newBall.vX = -newBall.vX;
        newBall.x += newBall.vX; // фикс бага
    }

    // Касание торцевых стенок
    let point = null;
    if (newBall.y+newBall.r*2 >= canvas.height) {
        point = ai;
    } else if (newBall.y <= 0) {
        point = player;
    }
    if (point) {
        point.score++;
        if (point.score < 10) {
            newBall.vY = -newBall.vY;
        } else {
            // Конец игры
            update();
            clearInterval(gameInterval);
            clearInterval(velocityInterval); 
            document.addEventListener('click', play);
            document.removeEventListener('mousemove', playerMove);
            document.removeEventListener('touchmove', playerMove);

            let text;
            if (player.score == 10) {
                text = 'Победа';
                ctx.fillStyle = '#8bc34a';
            } else {
                text = 'Поражение'
                ctx.fillStyle = '#f44336';
            }
            ctx.font = `bold ${canvas.width/10}px courier`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            
            ctx.fillText(text, canvas.width*0.5, canvas.height*0.46);
        }
    }

    // Движение бота
    if (newBall.x+newBall.r < ai.x+ai.w/2) {
        if (ai.x - ballVelocity*scale*1.1 > 0)
            ai.x -= ballVelocity*scale*1.1;
    } else if (newBall.x+newBall.r > ai.x+ai.w/2){
        if (ai.x + ai.w + ballVelocity*scale*1.1 < canvas.width) 
        ai.x += ballVelocity*scale*1.1;
    }

    newBall.x += newBall.vX;
    newBall.y += newBall.vY; 
}

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
    
    // Счёт
    ctx.font = `${canvas.width/10}px courier`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(player.score, canvas.width*0.85, canvas.height*0.6);
    ctx.fillText(ai.score, canvas.width*0.15, canvas.height*0.4);

    ai.draw();
    player.draw();
    newBall.draw();
}

// Отрисовка ракетки
function racket(color, x, y, w, h) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.score = 0;
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

// Отрисовка мяча
function ball(color, x, y, r) {
    this.color = color;
    this.x = x-r;
    this.y = y-r;
    this.w = 2*r;
    this.h = 2*r;
    this.r = r;
    this.draw = function() {
        
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(this.x+this.r, this.y+this.r, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x+this.r, this.y+this.r, this.r-1, 0, 2*Math.PI);
        ctx.fill();
    }
}

// Касание мяча ракетки
function collision(objP, objBall, topSide=true) {
    if ( objP.x < objBall.x+objBall.w && objP.x+objP.w > objBall.x
        && 
        ((topSide && objBall.vY > 0 && objP.y < objBall.y+objBall.h+4 && objP.y > objBall.y+objBall.h-16) 
        || (!topSide && objBall.vY < 0 && objP.y+objP.h < objBall.y+16 && objP.y+objP.h > objBall.y-4)) ) {
            return true;
    } else {
        return false;
    }
}

// Корректировка направления мяча при касании
function ballDirection(objP, objBall) {
    let index = (objBall.x+objBall.r - objP.x) / objP.w * 2 - 1;
    if (index < -0.7) index = -0.7
    else if (index > 0.7) index = 0.7;
    //console.log(index);
    return index;
}




function playerMove(e) {
    let clientX;
    if (e.type == 'touchmove') clientX = e.touches[0].clientX
    else clientX = e.clientX;

    if (clientX < canvas.offsetLeft + player.w/2) player.x = 0
    else if (clientX > canvas.offsetLeft + canvas.width - player.w/2) player.x = canvas.width - player.w
    else player.x = clientX - canvas.offsetLeft - player.w/2;
    update();
}