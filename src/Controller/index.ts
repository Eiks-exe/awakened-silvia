import { Extension, Command } from '../Extensions/Extension'
import { Message } from 'discord.js'

interface Icontroller<T extends Command> {
    Plug(extension: Extension<T>): void;
    Assert(message: Message): void ;
}

export default class Controller<T extends Command> implements Icontroller<T> {
    private clientId : string;
    private extensions: Extension<T>[];
    private commands : Command[]
    constructor(clientId: string){
        this.clientId = clientId;
        this.extensions = []
        this.commands = []
    }
    
    public Plug(extension: Extension<T>): void {
        console.log(`Loading: ${extension.name}`);
        extension.visit((item: Command) => {
            this.commands.push({id : item.id, method: item.method, description: item.description});
            console.log(item.id)
        })
        this.extensions.push(extension);
        console.log(`Extension ${extension.name} plugged with sucess.`);
    }

    Assert(message: Message): void {
        try {
            const clientIdRegex : any = this.clientId ? new RegExp(`^(<@!?${this.clientId})>`) : (process.env.PREFIX);
            if (!clientIdRegex.test(message.content)) return;
            const [ClientId ,activator , command, ...query] = message.content.split(' ');
            const extension = this.extensions.find((e)=> e.name === activator)
            if(!extension) return;
            console.log(ClientId)
            console.log(extension.get(command));
            const cmd = extension.get(command) 
            if(!cmd) return;
            cmd.method(message, query.join(' '))
        } catch (error){
            console.error(error)
        }
    }
}