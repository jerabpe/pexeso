const emLB = 127813;
const emUB = 127867;

function generateEmojis(size){
    arr = [];
    while(arr.length < (size*size/2)){
        const e = Math.floor(Math.random() * (emUB-emLB));
        if(arr.indexOf(e) === -1){
            arr.push(e);
        }
    }
    for(let i=0; i<(size*size/2); i++){
        arr[i] = `&#${emLB+arr[i]};`
    }
    return arr;
}

class Game {
    constructor(size){
        this.counterEl = document.querySelector("#gameTime");
        this.movesEl = document.querySelector("#movesCounter");
        this.board = document.querySelector("#gameboard");
        this.timer = 0;
        this.size = size%2 == 0 ? size : size+1;
        this.moveCounter = 0;
        this.gameStarted = false;
        this.timerLoop = null;
        this.items = null;
        this.flipped = [];
        this.found = 0;
        this.tiles = null;
        this.winEl = document.querySelector('#win');
        document.querySelector('#playAgainButton').addEventListener('click', e => this.createGame());
        this.wonTextEl = document.querySelector('#wonText');
        this.nameInput = document.querySelector('#name');
        this.gameEl = document.querySelector('#game');
    }

    clearGame(){
        if(this.timerLoop){
            clearInterval(this.timerLoop);
        }
        this.board.innerHTML = ''; //delete tiles
        this.winEl.style.visibility = 'hidden';
        this.board.style.filter = '';
        this.counterEl.innerText = 'Time: 0 s';
        this.movesEl.innerText = 'Moves: 0';
        this.timer = 0;
        this.moveCounter = 0;
        this.flipped = [];
        this.tiles = [];
        this.found = 0;
        this.gameStarted = false;
    }

    createGame(){
        this.clearGame();
        let pics = generateEmojis(this.size); //choose random emojis from range emLB,emUB
        pics = pics.concat(pics); //double the array -> every emoji is there twice
        //shuffle array
        pics = pics
            .map(value => ({value, sort: Math.random() }))
            .sort((a,b) => a.sort - b.sort)
            .map(({value}) => value);
        // create tiles
        for(let i=0; i<this.size; i++){
            for(let j=0; j<this.size; j++){
                const tile = document.createElement('div');
                const innerTile = document.createElement('div');
                innerTile.classList.add('inner-tile');
                const tilefront = document.createElement('div');
                const tileback = document.createElement('div');
                tilefront.classList.add('tile-front');
                tileback.classList.add('tile-back');
                tileback.innerHTML = pics[i*this.size+j];
                innerTile.append(tilefront);
                innerTile.append(tileback);
                tile.classList.add('tile');
                tile.setAttribute('data-row', i);
                tile.setAttribute('data-col', j);
                tile.addEventListener('click', e => this.tileClickHandler(e, this));
                tile.append(innerTile);
                this.board.append(tile);
                this.tiles.push(tile);
            }
        }
        this.items = pics;
    }

    tileClickHandler(e, game){
        if(!game.gameStarted){
            game.timerLoop = setInterval(game.incrementTimer, 1000, game);
            game.gameStarted = true;
        }
        game.moveCounter++;
        game.movesEl.innerHTML = `Moves: ${game.moveCounter}`;
        const tile =  e.currentTarget;
        if(!tile.classList.contains('flipped')){
            tile.classList.add('flipped');
            game.flipped.push(tile);
        } else {
            tile.classList.remove('flipped');
            const idx = game.flipped.indexOf(tile);
            game.flipped.splice(idx,1);
        }

        if(game.flipped.length >= 2){
            this.checkPair(game.flipped[0], game.flipped[1]);
        }
        
    }

    checkPair(tileA, tileB){
        const itemA = this.items[Number(tileA.dataset.row) * this.size + Number(tileA.dataset.col)];
        const itemB = this.items[Number(tileB.dataset.row) * this.size + Number(tileB.dataset.col)];
        if(itemA == itemB){
            this.found += 2;
            if(this.found == this.size*this.size){
                //konec hry
                //show all pictures
                //show text
                //play sound
                //save score
                this.stopGame();
            }
            setTimeout(() => this.removeTiles(tileA, tileB), 1000);
        } else {
            setTimeout(() => {
                tileA.classList.remove('flipped');
                tileB.classList.remove('flipped');
            }, 1000); 
        }
        this.flipped = [];
        
    }

    removeTiles(tileA, tileB){
        tileA.style.visibility = 'hidden';
        tileB.style.visibility = 'hidden';
    }

    stopGame(){
        this.gameStarted = false;
        clearInterval(this.timerLoop);
        this.found = 0;
        if(this.tiles){
            const audio = new Audio();
            audio.src = 'assets/success-fanfare-trumpets.mp3';
            audio.play();
            setTimeout(() => {
                for(const t of this.tiles){
                    t.style.visibility = 'visible';
                    t.classList.remove('flipped');
                }
            }, 1100);
            setTimeout(() => {
                for(const t of this.tiles){
                    t.classList.add('flipped');
                }
                this.winEl.style.visibility = 'visible';
                const timeStr = this.timer >= 60 ? `${Math.floor(game.timer/60)} min ${game.timer%60} s`: `${this.timer} s`;
                this.wonTextEl.innerText = `You won with ${this.moveCounter} moves in ${timeStr}`;
                this.board.style.filter = 'blur(2px)';
                this.nameInput.focus();
            }, 1500);
        }
    }

    incrementTimer(game){
        game.timer++;
        if(game.timer > 60){
            game.counterEl.innerHTML = `Time: ${Math.floor(game.timer/60)} min ${game.timer%60} s`;
        } else {
            game.counterEl.innerText = `Time: ${game.timer} s`;
        }
    }

    hide(){
        this.gameEl.style.display = 'none';
    }
}

class Score {
    constructor(name, time, moves){
        this.name = name;
        this.time = time;
        this.moves = moves;
    }

    time2Str(){
        if(time > 60){
            return `time: ${Math.floor(time/60)} min ${time%60} s`;
        } else {
            return `time: ${time} s`;
        }
    }
}

class Scoreboard {
    constructor(){
        //todo
        this.table = document.querySelector('#scoreTable');
        this.scoreboardEl = document.querySelector('#scoreboard');
    }

    show(){
        this.scoreboardEl.style.display = 'flex';
        for(let i=0; i<10; i++){
            const tr = this.table.insertRow();
            tr.innerHTML = `<td>${i+1}.</td>
                            <td>john</td>
                            <td></td>
                            <td></td>`;
            if(i == 0){
                tr.classList.add('first');
            }
            if(i==1){
                tr.classList.add('second');
            }
            if(i==2){
                tr.classList.add('third');
            }
        }
    }

    hide(){
        this.scoreboardEl.style.display = 'none';
    }
}

const game = new Game(2);
const scoreboard = new Scoreboard();
game.createGame();

const newGameButton = document.querySelector("#newGameButton");
newGameButton.addEventListener('click', e => {
    if(scoreboard.scoreboardEl.style.display != 'none'){
        scoreboard.scoreboardEl.style.display = 'none';
        game.gameEl.style.display = 'flex';
    }
    if(game.gameStarted){
        alert("really wanna do it?"); //TODO nice dialog
        game.createGame();
    } else {
        game.createGame();
    }
});
const scoreBoardButton = document.querySelector('#scoreboardButton');
scoreBoardButton.addEventListener('click', e => {
    game.hide();
    scoreboard.show();
});

