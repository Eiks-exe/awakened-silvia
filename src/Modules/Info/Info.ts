
import { Message } from 'discord.js';
import Model from '../Model'



export default class Info extends Model {
    constructor() {
        super();
        this.name='Info'
        this.activator= 'info'
        this.initalGlobals = {
        };
        this.RegisterCommand('ping', this.ping, "ping")
    }
    
    private ping =async (message : Message) =>{
        message.reply('pong')
    }
}