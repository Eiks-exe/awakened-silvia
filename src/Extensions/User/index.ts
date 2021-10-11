import { Command, Extension } from '../Extension'
import { Message, MessageEmbed, User as DiscordUser } from 'discord.js'


export default class User extends Extension<Command> {
    constructor(){
        super('User');
        this.register({id: 'ninpo', method: this.ninpo, description:'summon someone'})
    }

   
    private ninpo = async (message : Message) : Promise<void> => {
        try {
            if(message.channel.type != "GUILD_TEXT") return;
            const target : DiscordUser | undefined = message.mentions.users.last()
            if(!message.member)return;
            if(!message.member.voice.channel)return;
            const sumMessage = new MessageEmbed()
                .setColor('#00cc00')
                .setTitle('Ninpo')
                .setDescription(`you have been summoned by **${message.author.username}** , in: **${message.member.voice.channel.name}**`)
                .setThumbnail('https://cdn.discordapp.com/attachments/759679730987040811/863846418644992030/77171026_p0_master1200.jpg')
            if(!target) return;
            message.delete()
            target.send({embeds: [sumMessage]})
            message.reply(`${target.username} have been Summoned in ${message.member.voice.channel.name}`)
        
        } catch (error) {
            console.error(error)
        } 
    }
}