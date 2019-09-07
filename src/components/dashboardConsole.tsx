import React = require("react");
import { ConduitProps } from "../interfaces/conduitProps";
import { Channel } from "discord.js";
import { LogEventArgs, LogType } from "../utils/logger";

export class DashboardConsole extends React.Component<ConduitProps, {}> {
    constructor(props: any){
        super(props);

        this.props.logger.log.on(this.onLog.bind(this));
        this.props.client
            .on('channelCreate', (chan: Channel) => this.logMessage(`Channel created (${chan.type} | ${chan.id})`))
            .on('channelDelete', (chan: Channel) => this.logMessage(`Channel deleted (${chan.type} | ${chan.id})`))
            .on('channelPinsUpdate', (chan: Channel, time: Date) => this.logMessage(`Channel pins updated at ${time.toLocaleTimeString()} (${chan.type} | ${chan.id})`))
            .on('channelUpdate', (_, chan: Channel) => this.logMessage(`Channel updated (${chan.type} | ${chan.id})`));
            //.on('clientUserGuildSettingsUpdate', (settings) => settings);
    }

    private onLog(logEventArgs: LogEventArgs) {
        this.logMessage(logEventArgs.message, logEventArgs.type);
    }

    private isHidden(): boolean {
        let terminal = document.getElementById('console');
        return terminal.offsetParent === null;
    }

    private logMessage(msg: string, logType?: LogType): void {
        if (this.isHidden()) return;

        let timestamp: string = new Date().toLocaleTimeString();
        let time = document.createElement('span');
        time.style.color = 'orange';
        time.textContent = timestamp;

        let line: HTMLDivElement = document.createElement('div');
        line.appendChild(time);
        line.append(` | ${msg}`);
        if (logType === LogType.DANGER) {
            line.style.backgroundColor = 'rgba(200,0,0,0.5)';
            line.style.color = 'red';
        } else if(logType === LogType.WARN) {
            line.style.backgroundColor = 'rgba(200,140,0,0.5)';
            line.style.color = 'yellow';
        }

        let terminal: HTMLElement = document.getElementById('console');
        terminal.appendChild(line);
        terminal.scrollTo(0, terminal.offsetHeight);
    }

    render(): JSX.Element {
        return <div id='console'>
        </div>
    }
}