export interface Command {
    id: string
    method: Function
    description: string
}

export interface BaseRecord {
    id: string
}

interface ExtensionInterFace<T extends BaseRecord> {
    name : string; 
    register(newValue: T): void
    get(id: string): T
    visit(visitor: (item: T) => void): void;
}

export class Extension<T extends BaseRecord> implements ExtensionInterFace<T>{
    private commands: Record<string, T> = {};
    public name: string
    constructor(name: string){
        this.name = name 
    }
    public register(newValue: T): void {
        this.commands[newValue.id] = newValue;
    }
    public get(id: string): T {
        return this.commands[id]
    }
    
    public visit(visitor: (item: T) => void): void {
        Object.values(this.commands).forEach(visitor);    
    }   
}
