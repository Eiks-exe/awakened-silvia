import { Command, Extension } from '../Extension'
import { Message, MessageEmbed, User as DiscordUser } from 'discord.js'


export default class User extends Extension<Command> {
    constructor(){
        super('User');
        this.register({id: 'ninpo', method: this.ninpo, description:'invoke someone'})
    }

    private ninpo = async (message : Message) : Promise<void> => {
        try {
            if(message.channel.type != "text") return;
            const target : DiscordUser | undefined = message.mentions.users.last()
            const sumMessage = new MessageEmbed()
                .setColor('#00cc00')
                .setTitle('Ninpo')
                .setDescription(`you have been summoned by **${message.author.username}** , in: **${message.channel.guild.name}**`)
                .setThumbnail('https://cdn.discordapp.com/attachments/759679730987040811/863846418644992030/77171026_p0_master1200.jpg')
            if(!target) return;
            message.delete()
            target.send(sumMessage)
            message.reply(`${target.username} have been Summoned`)
        
        } catch (error) {
            console.error(error)
        }
    }
}