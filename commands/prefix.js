const fs = require("fs");
module.exports = {
    name: "prefix",
    category: "util",
    description: ["Display and set prefix.", "ex:", "prefix", "prefix /"],
    help: "prefix (new prefix)",
    execute(p){
        const { discolors, config, msg, args, redLog, fetchFile } = p;
        console.log(config)
        if(!args[0]){
            msg.edit(
                "```ansi\n"
                +"Prefix: "
                +discolors("34","1")+config.prefix+discolors()
                +"```");
        } else if(args[0]){
            config.prefix = args[0];
            fs.writeFile(fetchFile("dependencies/config.json"), JSON.stringify(config, null, 2), (err) => {
                if (err) redLog("file error: "+err);
            })
            msg.edit(
                "```ansi\n"
                +"Prefix has been modified ("+discolors("32","1")+config.prefix+discolors()+")!"
                +"```");
        }
    }
}