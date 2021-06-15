interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    size(): number;
}

export default class Queue<T> implements IQueue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error('Queue has reached max capacity, you cannot add more items');
        }
        this.storage.push(item);
    }
    dequeue(): T | undefined {
        return this.storage.shift();
    }
    peek(): T | undefined {
        if (this.storage.length > 0) {
            return this.storage[0];
        }
        return undefined;
    }
    last(): T | undefined {
        if (this.storage.length > 0) {
            return this.storage[this.storage.length - 1];
        }
        return undefined;
    }
    size(): number {
        return this.storage.length;
    }
    clear(): any {
        return this.storage = [];
    }
}
