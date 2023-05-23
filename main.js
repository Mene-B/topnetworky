const Discord = require("discord.js");
const client = new Discord.Client({intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
]});
const {token, guildId, adminsChannelId} = require("./config.json")  //il faut changer le guild ID et l'ID du channel des admins dans config.json, mais pour l'instant je le laisse comme ça si tu veux d'abord le tester sur le serveur test


client.login(token);
client.on("ready",async() => {
    console.log("client ready");
});

client.on("guildMemberAdd", async(member) => {
    await member.guild.members.fetch();
    const user = member.user;
    const buttons = [
        new Discord.ButtonBuilder()
        .setCustomId("freelance")
        .setLabel("Freelance")
        .setStyle(Discord.ButtonStyle.Primary),
        new Discord.ButtonBuilder()
        .setCustomId("recruteur")
        .setLabel("Recruteur")
        .setStyle(Discord.ButtonStyle.Primary)
    ]
    const row = new Discord.ActionRowBuilder()
    .addComponents(buttons)
    const message = user.send({content : "Hello, merci de préciser si vous êtes un freelance ou un recruteur", components : [row]})

    const collector = (await message).createMessageComponentCollector({
        filter : ()=> true,
        time : 60000
    })
    collector.on('collect', async(interaction) => {
        if(interaction.customId === "freelance"){
            interaction.message.components[0].components.forEach(component => {
                return component.data.disabled = true;
            })
            interaction.message.edit({components : interaction.message.components})
            const modal = new Discord.ModalBuilder()
            .setCustomId("modal")
            .setTitle("Linkedin")

            const lien = new Discord.TextInputBuilder()
            .setCustomId("link")
            .setLabel("Entrez votre lien linkedin")
            .setStyle(Discord.TextInputStyle.Short)

            const row = new Discord.ActionRowBuilder()
            .addComponents([lien])

            modal.addComponents(row)
            await interaction.showModal(modal);
        }
        if(interaction.customId === "recruteur"){
            interaction.reply("Les recruteurs ne sont pas encore acceptés.");
        }
    })

})

client.on("interactionCreate",async (interaction) => {
    if(interaction.isModalSubmit()){
        const link = interaction.fields.components[0].components[0].value;
        const user = interaction.user;
        interaction.reply("Merci pour votre lien. Votre demande est en attente");
        await client.guilds.fetch();
        const guild = client.guilds.cache.get(guildId);
        await guild.channels.fetch();
        const adminChannel = guild.channels.cache.get(adminsChannelId);
        const embed = new Discord.EmbedBuilder()
        .setAuthor({name:"New freelance"})
        .setDescription(`**Membre :** <@${user.id}>\n**Lien :** ${link}`)
        .setColor(Discord.Colors.Green)

        const button = new Discord.ButtonBuilder()
        .setCustomId("confirm "+user.id)
        .setLabel("Confirmer")
        .setStyle(Discord.ButtonStyle.Success)

        const row = new Discord.ActionRowBuilder()
        .addComponents([button]);

        adminChannel.send({embeds : [embed], components : [row]});
    }
    if(interaction.isButton()){
        if(interaction.customId.startsWith("confirm")){
            interaction.message.components[0].components[0].data.disabled = true;
            interaction.message.edit({components : interaction.message.components})
            const userId = interaction.customId.split(" ")[1];
            await client.guilds.fetch()
            const guild = client.guilds.cache.get(guildId);
            await guild.members.fetch();
            const member = guild.members.cache.get(userId);
            await member.roles.add("1110706777898627162"); // et là il faut juste changer l'ID du rôle, il faut mettre celui de spider, mais encore une fois je le laisse comma ça là si tu veyx faire des tests syr le serveur test
            interaction.reply("Le membre a bien été confirmé")
        }
    }
})