
const sleep = (ms) => new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve();
	}, ms);
});

/*
	--primary: #BF304A;
	--second: #80A7BF;
	--tertiary: #4D6F8C;
	--jsp: #86506B;
	--background: #DFEDF2;
	--text: #111C26;
	--header: #A9C6D9;
*/
const colors = {
	primary: 	'#bf304a',
	secondary: '#80A7BF',
	tertiary: '#4D6F8C',
	background: '#DFEDF2',
	black: '#111C26'
}

const defaultOptions = {
	defaultTileWidth: 25,
	tileWidth: 50,
	ctx: null,
	map: null,
	mouseDown: false,
	action: 0
}

let globalOptions = defaultOptions;

class GameOfLifeTile {
	constructor (x, y, state=0) {
		this.x = x;
		this.y = y;
		this.state = state;
	}

	countNeighbour () {
		let count = 0;

		for (let x=-1 ; x<=1 ; x++) {
			const X = this.x + x;
			if (X < 0 || X >= globalOptions.map.map.length) continue;

			for (let y=-1 ; y<=1 ; y++) {
				const Y = this.y + y;
				if (Y < 0 || Y >= globalOptions.map.map[X].length || (x===0 && y===0)) continue;

				if (globalOptions.map.map[X][Y].state === 1) count++;
			}
		}

		return count;
	}

	updateTile () {
		const neighbours = this.countNeighbour();
		let newState = 0;

		if (this.state && (neighbours === 2 || neighbours === 3)) newState = 1;
		else if (!this.state && neighbours === 3) newState = 1;

		return newState;
	}

	async draw () {
		const h = globalOptions.tileWidth;
		const w = globalOptions.tileWidth;
		const x = (this.x) * globalOptions.tileWidth;
		const y = (this.y) * globalOptions.tileWidth;
		const ctx = globalOptions.ctx;


		ctx.fillStyle = this.state ? colors.tertiary: colors.secondary;
		ctx.fillRect(x, y, w, h);

	}
}

class GameOfLifeMap {
	async resetMap () {
		this.w = Math.floor( globalOptions.canvas.offsetWidth / globalOptions.tileWidth );
		this.h = Math.floor( globalOptions.canvas.offsetHeight / globalOptions.tileWidth );

		//	+100 so that it shows offscreen aswell
		for (let x=0 ; x < this.w ; x++) {
			this.map[x] = [];
			for (let y=0 ; y < this.h ; y++) {
				this.map[x][y] = new GameOfLifeTile(x, y);
			}
		}
	}

	constructor (w, h) {
		this.w = w;
		this.h = h;

		this.map = [];
		this.newMap = [];

		this.resetMap();
	}

	async updateMap () {
		this.newMap = [];
		for (let x=0 ; x<this.w ; x++) {
			this.newMap[x] = [];
			for (let y=0 ; y<this.h ; y++) {
				this.newMap[x][y] = new GameOfLifeTile(x, y, this.map[x][y].updateTile());
			}
		}

		this.map = [...this.newMap];
	}

	async draw () {
		for (let x=0 ; x<this.w ; x++) {
			for (let y=0 ; y<this.h ; y++) {
				this.map[x][y].draw();
			}
		}
	}
}

class GameOfLife {
	constructor (canvas, options) {
		this.container = canvas;
		this.options = { ...defaultOptions, ...options };
		globalOptions = { ...defaultOptions, ...options };

		this.ctx = canvas.getContext("2d");
		globalOptions.ctx = this.ctx;
		globalOptions.canvas = canvas;

		/*
		 *	gameState
		 *		waiting
		 *		continue
		 *		paused
		 *
		 *
		*/
		this.gameState = 'waiting';
		this.speed = 1;
		this.speedMax = 4;

		this.tileSize = 1;
		this.tileSizes = 3;

		this.generation = 0;

		this.map = new GameOfLifeMap();
		globalOptions.map = this.map;
		this.draw();

		canvas.addEventListener("mousemove", (e) => {
			if (!globalOptions.mouseDown) return;

			const x = Math.floor(e.layerX / globalOptions.tileWidth);
			const y = Math.floor(e.layerY / globalOptions.tileWidth);

			globalOptions.map.map[x][y].state = globalOptions.action;
			globalOptions.map.map[x][y].draw();
		});

		canvas.addEventListener("mousedown", (e) => {
			const x = Math.floor(e.layerX / globalOptions.tileWidth);
			const y = Math.floor(e.layerY / globalOptions.tileWidth);
			globalOptions.action = globalOptions.map.map[x][y].state ? 0: 1;
			globalOptions.mouseDown = true;

			globalOptions.map.map[x][y].state = globalOptions.action;
			globalOptions.map.map[x][y].draw();
		});

		document.addEventListener("mouseup", () => {
			globalOptions.mouseDown = false;
		});
	}

	async draw () {
		/*
		globalOptions.ctx.fillStyle = colors.background;
		globalOptions.ctx.fillRect(0, 0, this.container.width, this.container.height);
		await sleep(500);*/
		await this.map.draw();
	}

	start () {
		this.gameState = "continue";
		this.update();
	}

	async update () {
		this.generation++;
		await this.map.updateMap();
		await this.draw();


		await sleep(Math.floor(1000 / (this.speed+1)));
		switch (this.gameState) {
			case 'continue':
				this.update();
				break;
			case 'paused':
				this.pause();
				break;
			default:
				console.error("gameState not handled:", this.gameState);
		}
	}

	pause () {
		this.gameState = "paused";
	}

	async stop () {
		this.gameState = "waiting";
		await gameOfLIfe.map.resetMap();
		await gameOfLIfe.draw();
		this.generation = 0;
	}

	changeTileSize () {
		this.tileSize = (this.tileSize + 1) % this.tileSizes;
		globalOptions.tileWidth = globalOptions.defaultTileWidth * (this.tileSize + 1);

		this.map.resetMap();
		this.draw();

		return this.tileSize;
	}
}
