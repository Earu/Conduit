import { Notyf } from "notyf";

export class Logger {
    private notifications: Notyf;

    constructor() {
        this.notifications = new Notyf({
            duration: 5000,
            ripple: true,
        });
        console.log('Welcome to conduit™');
        console.warn(`The following product is under licensed exclusive rights, any attempt of theft, distribution,
and or but not only limited to service abuse will be issued with direct legal actions toward the individual or moral entity responsible of said actions.`);
    }

    public success(msg: string): void {
        this.notifications.success(msg);
        console.log(msg);
    }

    public error(msg: string): void {
        this.notifications.error(msg);
        console.error(msg);
    }
}