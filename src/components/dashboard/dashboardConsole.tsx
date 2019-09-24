import * as React from 'react';
import { ConduitProps } from '../../utils/conduitProps';
import { Channel, Emoji, Guild, User, RateLimitInfo, GuildMember, Role } from 'discord.js';
import { LogEventArgs, LogType } from '../../utils/logger';
import { Checkbox } from '../controls/checkbox';
import { Input } from '../controls/input';

enum DiscordEventType {
    Channel,
    Guild,
    Emoji,
    Role,
    Global,
    Conduit,
}

export class DashboardConsole extends React.Component<ConduitProps, {}> {
    private enabledEvents: any = {
        [DiscordEventType.Channel]: true,
        [DiscordEventType.Guild]: true,
        [DiscordEventType.Emoji]: true,
        [DiscordEventType.Role]: true,
        [DiscordEventType.Global]: true,
        [DiscordEventType.Conduit]: true,
    };
    private regex: RegExp;

    constructor(props: any) {
        super(props);

        this.regex = null;
        this.props.logger.log.on(this.onLog.bind(this));
        this.props.client
            .on('channelCreate', (chan: Channel) => this.logMessage(`Channel [ ${chan.id} ] created`, DiscordEventType.Channel))
            .on('channelDelete', (chan: Channel) => this.logMessage(`Channel [ ${chan.id} ] deleted`, DiscordEventType.Channel))
            .on('channelPinsUpdate', (chan: Channel, _) => this.logMessage(`Channel ${chan.id} ] pins updated`, DiscordEventType.Channel))
            .on('channelUpdate', (_, chan: Channel) => this.logMessage(`Channel [ ${chan.id} ] updated`, DiscordEventType.Channel))

            .on('emojiCreate', (emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.id} ] created in guild [ ${emoji.guild.id} ]`, DiscordEventType.Emoji))
            .on('emojiDelete', (emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.id} ] deleted in guild [ ${emoji.guild.id} ]`, DiscordEventType.Emoji))
            .on('emojiUpdate', (_, emoji: Emoji) => this.logMessage(`Emoji [ ${emoji.id} ] updated in guild [ ${emoji.guild.id} ]`, DiscordEventType.Emoji))

            .on('clientUserGuildSettingsUpdate', (settings) => this.logMessage(`Guild [ ${settings.guildID} ] settings updated`, DiscordEventType.Guild))
            .on('guildBanAdd', (guild: Guild, user: User) => this.logMessage(`Guild [ ${guild.id}} ] banned user [ ${user.id} ]`, DiscordEventType.Guild))
            .on('guildBanRemove', (guild: Guild, user: User) => this.logMessage(`Guild [ ${guild.id}} ] unbanned user [ ${user.id} ]`, DiscordEventType.Guild))
            .on('guildCreate', (guild: Guild) => this.logMessage(`Joined guild [ ${guild.id} ]`, DiscordEventType.Guild))
            .on('guildDelete', (guild: Guild) => this.logMessage(`Left guild [ ${guild.id} ]`, DiscordEventType.Guild))
            .on('guildUpdate', (_, guild: Guild) => this.logMessage(`Updated guild [ ${guild.id} ]`, DiscordEventType.Guild))
            .on('guildUnavailable', (guild: Guild) => this.logMessage(`Guild [ ${guild.id} ] became unavailable`, DiscordEventType.Guild))
            .on('guildIntegrationsUpdate', (guild: Guild) => this.logMessage(`Updated integration in guild [ ${guild.id} ]`, DiscordEventType.Guild))
            .on('guildMemberAdd', (member: GuildMember) => this.logMessage(`User [ ${member.id} ] joined guild [ ${member.guild.id} ]`, DiscordEventType.Guild))
            .on('guildMemberRemove', (member: GuildMember) => this.logMessage(`User [ ${member.id} ] left guild [ ${member.guild.id} ]`, DiscordEventType.Guild))
            .on('guildMemberUpdate', (_, member: GuildMember) => this.logMessage(`Updated user [ ${member.id} ] in guild [ ${member.guild.id} ]`, DiscordEventType.Guild))
            .on('roleCreate', (role: Role) => this.logMessage(`Created role [ ${role.id} ] in guild [ ${role.guild.id} ]`, DiscordEventType.Role))
            .on('roleDelete', (role: Role) => this.logMessage(`Deleted role [ ${role.id} ] in guild [ ${role.guild.id} ]`, DiscordEventType.Role))
            .on('roleUpdate', (role: Role) => this.logMessage(`Updated role [ ${role.id} ] in guild [ ${role.guild.id} ]`, DiscordEventType.Role))

            .on('ready', () => this.logMessage('Ready', DiscordEventType.Global))
            .on('reconnecting', () => this.logMessage('Reconnecting', DiscordEventType.Global, LogType.WARN))
            .on('resume', (n) => this.logMessage(`Resumed websocket connection with ${n} events replayed`, DiscordEventType.Global))
            .on('warn', (msg: string) => this.logMessage(msg, DiscordEventType.Global, LogType.WARN))
            .on('error', (err: Error) => this.logMessage(err.message, DiscordEventType.Global, LogType.DANGER))
            .on('rateLimit', (rateLimit: RateLimitInfo) => this.logMessage(`Triggered rate-limit [ ${rateLimit.path} ]`, DiscordEventType.Global, LogType.WARN));
    }

    private onLog(logEventArgs: LogEventArgs) {
        this.logMessage(logEventArgs.message, DiscordEventType.Conduit, logEventArgs.type);
    }

    private logMessage(msg: string, eventType: DiscordEventType, logType?: LogType): void {
        if (!this.enabledEvents[eventType]) return;
        if (this.regex && !this.regex.test(msg)) return;

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

    private setEvent(eventType: DiscordEventType, state: boolean) {
        this.enabledEvents[eventType] = state;
    }

    private onClear(): void {
        let terminal: HTMLElement = document.getElementById('console');
        while (terminal.firstChild) {
            terminal.removeChild(terminal.firstChild);
        }
    }

    private onRegexChange(pattern: string) {
        if (pattern) {
            this.regex = new RegExp(pattern);
        } else {
            this.regex = null;
        }
    }

    render(): JSX.Element {
        return <div>
            <div className='row' style={{ padding: '5px' }}>
                <div className='col-md-1'>
                    <button className='classic-btn' style={{ width: '100%' }} onClick={this.onClear.bind(this)}>Clear</button>
                </div>
                <div className='col-md-1'>
                    <Checkbox id='log-conduit'
                        name='Conduit'
                        defaultValue={this.enabledEvents[DiscordEventType.Conduit]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Conduit, s)} />
                    <br />
                    <Checkbox id='log-global'
                        name='Global'
                        defaultValue={this.enabledEvents[DiscordEventType.Global]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Global, s)} />
                </div>
                <div className='col-md-1'>
                    <Checkbox id='log-guild'
                        name='Guild'
                        defaultValue={this.enabledEvents[DiscordEventType.Guild]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Guild, s)} />
                    <br />
                    <Checkbox id='log-channel'
                        name='Channel'
                        defaultValue={this.enabledEvents[DiscordEventType.Channel]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Channel, s)} />
                </div>
                <div className='col-md-1'>
                    <Checkbox id='log-role'
                        name='Role'
                        defaultValue={this.enabledEvents[DiscordEventType.Role]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Role, s)} />
                    <br />
                    <Checkbox id='log-emoji'
                        name='Emoji'
                        defaultValue={this.enabledEvents[DiscordEventType.Emoji]}
                        onChange={(s: boolean) => this.setEvent(DiscordEventType.Emoji, s)} />
                </div>
                <div className='col-md-8'>
                    <Input id='log-regex' placeholder='regex filter...' onChange={this.onRegexChange.bind(this)} style={{ marginTop: '4px', marginBottom: '0px' }} />
                </div>
            </div>
            <div id='console' />
        </div>;
    }
}