import { Message } from 'discord.js'
//import Model from '../Modules/Model'
//import  PlayerModel  from '../Modules/Player/Player'
import Module, { Command } from '../Module'

class Controller {
    private clientId: string;
    //private model: Model<Record<string, any>>
    private modules: Module[];
    private commands: Command[];
    private helpers: string[];
    constructor(clientId: string){
        this.clientId = clientId;
        //this.model = new  PlayerModel();
        this.modules = [];
        this.commands = [];
        this.helpers = [];
    }
    /**
     * @descriptionCheckup import and show available modules
     */

    public async CheckUp(){
        
    };
    
    public AddModule(module: Module): void {
        console.log(`Loading module : ${module.name}...`);
        this.commands = this.commands.concat(module.commands.map((c : any) => {
            this.helpers.push(`${module.name} ${c.command.name} : ${c.command.description}.`);
            return {module: module.name, name : c.command.name, method: c.command.method}
        }));
        this.modules.push(module);
        console.log(`Loading module : ${module.name}...OK`);
    }

    public async Assert(message: Message): Promise<any>{
        try {
            const clientIdRegex: any = this.clientId ? new RegExp(`^(<@!?${this.clientId})>`) : (process.env.PREFIX);
            if (!clientIdRegex.test(message.content)) return;
            const [msgclientId, activator, commands, ...query] = message.content.split(' ');
            console.log(msgclientId, activator, commands, query);
            const module = this.modules.find((n) => n.activator === activator);
            if (module){
                return module.executeCommand(commands, message,  query.join(' '));
            }
        } catch (error) {
            console.error(error)
        }
        
    }

}

export default Controller;