const fs = require("fs");
const https = require("https");
const process = require("child_process");
const readline = require("readline");
const path = require("path");
const os = require("os");
const util = require("util");


// ---- node functions ----
const execPromise = util.promisify(process.exec);


// ---- version ----
const version = "1.0.0";


// ---- global constantes ----
const intervals = [];
const { color, sysConsole, errConsole, okConsole, logConsole } = require("./src/functions/console");

logConsole("test")
// ---- start ----
