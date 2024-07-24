const fetch = import("node-fetch").default;
module.exports = {
    name: "avatar",
    category: "util",
    description: ["Display and set avatar.", "ex:", "avatar", "avatar @user", "avatar link.jpg"],
    help: "avatar (@user/link)",
    async execute (p){
        const { msg, discolors, client, args, userFetch } = p
        let avatar = "https://cdn.discordapp.com/avatars/";
        if (!args[0]){
            avatar += client.user.id+"/"+client.user.avatar;
            msg.edit(
                "```ansi\n"
                +discolors("34","1")+"AVATAR"
                +"```\n"
                +"Avatar ("+client.user.globalName+"): "+avatar+"\n"
                +"```ansi\n"
                +discolors("34","0")+msg.author.globalName
                +"```"
            )
        } else {
            const fetch = await userFetch(args[0]);
            const mention =  msg.mentions.users.first() || fetch;
            if(mention.avatar){
                avatar += mention.id+"/"+mention.avatar
                msg.edit(
                    "```ansi\n"
                    +discolors("34","1")+"AVATAR"
                    +"```\n"
                    +"Avatar ("+mention.username+"): ``"+avatar+"``\n"
                    +"```ansi\n"
                    +discolors("34","0")+msg.author.globalName
                    +"```"
                )
            } else {
                const regimg = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
                if (regimg.test(args[0])){
                    await client.user.setAvatar(args[0]);
                } else {
                    msg.edit(
                        "```ansi\n"
                        +"Invalid user: "+discolors("31","1")+args.join(" ")
                        +"```\n"
                    )
                }
            }
        }
    }
}