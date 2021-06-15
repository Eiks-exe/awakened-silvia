import { Message } from "discord.js";

export interface Command {
    name: string 
    method: Function
    description?: string
};

export default class Module {
    public name: string;
    public commands: Command[] | any;
    public moduleGlobals : Record<string, any>;
    activator: any;
    
    
    constructor(name: string, activator:string, commands?: Command, initalGlobals?: Record<string, any>) {
        this.name = name
        this.activator = activator;
        this.commands = commands ? commands : [];
        const t = {x : {}};
        this.moduleGlobals = initalGlobals ? initalGlobals : t.x;
    }

    public findCommand = (args: string): Command | undefined => {
        const command = this.commands.find((item: any) => item.commands.name === args);
        return command
    };

    /**
     * Search & execute the module.
     * @param args Message content
     * @param message Message emit by the 'message' event.
     * @param query 
     * @returns
     */

    public executeCommand = async (args: string, message: Message, query?: string): Promise<Boolean> => {
        const command = this.findCommand(args);
        if(!command){
            throw new Error(`No matching command found in module '${this.name}'.`);
        }
        return await command.method(message, query)
    }
}