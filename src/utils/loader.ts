import { Logger } from './logger';

export class Loader {
    private logger: Logger;
    private promiseAmount: number;

    constructor(logger: Logger) {
        this.logger = logger;
        this.promiseAmount = 0;
    }

    public async load(promise: Promise<any>): Promise<any> {
        let loader: HTMLElement = document.getElementById('loader');
        loader.style.display = 'block';
        this.promiseAmount++;

        try {
            let res: any = await promise;
            this.promiseAmount--;
            if (--this.promiseAmount < 1) {
                loader.style.display = 'none';
            }

            return res;
        } catch (err) {
            let error: Error = err as Error;
            this.logger.error(error.message);
            if (--this.promiseAmount < 1) {
                loader.style.display = 'none';
            }

            throw error;
        }
    }
}