import { Message } from "discord.js";

interface Command {
    name: string 
    method: Function
    description?: string
};

export interface ModuleCommandMethod<T = Record<string, any>> {
    message: Message;
    data: RegExpMatchArray;
    moduleData?: Partial<T>;
    setModuleData: (newModuleData: Partial<T>, preserve?: boolean) => void;
}

export default class Model<T = Record<string, any>>  {
    public name: string;
    public commands: {command: Command}[]
    public initalGlobals?: Partial<T>;
    public activator: string;
    constructor(){
        this.name='Model'
        this.activator = 'model'
        this.commands= []
        this.initalGlobals = undefined;
    }
    protected RegisterCommand(name: string, method: Function ,description?: string) {
        const command: Command = {
            name: name,
            method: method,
            description: description
        }
        this.commands.push({command})
    }

}