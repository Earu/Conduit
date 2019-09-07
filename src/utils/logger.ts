import { Notyf } from "notyf";
import { ConduitEvent, IConduitEvent } from "./conduitEvent";

export enum LogType {
    NORMAL,
    WARN,
    DANGER,
}

export class LogEventArgs {
    public message: string;
    public type: LogType;

    constructor(msg: string, type: LogType) {
        this.message = msg;
        this.type = type;
    }
}

export class Logger {
    private notifications: Notyf;
    private onLog: ConduitEvent<LogEventArgs>;

    constructor() {
        this.notifications = new Notyf({
            duration: 5000,
            ripple: true,
        });
        this.onLog = new ConduitEvent<LogEventArgs>();
        console.log('Welcome to conduit™');
        console.warn(`The following product is under licensed exclusive rights, any attempt of theft, distribution,
and or but not only limited to service abuse will be issued with direct legal actions toward the individual or moral entity responsible of said actions.`);
    }

    public success(msg: string): void {
        this.notifications.success(msg);
        console.log(msg);
        this.onLog.trigger(new LogEventArgs(msg, LogType.NORMAL));
    }

    public error(msg: string): void {
        this.notifications.error(msg);
        console.error(msg);
        this.onLog.trigger(new LogEventArgs(msg, LogType.DANGER));
    }

    public get log(): IConduitEvent<LogEventArgs> {
        return this.onLog.expose();
    }
}