import * as dotenv from 'dotenv';
dotenv.config();
import { Client } from 'discord.js';
import  Controller  from './Controller'
import { readdirSync } from 'fs';
import { Command } from './Extensions/Extension';
const main = async (): Promise<void> => {
    try {
        const client: Client = new Client();

        let controller: Controller<Command> | undefined
    
        console.log(`Starting...`);
        
        
        client.on('ready', () => {
            controller = client?.user?.id ? new Controller(client.user.id) : undefined;
            console.log(`Logged to discord as ${client.user?.tag}`);
            try {
                const extFile = readdirSync('./src/Extensions', {withFileTypes: true}).filter((n)=>n.isDirectory());
                
                extFile.forEach(async (extension) => {
                    const ext = await import(`./Extensions/${extension.name}`)
                    const instance = new ext.default();
                    controller?.Plug(instance);
                    
                });
            } catch (error) {
                console.error(error)
            }
        });
        
        client.on('message', async (msg) => {
            controller?.Assert(msg)
        });
        client.on('disconnect', () =>{
            console.log('connection lost')
        })
        client.login(process.env.TOKEN || '');
    } catch (error) {
        console.error(error)
    }
};

main();