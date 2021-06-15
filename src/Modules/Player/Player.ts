import { Message, MessageEmbed, StreamDispatcher, VoiceConnection } from 'discord.js';
import { Queue } from 'typescript-collections'
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import Model from '../Model'


interface playerInfo {
    status: 'Playing' | 'Added in playlist',
    title: string,
    timestamp: string,
    url: string,
    image: string,
}


export default class PlayerModel extends Model {
    queue: Queue<string>;
    connection: VoiceConnection | undefined;
    dispatcher: StreamDispatcher | undefined;
    stream: any;
    constructor() {
        super();
        this.name='Player'
        this.activator= 'info'
        this.initalGlobals = {
        };
        this.queue = new Queue<string>()
        this.connection = undefined,
        this.dispatcher = undefined
        this.stream = undefined
        this.RegisterCommand('play', this.play, "play")
        this.RegisterCommand('stop', this.stop, "stop the music")
        this.RegisterCommand('skip', this.skip, "skip the song")
    }
    private play = async (message: Message, args: string, nextSong?: string) => {
        try {
            let songUrl = ''
            if (!message.member?.voice.channel) {
                message.delete();
                message.reply("i'm sorry, but you should be in a channel. ^^'")
                return;
            } 
            if (!nextSong && this.queue.size() == 0) {
                const { url, title, timestamp, image } = await (await yts(args)).videos[0];
                songUrl = url;
                this.playerInfo({ status: 'Playing', title: title, timestamp: timestamp, url: url, image: image }, message);
            } else if (nextSong) {
                const { url, title, timestamp, image } = await yts({
                    videoId: nextSong.replace('https://youtube.com/watch?v=', ''),
                });
                songUrl = url;
                this.playerInfo({ status: 'Playing', title: title, timestamp: timestamp, url: url, image: image }, message);
            } else {
                const { url, title, timestamp, image } = await (await yts(args)).videos[0];
                songUrl = url;
                this.playerInfo({ status: 'Added in playlist', title: title, timestamp: timestamp, url: url, image: image }, message);
            }
            this.connection = await message.member.voice.channel.join();
            if (songUrl != this.queue.peek()) this.queue.enqueue(songUrl);
            if (songUrl === this.queue.peek()) {
                this.stream = ytdl(this.queue.peek() || '', {filter: 'audioonly', quality:'lowestaudio', liveBuffer: 5000, dlChunkSize: 1024*1024*1})
                const finish = async () => {
                    this.queue.dequeue();
                    if(!this.queue.peek){
                        this.connection?.disconnect()
                        message.channel.send('queue empty')
                        return;
                    }
                    const next = this.queue.peek() || '';
                    await this.play(message, '', next)
                }
                this.dispatcher = this.connection.play(this.stream)
                this.dispatcher.on('finish', finish)
                console.log(`Start playing ${this.queue.peek()}`);
            }

            
        } catch (error) {
            console.error(error);
        }
    };
    
    /**
     * pause
     */

    public pause = async (message: Message) => {
        console.log('paused');
    };

    /**
     * resume
     */
     public resume = async (message: Message) => {
        console.log('paused');
    };

    /**
     * skip
     */

    public skip = async (message: Message) => {
        try {
            if(!this.dispatcher){
                message.reply("not playing anything right now ^^'")
                return;
            }
            this.dispatcher.destroy();
            this.queue.dequeue()
        } catch (error) {
            console.error(error)
        }
    };

    /**
     * stop 
     */

    private stop = async (message: Message) => {
        try {
            if(!this.connection){
                message.reply("im not playing anything right now");
                return;
            }
            this.connection.disconnect();
            this.queue.clear();      
            message.reply('player stopped') ;
        } catch (error) {
            console.error(error)
        }
    }

    private async playerInfo(args: playerInfo, message: Message) {
        const embed = new MessageEmbed();
        embed.setColor('#00cc00');
        embed.title = args.status;
        embed.description = args.title;
        embed.addField('duration', args.timestamp);
        embed.addField('link', args.url);
        embed.setThumbnail(args.image);
        message.channel.send(embed);
        if (args.status == 'Added in playlist') message.delete();
    };
}