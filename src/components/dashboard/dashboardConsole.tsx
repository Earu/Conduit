import * as React from 'react';
import { ConduitProps } from '../../interfaces/conduitProps';
import { Channel, Emoji, Guild, User, RateLimitInfo, GuildMember, Role } from 'discord.js';
import { LogEventArgs, LogType } from '../../utils/logger';

export class DashboardConsole extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.logger.log.on(this.onLog.bind(this));
        this.props.client
            .on('channelCreate', (chan: Channel) => this.logMessage(`Channel [ ${chan.type} | ${chan.id} ] created`))
            .on('channelDelete', (chan: Channel) => this.logMessage(`Channel [ ${chan.type} | ${chan.id} ] deleted`))
            .on('channelPinsUpdate', (chan: Channel, time: Date) => this.logMessage(`Channel [ ${chan.type} | ${chan.id} ] pins updated at ${time.toLocaleTimeString()}`))
            .on('channelUpdate', (_, chan: Channel) => this.logMessage(`Channel [ ${chan.type} | ${chan.id} ] updated`))

            .on('emojiCreate', (emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.name} | ${emoji.url} | ${emoji.id} ] created in guild [ ${emoji.guild.name} | ${emoji.guild.id} ] `))
            .on('emojiDelete', (emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.name} ] deleted in guild [ ${emoji.guild.name} | ${emoji.guild.id} ]`))
            .on('emojiUpdate', (_, emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.name} | ${emoji.url} | ${emoji.id} ] updated in guild [ ${emoji.guild.name} | ${emoji.guild.id} ]`))

            .on('clientUserGuildSettingsUpdate', (settings) => this.logMessage(`Guild [ ${settings.guildID} ] settings updated`))
            .on('guildBanAdd', (guild: Guild, user: User) => this.logMessage(`Guild [ ${guild.name} | ${guild.id}} ] banned user [ ${user.tag} | ${user.id} ]`))
            .on('guildBanRemove', (guild: Guild, user: User) => this.logMessage(`Guild [ ${guild.name} | ${guild.id}} ] unbanned user [ ${user.tag} | ${user.id} ]`))
            .on('guildCreate', (guild: Guild) => this.logMessage(`Joined guild [ ${guild.name} | ${guild.id} ]`))
            .on('guildDelete', (guild: Guild) => this.logMessage(`Left guild [ ${guild.name} | ${guild.id} ]`))
            .on('guildUpdate', (_, guild: Guild) => this.logMessage(`Updated guild [ ${guild.name} | ${guild.id} ]`))
            .on('guildUnavailable', (guild: Guild) => this.logMessage(`Guild [ ${guild.name} | ${guild.id} ] became unavailable`))
            .on('guildIntegrationsUpdate', (guild: Guild) => this.logMessage(`Updated integration in guild [ ${guild.name} | ${guild.id} ]`))
            .on('guildMemberAdd', (member: GuildMember) => this.logMessage(`User [ ${member.user.tag} | ${member.id} ] joined guild [ ${member.guild.name} | ${member.guild.id} ]`))
            .on('guildMemberRemove', (member: GuildMember) => this.logMessage(`User [ ${member.user.tag} | ${member.id} ] left guild [ ${member.guild.name} | ${member.guild.id} ]`))
            .on('guildMemberUpdate', (_, member: GuildMember) => this.logMessage(`Updated user [ ${member.user.tag} | ${member.id} ] in guild [ ${member.guild.name} | ${member.guild.id} ]`))
            .on('roleCreate', (role: Role) => this.logMessage(`Created role [ ${role.name} | ${role.hexColor} | ${role.id} ] in guild [ ${role.guild.name} | ${role.guild.id} ]`))
            .on('roleDelete', (role: Role) => this.logMessage(`Deleted role [ ${role.name} | ${role.hexColor} | ${role.id} ] in guild [ ${role.guild.name} | ${role.guild.id} ]`))
            .on('roleUpdate', (role: Role) => this.logMessage(`Updated role [ ${role.name} | ${role.hexColor} | ${role.id} ] in guild [ ${role.guild.name} | ${role.guild.id} ]`))

            .on('ready', () => this.logMessage('Ready'))
            .on('reconnecting', () => this.logMessage('Reconnecting', LogType.WARN))
            .on('resume', (n) => this.logMessage(`Resumed websocket connection with ${n} events replayed`))
            .on('warn', (msg: string) => this.logMessage(msg, LogType.WARN))
            .on('error', (err: Error) => this.logMessage(err.message, LogType.DANGER))
            .on('rateLimit', (rateLimit: RateLimitInfo) => this.logMessage(`Triggered rate-limit [ ${rateLimit.path} ]`, LogType.WARN));
    }

    private onLog(logEventArgs: LogEventArgs) {
        this.logMessage(logEventArgs.message, logEventArgs.type);
    }

    private logMessage(msg: string, logType?: LogType): void {
        let timestamp: string = new Date().toLocaleTimeString();
        let time: HTMLSpanElement = document.createElement('span');
        time.style.color = 'orange';
        time.textContent = timestamp;

        let line: HTMLDivElement = document.createElement('div');
        line.appendChild(time);
        line.append(` | ${msg}`);
        if (logType === LogType.DANGER) {
            line.style.backgroundColor = 'rgba(200,0,0,0.5)';
            line.style.color = 'red';
        } else if (logType === LogType.WARN) {
            line.style.backgroundColor = 'rgba(200,140,0,0.5)';
            line.style.color = 'yellow';
        }

        let terminal: HTMLElement = document.getElementById('console');
        terminal.appendChild(line);
        terminal.scrollTo(0, terminal.scrollHeight);
    }

    render(): JSX.Element {
        return <div id='console'/>
    }
}