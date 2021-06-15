import * as dotenv from 'dotenv';
dotenv.config();
import { Client } from 'discord.js';
import  Controller  from './controllers/Player'
import { readdirSync } from 'fs';
const main = async (): Promise<void> => {
    try {
        const client: Client = new Client();

        let controller: Controller | undefined
    
        console.log(`Starting...`);
        
        
        client.on('ready', () => {
            controller = client?.user?.id ? new Controller(client.user.id) : undefined;
            console.log(`Logged to discord as ${client.user?.tag}`);
            try {
                const moduleFile = readdirSync('./src/Modules', {withFileTypes: true}).filter((n)=>n.isDirectory());
                
                moduleFile.forEach(async module => {
                    const mod = await import(`./Modules/${module.name}/${module.name}`)
                    const instance = new mod.default();
                    controller?.AddModule(instance);
                    
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