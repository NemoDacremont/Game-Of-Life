
const express = require("express");
const path = require("path");

const server = express();

server.use("/", express.static("../src/"));




const port = process.env.PORT | 8080;

server.listen(port, () => {
	console.log("The server is listenning on port", port);
});
