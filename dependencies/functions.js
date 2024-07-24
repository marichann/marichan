/*
*
*   dependences
* 
*   *   *
*/



const os = require('os');
const fs = require("fs");
const path = require("path");




/*
*
*   fonctions console 
* 
*   *   *
*/


function redLog(y){
    console.log(`${time().hour} |${colors.red}-${colors.white}| ${y}`);
}
async function textToAscii(text, font) {
    const figlet = require("figlet");
    return new Promise((resolve, reject) => {
        figlet.text(
            text,
            {
                font: font,
                horizontalLayout: "default",
                verticalLayout: "default",
                width: 80,
                whitespaceBreak: true,
            },
            (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            }
        );
    });
}



/*
*
*   fonctions discord 
* 
*   *   *
*/


async function userFetch(id) {
    const fetch = (await import('node-fetch')).default;
    const config = require(path.resolve(__dirname, "../dependencies/config.json"));
    const response = await fetch("https://discord.com/api/v9/users/" + id, {
        method: "GET",
        headers: {
            "authorization": config.token,
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}
async function discordAuth(email, password, code = null) {
    const fetch = (await import('node-fetch')).default;
    let postData = {
        email: email,
        password: password,
        undelete: false,
        captcha_key: null,
        login_source: null,
        gift_code_sku_id: null
    };
    let path = '/api/v8/auth/login';

    if (code) {
        postData.code = code;
        path = '/api/v8/auth/login/two-factor';
    }
    const url = `https://discord.com${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'x-fingerprint': '715952977180885042.yskHI7mK4iZWhTX7iXlXIcDovRc',
        'x-super-properties': Buffer.from(JSON.stringify({
            os: 'Windows',
            browser: 'Chrome',
            device: '',
            browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
            browser_version: '83.0.4103.61',
            os_version: '10',
            referring_domain: 'discord.com',
            referrer_current: '',
            referring_domain_current: '',
            release_channel: 'stable',
            client_build_number: 60856,
            client_event_source: null
        }), 'utf-8').toString('base64'),
        'cookie': '__cfduid=d638ccef388c4ca5a94c97c547c7f0d9e1598555308; __cfruid=4d17c1a957fba3c0a08c74ea83114af675f7ef19-1598796039;'
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(postData)
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            return data.message;
        }
    } catch (error) {
        return error;
    }
}
function discolors(x = "0", y = "0"){
    if(x == "0" && y == "0")
        return "\u001b[0m";
    return "\u001b["+y+";"+x+"m";
}



// 0 :  Normal
// 1 :  Gras
// 4 :  Souligner
// 30 : Gris
// 31 : Rouge
// 32 : Vert
// 33 : Jaune
// 34 : Bleu
// 35 : Rose
// 36 : Cyan
// 37 : Blanc



/*
*
*   fonctions console 
* 
*   *   *
*/



function plaform(platform) {
    switch (platform) {
        case 'aix':
            return 'AIX';
        case 'darwin':
            return 'macOS';
        case 'freebsd':
            return 'FreeBSD';
        case 'linux':
            return 'Linux';
        case 'openbsd':
            return 'OpenBSD';
        case 'sunos':
            return 'SunOS';
        case 'win32':
            return 'Windows';
        default:
            return 'Unknown';
    }
}
async function sizedir(dir) {
    let size = 0;

    // Lire les fichiers et répertoires dans le répertoire courant
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isFile()) {
            // Ajouter la taille du fichier
            size += stats.size;
        } else if (stats.isDirectory()) {
            // Ajouter la taille des fichiers dans le sous-répertoire
            size += await sizedir(filePath);
        }
    }

    return size;
}
async function osinfo(dir){
    const size = await sizedir(dir);
    const files = await fs.promises.readdir(dir);
    return {
        filesNumber: (files.length),
        dirSize: (size/(1024**2)).toFixed(2),
        osPlatform: plaform(os.platform()),
        totalMemory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)}`,
        freeMemory: `${(os.freemem() / (1024 ** 3)).toFixed(2)}`
    }
}

module.exports = {
    textToAscii,
    discordAuth,
    discolors,
    osinfo,
    userFetch
}