process.emitWarning = (warning, type) => {
    if (type === 'DeprecationWarning') {
        return;
    }
    console.warn(warning);
};



/*
*
*   variables
*
*   *   *
*/



let githubfiles = false;
let filechecked = false;
let modulechecked = false;


/*
*
*   dépendances
*
*   *   *
*/



const fs = require("fs");
const https = require("https");
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');
const os = require("os");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    prompt: ''
});



/*
*
*   bibliothèques
* 
*   *   *
*/



const colors = {
    "white": "\x1b[0m",
    "red": "\x1b[31m",
    "green": "\x1b[32m",
    "yellow": "\x1b[33m",
    "blue": "\x1b[34m",
    "pink": "\x1b[35m",
    "cyan": "\x1b[36m",
    "grey": "\x1b[90m",
    "brightred": "\x1b[91m",
    "brightgreen": "\x1b[92m",
    "brightyellow": "\x1b[93m",
    "brightblue": "\x1b[94m",
    "brightpink": "\x1b[95m",
    "brightcyan": "\x1b[96m"
};



/*
*
*   requetes github
* 
*   *   *
*/



function github(url){
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            if(response.statusCode >= 300 && response.statusCode < 400 && response.headers.location){
                https.get(url+"/"+response.headers.location, (res) => {
                    if(res.statusCode == 200){
                        res.on("data", (chunck) => data += chunck);
                        res.on("end", () => resolve(data));
                    } else
                        reject(new Error(res.statusCode+": "+res.statusMessage));
                }).on("error", reject);
            } else if(response.statusCode == 200){
                response.on("data", (chunck) => data += chunck);
                response.on("end", () => resolve(data));
            } else
            reject(new Error(response.statusCode+": "+response.statusMessage));
       }).on("error", reject);
    })
}



/*
*
*   fonctions console 
* 
*   *   *
*/



function time() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let dd = now.getDate();
    let mm = now.getMonth() + 1;
    let yy = now.getFullYear() % 100;

    dd = dd < 10 ? "0" + dd : dd;
    mm = mm < 10 ? "0" + mm : mm;
    yy = yy < 10 ? "0" + yy : yy;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    const time = {
        date: dd+"/"+mm+"/"+yy,
        hour: h+":"+m+":"+s
    }
    return time;
}
function consoleClear(){
    process.stdout.write("\033c");
}
function randomColor() {
    // Convertir l'objet en tableau d'entrées
    const filteredColors = Object.entries(colors).filter(([key, value]) => key !== "white");
    
    // Sélectionner une entrée au hasard
    const index = Math.floor(Math.random() * filteredColors.length);
    const [key, value] = filteredColors[index];
    
    // Retourner la valeur de la couleur sélectionnée
    return value;
}
function blueLog(y){
    console.log(`${time().hour} |${colors.blue}*${colors.white}| ${y}`);
}
function greenLog(y){
    console.log(`${time().hour} |${colors.green}+${colors.white}| ${y}`);
}
function redLog(y){
    console.log(`${time().hour} |${colors.red}-${colors.white}| ${y}`);
}
function yellowLog(y){
    console.log(`${time().hour} |${colors.yellow}/${colors.white}| ${y}`);
}
function pinkLog(y){
    console.log(`${time().hour} |${colors.pink}o${colors.white}| ${y}`);
}
function clearLine(x){
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    for (let i = 1; i < x; i++){
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);
    }
}
function getCursor() {
    return new Promise((resolve) => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        let buffer = '';

        const onData = (data) => {
            buffer += data;
            if (buffer.includes('R')) {
                process.stdin.pause();
                process.stdin.setRawMode(false);
                process.stdin.removeListener('data', onData);
                const match = /\[(\d+);(\d+)R/.exec(buffer);
                if (match) {
                    const [, row] = match;
                    resolve(parseInt(row, 10));
                }
            }
        };
        process.stdin.on('data', onData);
        process.stdout.write('\u001b[6n');
    });
}
const updateline = (line, text) => {
    process.stdout.write('\u001b[s');
    process.stdout.write(`\u001b[${line};0H`);
    readline.clearLine(process.stdout, 1);
    process.stdout.write(text);
    process.stdout.write('\u001b[u');
};
const loading = (x, y, z) => {
    let currentline = 0;
    let currentSymbolIndex = 0;
    const symbols = ['/', '-', '\\', '|'];
    let messages = [
        x + ".",
        x + "..",
        x + "..."
    ].map(m => time().hour + " |" + colors.blue + "*" + colors.white + "| " + m);

    const updateInterval = setInterval(() => {
        const symbol = symbols[currentSymbolIndex];
        const messageWithSymbol = messages[currentline].replace('*', symbol);
        updateline(z, messageWithSymbol);
        currentline = (currentline + 1) % messages.length;
        currentSymbolIndex = (currentSymbolIndex + 1) % symbols.length;
    }, y);
    return updateInterval;
};



/*
*
*   fonctions systeme
* 
*   *   *
*/



async function restart(client){
    yellowLog("Restart.");
    captureLogsEnabled = false;
    rl.close();
    await client.destroy();
    await client.commands.clear();
    const cheminIndex = process.argv[1];
    const args = process.argv.slice(2);
    const nouveauProcessus = spawn('node', [cheminIndex, ...args], {
        stdio: 'inherit' 
    });
    nouveauProcessus.on('close', (code) => {
        process.exit(code);
    });
}
async function reset(folderPath, exclude) {
    try {
        const files = await fs.promises.readdir(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (exclude.includes(filePath)) continue;

            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                await reset(filePath, exclude);
                await fs.promises.rmdir(filePath);
            } else {
                await fs.promises.unlink(filePath);
            }
        }
    } catch (err) {
        redLog(`Error: ${err}`);
    }
}




/*
*
*   panel
* 
*   *   *
*/



async function panel(color, x, client, config){
    const { osinfo, textToAscii } = require("./dependencies/functions");
    const fetch = (await import("node-fetch")).default;
    const asciistart = await textToAscii("THE ROOM", "slant");
    const asciisplited = asciistart.split("\n");
    function spaces(x, y){
        return " ".repeat(Math.round((x-y)/2));
    }
    const asciifinal = asciisplited.map(a => spaces(x, a.length)+a).join("\n");
    const options = "[1] config    [2] restart    [3] shutdown    [4] reset    [0] clear";
    const dir = path.resolve(__dirname, "./");
    
    
    async function display(){
        captureLogs = false;
        const length = ((await osinfo(dir)).dirSize+"MB | "+(await osinfo(dir)).osPlatform+" | "+(await osinfo(dir)).freeMemory+"GO/"+((await osinfo(dir)).totalMemory)).length;
        const texts = [
            client.user.username+colors.white,
            (await osinfo(dir)).dirSize+colors.white+"MB | "+color+(await osinfo(dir)).osPlatform+colors.white+" | "+color+(await osinfo(dir)).freeMemory+colors.white+"GO/"+color+((await osinfo(dir)).totalMemory)+colors.white+"GO",
            client.commands.size+colors.white+" command"+(client.commands.size>1?"s":"")+" | "+color+config.prefix+colors.white+"\n"
        ]
        console.log(color+asciifinal+colors.white);
        console.log(" ".repeat((x-16)/2)+"* By Mari-chan *\n\n");
        for(t of texts)
            console.log(" ".repeat(Math.round((x-texts[2].length)/2))+"|"+color+"+"+colors.white+"| "+color+t);
        console.log(" ".repeat((x-options.length)/2)+options.replace(/(\d)/g, `${color}$1${colors.white}`));
        console.log("▂".repeat(x)+"\n");
        blueLog(color+"Logs"+colors.white+":\n");
        captureLogs = true;
    }
    await display();
    rl.on("line", input => {
        let i = input.split(" ");
        let j = i[0];
        if(j === "1" || j === "config"){
            if(i[1] === "prefix"){
                if(i[2]){
                    config.prefix = i[2];
                    fs.writeFile("./dependencies/config.json", JSON.stringify(config, null, 2), (err) => {
                        if (err) redLog("File error: "+err);
                    })
                    restart(client);
                } else
                    pinkLog("Prefix: "+color+config.prefix);
            } else if(i[1] === "color"){
                if(i[2]){
                    config.color = i[2];
                    fs.writeFile("./dependencies/config.json", JSON.stringify(config, null, 2), (err) => {
                        if (err) redLog("File error: "+err);
                    })
                    restart(client);
                } else
                pinkLog("Color: "+color+(config.color?config.color:"random")+colors.white+"\n"+" ".repeat(13)+"Available colors: "+Object.keys(colors).map(k => color+k+colors.white).join(", ")+", "+color+"random"+colors.white+".");
            } else if(i[1] === "token"){
                if(i[2]){
                    fetch("https://discord.com/api/v9/users/@me", {
                        method: "GET",
                        headers: {
                        "authorization": i[2],
                        "Content-Type": "application/json"
                        }
                        
                    }).then(response => {
                        return response.json();
                    }).then(res => {
                        if (!res.message) {
                            restart(client);
                        } else {
                            redLog("Invalid token ("+color+i[2]+colors.white+"): "+colors.red+res.message+colors.white);
                        }
                    }).catch(err => {
                        redLog("Error: "+err.message);
                    })
                } else
                pinkLog("Token: "+color+config.token.substring(0, 30)+"..."+colors.white);
            } else
            pinkLog(color+"config [object] [value]"+colors.white+". Exemple: "+color+"config prefix /"+colors.white+"\n"+" ".repeat(13)+"Available config: "+color+Object.keys(config).map(k => color+k+colors.white).join(", ")+".");
        } else if(j === "2" || j === "restart"){
            restart(client);
            consoleClear();
        } else if(j === "3" || j === "shutdown"){
            process.exit();
        } else if(j === "4" || j === "reset"){
            rl.question("Sure? (y/n):", async r => {
                if (r === "y"){
                    const line = await getCursor();
                    const resetinterval = loading("Resetting", 200, line);
                    const dir = path.dirname(__filename);
                    const exclude = [__filename, path.resolve(dir, 'start.bat')];
                    reset(dir, exclude).then(() => {
                        clearInterval(resetinterval);
                        restart(client);
                    });
                }
            })
        } else if(j === "0" || j === "clear"){
            consoleClear();
            display(color, x, client, config)
        }
    })
}



/*
*
*   START CODE
* 
*   *   *
*/


consoleClear();
let startinterval = loading('Starting', 200, 0);




/*
*
*   check
* 
*   *   *
*/



async function checkmodules(x){
    const errormodules = [];
    for (const mod of x){
        try {
            require.resolve(mod.name);
        } catch (err){
            errormodules.push(mod);
        }
    }
    return errormodules;
}
async function checkfiles(x){
    let downloadfiles = [];
    for (const file of x){
        let fileHandle;
        try{
            fileHandle = await fs.promises.open("./"+file, 'r');
        } catch (err){
            downloadfiles.push(file);
        } finally {
            if(fileHandle){
                await fileHandle.close();
            }
        }
    }
    return downloadfiles;
}
async function readFiles(dir, excludedFiles, excludedDirs) {
    let results = [];

    async function readDir(currentDir) {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (!excludedDirs.includes(entry.name)) {
                    await readDir(fullPath);
                }
            } else {
                if (!excludedFiles.includes(entry.name)) {
                    results.push(fullPath);
                }
            }
        }
    }

    await readDir(dir);
    return results;
}
async function fileExist(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}


/*
*
*   install
* 
*   *   *
*/



async function installmodules(x){
    let errormodules = [];
    for (const f of x){
        try {
            const { stdout, stderr } = await execPromise("npm install "+f.name+"@"+f.version + " --unsafe-perm");
        } catch (err){
            redLog("Module "+colors.red+f.name+colors.white+": "+err);
            errormodules.push(f.name);
        }
    }
    return errormodules;
}
async function installfiles(files) {
    const errorfiles = [];

    for (const file of files) {
        try {
            const dir = path.dirname(file);
            if (dir !== '.') {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            const content = await github("https://raw.githubusercontent.com/marichann/marichan/main/" + file);
            await fs.promises.writeFile(file, content, 'utf8');
        } catch (err) {
            console.error(`File ${colors.red}${file}${colors.white}: ${err}`);
            errorfiles.push(file);
        }
    }

    return errorfiles;
}



/*
*
*   étapes
* 
*   *   *
*/



async function modulestep(){
    let modules = Object.keys(require("./package.json").dependencies).map(key => {
        return {
            name: key,
            version: require("./package.json").dependencies[key]
        };
    });
    let todl = await checkmodules(modules);
    if(todl.length > 0){
        clearInterval(startinterval);
        yellowLog(colors.red+(modules.length-todl.length)+"/"+modules.length+colors.white+" module"+(modules.length-todl.length>1?"s":"")+" installed.");
        let modinterval = loading("Installing", 200, 0);
        let error = await installmodules(todl);
        if(error.length > 0)
            redLog("Failed to install "+colors.red+error.length+"/"+todl.length+colors.white+" module"+(error.length>1?"s":"")+".");
        else
            greenLog(colors.green+todl.length+"/"+todl.length+colors.white+" module"+(todl.length>1?"s":"")+" installed!");
        clearInterval(modinterval);
        modulechecked = true;
    } else {
        clearLine(2);
        greenLog(colors.green+modules.length+"/"+modules.length+colors.white+" module"+(modules.length>1?"s":"")+" installed!");
        modulechecked = true;
    }
}
async function filestep(){
    let files = JSON.parse(await github("https://raw.githubusercontent.com/marichann/marichan/main/dependencies/files.json"));
    let todl = await checkfiles(files);
    if(todl.length > 0){
        clearInterval(startinterval);
        const filtred = await readFiles("./", ["index.js"], ["node_modules"]);
        yellowLog(colors.red+filtred.length+"/"+files.length+colors.white+" file"+(filtred.length>1?"s":"")+" installed.");
        let fileinterval = loading("Installing", 200, 0);
        let error = await installfiles(todl);
        setTimeout(async () => {
            clearInterval(fileinterval);
            if(error.length > 0)
                redLog("Failed to install "+colors.red+error.length+"/"+todl.length+colors.white+" file"+(error.length>1?"s":"")+".");
            else
                greenLog(colors.green+todl.length+"/"+todl.length+colors.white+" file"+(todl.length>1?"s":"")+" installed!");
            filechecked = true;
            setTimeout(() => {
                modulestep();
            }, 1000)
        }, 1000);
    } else {
        greenLog(colors.green+files.length+"/"+files.length+colors.white+" file"+(files.length>1?"s":"")+" installed!");
        filechecked = true;
        setTimeout(() => {
            modulestep();
        }, 1000)
    }
}



/*
*
*   handler
* 
*   *   *
*/



async function readcommands(client){
    const errors = [];
    try{
        const files = await fs.promises.readdir("./commands", { withFileTypes: true });
        files.forEach(f => {
            try {
                const mod = require("./commands/"+f.name);
                if(mod && typeof mod == 'object' && mod.name){
                    client.commands.set(mod.name, mod);
                }
            } catch(e){
                errors.push({cmd: f, error: e.stack.split("\n")[0]});
            }
        });
        githubfiles = false;
    } catch(e) {
        const files = JSON.parse(await github("https://raw.githubusercontent.com/marichann/marichan/main/dependencies/commands.json"));
        for (const f of files) {
            try {
                const script = await github("https://raw.githubusercontent.com/marichann/marichan/main/commands/"+f);
                const command = eval(script);
                client.commands.set(command.name, command);
            } catch (e){
                errors.push({cmd: f, error: e.stack.split("\n")[0]});
            }
        }
        githubfiles = true;
    }
    return errors;
}



/*
*
*   login
* 
*   *   *
*/



async function question(client){
    const config = require("./dependencies/config.json");
    const { discordAuth } = require("./dependencies/functions.js");
    redLog("No valid token.\n");
    rl.question('Email: ', (email) => {
        rl.question('Password: ', async (password) => {
            const response = await discordAuth(email, password);
            if (response.token){
                config.token = response.token;
                fs.writeFile('./dependencies/config.json', JSON.stringify(config, null, 2), (err) => {
                    if (err) redLog('ERROR',"File: "+err);
                })
                greenLog("Token successfully added.\n");
                client.login(response.token);
            } else if (response.message == 'A2F required'){
                rl.question('A2F code', async (a2f) => {
                    const a2fresponse = await discordAuth(email, password, a2f);
                    if (a2fresponse.token){
                        config.token = a2fresponse.token;
                        fs.writeFile('./dependencies/config.json', JSON.stringify(config, null, 2), (err) => {
                            if (err) redLog('ERROR',"File: "+err);
                        })
                        greenLog("Token successfully added.\n");
                        client.login(response.token);
                    } else{
                        redLog("Login failed: "+a2fresponse.message);
                        question(x);
                    }
                })
            } else{
                redLog("Login failed: "+response.message);
                question(x);
            }
        });

    });
}



/*
*
*   Discord login
* 
*   *   *
*/



function fetchFile(filepath){
    let filep = '';
    if(!githubfiles){
        filep = path.resolve(__dirname, "./"+filepath);
    } else {
        filep = "./"+filepath;
    }
    
    return filep;
}
const clientinterval = setInterval(async () => {
    if(!filechecked || !modulechecked)
        return;
    if(startinterval)
        clearInterval(startinterval);
    clearInterval(clientinterval);
    consoleClear();


    const loginclientinterval = loading("Login", 200, 0);
    const {textToAscii,discordAuth,discolors,osinfo, userFetch} = require("./dependencies/functions.js");
    const config = require(fetchFile("dependencies/config.json"));
    const Discord = require("discord.js-selfbot-v13");
    const client = new Discord.Client();
    client.commands = new Discord.Collection();
    const errors = await readcommands(client);
    const color = colors[config.color] ? colors[config.color] :randomColor();

    client.login(config.token).catch(() => question(client));
    client.on("ready", async () => {
        clearInterval(loginclientinterval);
        consoleClear();
        await panel(color, 100, client, config);
        if(errors.length > 0){
            for(e of errors)
                redLog("Command "+colors.red+e.cmd.name+colors.white+": "+e.error);
        }
    })

    client.on("shardDisconnect", () => {
        yellowLog("Client disconnected.");
    })
    client.on("shardReconnecting",async() => {
        blueLog("Attempting to reconnect.");
    })

    const globalParams = {
        client: client,
        redLog: redLog,
        blueLog: blueLog,
        greenLog: greenLog,
        yellowLog: yellowLog,
        loading: loading,
        time: time,
        github: github,
        osinfo: osinfo,
        discolors: discolors,
        colors: colors,
        color: color,
        userFetch: userFetch,
        fetchFile: fetchFile,
        config: config
    }

    client.on('message', async (msg) => {
        if(!msg.content.startsWith(config.prefix) || msg.author.username != client.user.username) return;
        
        const args = msg.content.split(' ').slice(1);
        const cmd = msg.content.split(' ')[0].replace(config.prefix, '');
        if(!client.commands.has(cmd)) return;
        try {
            client.commands.get(cmd).execute({ ...globalParams, msg, args });
        } catch (error){
            redLog(error);
        }
    })
}, 1000);
setTimeout(() => {
    console.log("\n");
    filestep();
}, 1000);


module.exports = {
    fetchFile
}