
const canvas = document.getElementById("game-canvas");

let gameOfLIfe = null;

const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const speedButton = document.getElementById("speed");
const tileButton  = document.getElementById("tile")

if (canvas) {
	const options = {
		
	}

	const main = canvas.parentElement;
	const { scrollWidth, scrollHeight } = main;
	canvas.width = scrollWidth - 16;
	canvas.height = scrollHeight - 16;

	gameOfLIfe = new GameOfLife(canvas, options);

	startButton.addEventListener("click", () => {
		switch (gameOfLIfe.gameState) {
			case "waiting":
				gameOfLIfe.start();
				startButton.textContent = "pause";
				break;
			case "paused":
				gameOfLIfe.start();
				startButton.textContent = "pause";
				break;
			case "continue":
				gameOfLIfe.pause();
				startButton.textContent = "remain";
				break;
			default:
				console.error("gameState not handled by startButton:", gameOfLIfe.gameState);
		}

	});

	resetButton.addEventListener("click", async () => {
		gameOfLIfe.stop();
		startButton.textContent = "start";
	});

	speedButton.addEventListener("click", () => {
		const speeds = [
			"slow",
			"normal",
			"fast",
			"very fast"
		]

		gameOfLIfe.speed = (gameOfLIfe.speed + 1) % gameOfLIfe.speedMax;
		speedButton.textContent = `Speed: ${speeds[gameOfLIfe.speed]}`;
	});

	tileButton.addEventListener("click", () => {
		const sizes = [
			"small",
			"normal",
			"big"
		]

		const newSize = gameOfLIfe.changeTileSize();
		tileButton.textContent = `Tile size: ${sizes[newSize]}`;
	});
}

