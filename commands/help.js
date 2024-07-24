
module.exports = {
    name: "help",
    category: "util",
    description: ["Display help panel and help command's.", "ex:", "help", "help prefix"],
    help: "help (command)",
    execute(p){
        const {msg, discolors, client, config, args} = p;
        const commands = Array.from(client.commands.entries());
        function category(x){
            const filtred = commands
            .filter(([name, command]) => command.category === x)
            .map(([name, command]) => "`"+name+"`");
            return filtred;
        }
        if(!args[0]){
            msg.edit(
                "> ```ansi\n> "
                +discolors("34","1")+"HELP "+discolors()+"|"+discolors("34","1")+" The Room selfbot\n> "
                +discolors()+"By"+discolors("34","1")+" 🌼 Mari-chan"
                +"```\n> "
                +"Amount of commands: "+commands.length+"\n> "
                +"\n>   ***Utils:hammer_pick::***\n> "
                +"  "+category("util").join(", ")
                +"\n> \n> The Room | Type "+config.prefix+"help (command)"
            );
        } else if  (client.commands.get(args[0])){
            const command = client.commands.get(args[0]);
            let exfetch = false;
            msg.edit(
                "```ansi\n"
                +discolors("34","1")+"HELP "+command.name.toUpperCase()+discolors()+" |"+discolors("34","1")+" The Room selfbot"
                +discolors()+"\nBy"+discolors("34","1")+" 🌼 Mari-chan"
                +"```\n"
                +"How to use: "+command.help+"\n"
                +"\n> ***Description***\n"
                +"```ansi\n"
                +command.description.map(l => {
                    if(exfetch)
                        return config.prefix+discolors("34","1")+l+discolors()
                    if(l === "ex:")
                        exfetch = true;
                    return l;
                }).join("\n")
                +"```\n"
                +"```ansi\n"
                +discolors("34","0")+"The Room | "+msg.author.globalName
                +"```"
            );
        } else {
            msg.edit(
                "```ansi\n"
                +"Invalid command: "+discolors("31","1")+args.join(" ")
                +"```\n"
            )
        }
    }
}