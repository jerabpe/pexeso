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

function time2Str(time){
    if(time > 60){
        return `${Math.floor(time/60)} min ${time%60} s`;
    } else {
        return `${time} s`;
    }
}

class Page {
    constructor({key, pageEl}){
        this.key = key;
        this.pageElement = pageEl;
    }

    showPage(){
        this.pageElement.style.display = 'flex';
    }

    hidePage(){
        this.pageElement.style.display = 'none';
    }
}

class Game extends Page {
    constructor(size){
        super({key: 'game', pageEl: document.querySelector('#game')});
        this.counterEl = document.querySelector("#gameTime");
        this.movesEl = document.querySelector("#movesCounter");
        this.board = document.querySelector("#gameboard");
        this.menu = document.querySelector('#menu');
        this.timer = 0;
        this.size = size%2 == 0 ? size : size+1;
        this.moveCounter = 0;
        this.gameStarted = false;
        this.timerLoop = null;
        this.items = null;
        this.flipped = [];
        this.found = 0;
        this.tiles = null;
        this.continueGameButton = null;
        this.winEl = document.querySelector('#win');
        this.wonTextEl = document.querySelector('#wonText');
        this.nameInput = document.querySelector('#name');
        this.saveScoreButton = document.querySelector('#saveScoreButton');
        this.scoreForm = document.querySelector('#scoreForm');
        this.saveScoreButton.addEventListener('click', e => {
            if(this.validateInput(this.nameInput.value)){
                this.saveScore();
                this.hideNameInput();
            }
        });
        this.nameInput.addEventListener('keyup', e => {
            if(e.key == 'Enter'){
                e.preventDefault();
                if(this.validateInput(this.nameInput.value)){
                    this.saveScore();
                    this.hideNameInput();
                }
            }
        });
    }

    saveScore(){
        const nameInput = this.nameInput.value;
        const score = new Score(nameInput, this.timer, this.moveCounter);
        window.localStorage.setItem(JSON.stringify(score), '');
    }

    validateInput(input){
        if(input.length < 3 || input.length > 20){
            alert("Name has to be 3-20 characters long.");
            return false;
        }
        return true;
    }

    hideNameInput(){
        this.scoreForm.style.visibility = 'hidden';
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
        this.hideNameInput();
    }

    pauseGame(button){
        if(this.timerLoop){
            clearInterval(this.timerLoop);
            this.timerLoop = null;
        }
    }

    continueGame(button){
        if(!this.timerLoop){
            this.timerLoop = setInterval(this.incrementTimer, 1000, this);
        }
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
        this.hidePage();
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
            this.scoreForm.style.visibility = 'visible';
            const timeStr = this.timer >= 60 ? `${Math.floor(game.timer/60)} min ${game.timer%60} s`: `${this.timer} s`;
            this.wonTextEl.innerText = `You won with ${this.moveCounter} moves in ${timeStr}`;
            this.board.style.filter = 'blur(2px)';
            this.nameInput.focus();
        }, 1500);
    }

    incrementTimer(game){
        game.timer++;
        if(game.timer > 60){
            game.counterEl.innerHTML = `Time: ${Math.floor(game.timer/60)} min ${game.timer%60} s`;
        } else {
            game.counterEl.innerText = `Time: ${game.timer} s`;
        }
    }

    hidePage(){
        super.hidePage();
        if(this.gameStarted){
            this.pauseGame();
        }
    }

    showPage(){
        super.showPage();
        if(this.gameStarted){
            this.continueGame();
        }
        const continueButton = document.querySelector('#continueGameButton');
        if(!continueButton.attributes.getNamedItem('hidden')){
            continueButton.setAttribute('hidden', '');
        }
    }
}

class Score {
    constructor(name, time, moves){
        this.name = name;
        this.time = time;
        this.moves = moves;
    }
}

class Scoreboard extends Page {
    constructor(){
        super({key: 'score', pageEl: document.querySelector('#scoreboard')});
        this.table = null;
        this.storage = window.localStorage;
    }

    render(){
        this.pageElement.innerHTML = '';
        this.pageElement.style.display = 'flex';
        this.table = document.createElement('table');
        this.table.id = 'scoreTable';
        const caption = document.createElement('caption');
        caption.innerText = 'Top 10 scores';
        this.table.append(caption);
        const thead = this.table.insertRow();
        thead.innerHTML = '<tr><th>Position</th><th>Name</th><th>Moves</th><th>Time</th></tr>';
        this.table.append(thead);
        const keys = Object.keys(window.localStorage);
        const scores = [];
        for(let s of keys){
            scores.push(JSON.parse(s));

        }
        scores.sort((a,b) => {
            if(a.moves == b.moves){
                return a.time - b.time;
            } else {
                return a.moves - b.moves;
            }
        });
        for(let i=0; i<10; i++){
            const tr = this.table.insertRow();
            let name = '';
            let moves = '';
            let time = '';
            if(i<scores.length){
                name = scores[i].name;
                moves = scores[i].moves;
                time = time2Str(scores[i].time);
            }
            tr.innerHTML = `<td>${i+1}.</td>
                            <td>${name}</td>
                            <td>${moves}</td>
                            <td>${time}</td>`;
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
        this.pageElement.append(this.table);
    }

    hidePage(){
        super.hidePage();
        this.pageElement.innerHTML = '';
    }

    showPage(){
        super.showPage();
        this.render();
    }
}

class Router {
    constructor({pages, defaultPage}){
        this.pages = pages;
        this.defaultPage = defaultPage;
        this.currentPage = null;
        
        this.route(window.location.href);

        window.addEventListener('popstate', e => {
            this.route(window.location.href);
        });

        // window.addEventListener('click', e => { //TODO change this to menu button listeners
        //     const element = e.target;
        //     if(element.nodeName === 'A'){
        //         e.preventDefault();
        //         this.route(element.href);
        //         window.history.pushState(null, null, element.href);
        //     }
        // });
    }

    route(urlStr){
        // console.log(urlStr);
        const url = new URL(urlStr);
        // console.log(url);
        const page = url.searchParams.get('page');

        if(this.currentPage){
            this.currentPage.hidePage();
        }

        // const page404 = this.pages.find(p => p.key === '404');
        const pageInstanceMatched = this.pages.find(p => p.key === (page ?? this.defaultPage));
        const currentPage = pageInstanceMatched ?? page404;

        this.currentPage = currentPage;
        this.currentPage.showPage();
    }
}

const scoreboard = new Scoreboard();
const game = new Game(6);
game.createGame();

const router = new Router({
    pages: [
        game, scoreboard
    ],
    defaultPage: 'game'
});

const newGameButton = document.querySelector("#newGameButton");
newGameButton.addEventListener('click', e => {
    e.preventDefault();
    if(game.gameStarted){
        if(confirm("You are in the middle of a game, are you sure you want to start a new one?")){
            game.createGame();
            router.route(e.target.href);
            window.history.pushState(null, null, e.target.href);
        }
    } else {
        game.createGame();
        router.route(e.target.href);
        window.history.pushState(null, null, e.target.href);
    }
});
const scoreBoardButton = document.querySelector('#scoreboardButton');
scoreBoardButton.addEventListener('click', e => {
    if(game.gameStarted){
        continueGameButton.style.display = 'block';
    }
    e.preventDefault();
    router.route(e.target.href);
    window.history.pushState(null, null, e.target.href);
});

const continueGameButton = document.querySelector('#continueGameButton');
continueGameButton.addEventListener('click', e => {
    continueGameButton.style.display = 'none';
    e.preventDefault();
    router.route(e.target.href);
    window.history.pushState(null, null, e.target.href);
});

const playAgainButton = document.querySelector('#playAgainButton');
playAgainButton.addEventListener('click', e => game.createGame());

const winScoreBoardButton = document.querySelector('#winScoreBoardButton');
winScoreBoardButton.addEventListener('click', e => {
    //TODO
    game.hidePage();
    scoreboard.showPage();
});
