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
        this.newGameButton = document.querySelector("#newGameButton");
        newGameButton.addEventListener('click', e => {
            if(this.gameStarted){
                alert("really wanna do it?"); //TODO nice dialog
                this.createGame();
            } else {
                this.createGame();
            }
        });
        this.winEl = document.querySelector('#win');
        document.querySelector('#playAgainButton').addEventListener('click', e => this.createGame());
    }

    clearGame(){
        this.board.innerHTML = ''; //delete tiles
        this.winEl.style.visibility = 'hidden';
        this.board.style.filter = '';
        this.counterEl.innerText = 'time: 0 s';
        this.timer = 0;
        this.moveCounter = 0;
        this.flipped = [];
        this.tiles = [];
        this.found = 0;
    }

    createGame(){
        this.clearGame();
        console.log(this);
        //reset counters
        // this.stopGame();
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
        game.movesEl.innerHTML = `moves: ${game.moveCounter}`;
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

    showAllTiles(){
        
    }

    stopGame(){
        this.gameStarted = false;
        clearInterval(this.timerLoop);
        this.found = 0;
        if(this.tiles){
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
                this.board.style.filter = 'blur(2px)';
            }, 1500);
        }
    }

    incrementTimer(game){
        game.timer++;
        if(game.timer > 60){
            game.counterEl.innerHTML = `time: ${Math.floor(game.timer/60)} min ${game.timer%60} s`;
        } else {
            game.counterEl.innerText = `time: ${game.timer} s`;
        }
    }
}

class Scoreboard {
    constructor(){
        //todo
    }
}

const game = new Game(2);
game.createGame();

