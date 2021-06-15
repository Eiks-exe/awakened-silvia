// interface IQueue<T> {
//     enqueue(item: T): void;
//     dequeue(): T | undefined;
//     peek(): T | any;
//     size(): number;
// }

export default class musicQueue {
    private storage: string[] = []
    //constructor(private capacity: number = Infinity) {}

    size(): number {
        return this.storage.length;
    }
}