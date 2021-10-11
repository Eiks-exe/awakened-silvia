import { Command, Extension } from "../Extension";
import { Message, MessageEmbed } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  VoiceConnection,
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
} from "@discordjs/voice";
import yts from "yt-search";
import ytdl from "ytdl-core";
import { Queue } from "typescript-collections";

interface playerInfo {
  status: "Playing" | "Added in playlist";
  title: string;
  timestamp: string;
  url: string;
  image: string;
}

export default class MusicPlayer extends Extension<Command> {
  queue: Queue<string>;
  connection: VoiceConnection | undefined;
  audioplayer: AudioPlayer | undefined;
  stream: AudioResource | undefined;
  constructor() {
    super("Player");
    this.queue = new Queue<string>();
    this.connection = undefined;
    this.connection = undefined;
    this.audioplayer = undefined;
    this.stream = undefined;
    //this.register({id: '', method: function, description:''})
    this.register({
      id: "play",
      method: this.play,
      description: "play a song",
    });
    this.register({
      id: "stop",
      method: this.stop,
      description: "stop the player",
    });
    this.register({
      id: "skip",
      method: this.skip,
      description: "skip the song that the bot is playings",
    });
    this.register({
      id: "pause",
      method: this.pause,
      description: "pause a song",
    });
    this.register({
      id: "resume",
      method: this.resume,
      description: "resume a song",
    });
    this.register({
      id: "list",
      method: this.list,
      description: "list commandes",
    });
  }

  private async playerInfo(args: playerInfo, message: Message) {
    const embed = new MessageEmbed();
    embed.setColor("#00cc00");
    embed.title = args.status;
    embed.description = args.title;
    embed.addField("duration", args.timestamp);
    embed.addField("link", args.url);
    embed.setThumbnail(args.image);
    message.channel.send({embeds: [embed]})
    if (args.status == "Added in playlist") message.delete();
  }

  private play = async (message: Message, args: string, nextSong?: string) => {
    try {
      let songUrl = "";
      if (!message.member?.voice.channel) {
        message.delete();
        message.reply("i'm sorry, but you should be in a channel. ^^'");
        return;
      }
      if (!nextSong && this.queue.size() == 0) {
        const { url, title, timestamp, image } = await (
          await yts(args)
        ).videos[0];
        songUrl = url;
        this.playerInfo(
          {
            status: "Playing",
            title: title,
            timestamp: timestamp,
            url: url,
            image: image,
          },
          message
        );
      } else if (nextSong) {
        const { url, title, timestamp, image } = await yts({
          videoId: nextSong.replace("https://youtube.com/watch?v=", ""),
        });
        songUrl = url;
        this.playerInfo(
          {
            status: "Playing",
            title: title,
            timestamp: timestamp,
            url: url,
            image: image,
          },
          message
        );
      } else {
        const { url, title, timestamp, image } = await (
          await yts(args)
        ).videos[0];
        songUrl = url;
        this.playerInfo(
          {
            status: "Added in playlist",
            title: title,
            timestamp: timestamp,
            url: url,
            image: image,
          },
          message
        );
      }
      const channel = message.member.voice.channel;
      if (!channel) return;
      if (!message.guild) return;
      this.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      if (songUrl != this.queue.peek()) this.queue.enqueue(songUrl);
      if (songUrl === this.queue.peek()) {
        this.stream = createAudioResource(
          ytdl(this.queue.peek() || "", {
            filter: "audioonly",
            quality: "lowestaudio",
            liveBuffer: 5000,
            dlChunkSize: 1024 * 1024 * 1,
          })
        );
        const finish = async () => {
          this.queue.dequeue();
          if (!this.queue.peek()) {
            if (!this.connection) return;
            this.connection.disconnect();
            message.channel.send("queue empty");
          } else {
            console.log("next");
            const next = this.queue.peek() || "";
            await this.play(message, "", next);
          }
        };
        this.audioplayer = createAudioPlayer();
        this.audioplayer.play(this.stream);
        this.connection.subscribe(this.audioplayer);
        this.audioplayer.on(AudioPlayerStatus.Idle, finish);
        //TODO delete that
        //this.audioplayer = this.connection?.play(this.stream);
        //this.audioplayer.on("finish", finish);
        console.log(`Start playing: ${args}, url: ${this.queue.peek()}`);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *
   * @param message
   */

  private stop = async (message: Message): Promise<void> => {
    try {
      if (!this.connection) {
        message.reply("i'm not playing anything right now");
        return;
      }
      this.audioplayer?.stop()  
      this.queue.clear();
      message.channel.send("player stopped");
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *
   * @param message
   * @returns
   */

  private pause = async (message: Message): Promise<void> => {
    if (!this.audioplayer) {
      message.reply("not playing anything right now ^^'");
      return;
    }
    this.audioplayer.pause();
    message.channel.send("player paused");
  };

  /**
   * @name resume
   * @param message
   */

  private resume = async (message: Message): Promise<void> => {
    if (!this.audioplayer) {
      message.reply("not playing anything right now ^^'");
      return;
    }
    this.audioplayer.unpause();
  };

  /**
   *
   */

  private skip = async (message: Message): Promise<void> => {
    try {
      if (!this.audioplayer) {
        message.reply("not playing anything right now ^^'");
        return;
      }
      this.audioplayer.stop();
      this.queue.dequeue();
    } catch (error) {
      console.error(error);
    }
  };
  /*
  private setVolume = async (message: Message, args: number): Promise<void> => {
    try {
      if (!this.audioplayer) {
        message.reply("not playing anything right now ^^'");
        return;
      }
      this.audioplayer.setVolume(args);
      console.log("volume is now to: " + args);
    } catch (error) {
      console.error(error);
    }
  };
*/
  private list = async (message: Message, args: string): Promise<void> => {
    try {
      switch (args) {
        case "show":
          console.log(this.queue);
          break;

        default:
          console.log("no arguments");
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };
}
