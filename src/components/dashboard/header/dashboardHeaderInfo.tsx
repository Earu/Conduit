import * as React from 'react';
import * as Discord from 'discord.js';

import { ConduitProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { Select } from '../../controls/select';
import { BotAvatar } from '../../controls/avatar/botAvatar';

export class DashboardHeaderInfo extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.client
            .on('ready', this.initialize.bind(this))
            .on('loggedIn', this.initialize.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this))
            .on('guildCreate', this.onGuildX.bind(this))
            .on('guildCached', this.onGuildX.bind(this))
            .on('guildDelete', this.onGuildX.bind(this));
    }

    private initialize(): void {
        let user: Discord.ClientUser = this.props.client.user;
        let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let shards: HTMLElement = document.getElementById('shard-count');
        let guilds: HTMLElement = document.getElementById('guild-count');
        let users: HTMLElement = document.getElementById('user-count');
        let botId: HTMLElement = document.getElementById('bot-id');

        name.value = user.username;
        guilds.innerText = this.props.client.guilds.size.toString();
        users.innerText = this.props.client.users.size.toString();
        botId.innerText = user.id;

        if (user.presence.game) {
            game.value = user.presence.game.name;
        }

        if (this.props.client.shard) {
            shards.innerText = this.props.client.shard.count.toString();
        } else {
            shards.innerText = '1';
        }
    }

    private onUserUpdate(_: Discord.User, newUser: Discord.User): void {
        let user: Discord.ClientUser = this.props.client.user;
        if (newUser.id === user.id) {
            let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
            let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
            name.value = newUser.username;
            if (user.presence.game) {
                game.value = user.presence.game.name;
            }
        }
    }

    private onGuildX(_: Discord.Guild): void {
        let shards: HTMLElement = document.getElementById('shard-count');
        let guilds: HTMLElement = document.getElementById('guild-count');
        let users: HTMLElement = document.getElementById('user-count');

        guilds.innerText = this.props.client.guilds.size.toString();
        users.innerText = this.props.client.users.size.toString();
        if (this.props.client.shard) {
            shards.innerText = this.props.client.shard.count.toString();
        } else {
            shards.innerText = '1';
        }
    }

    private onBotNameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
        if (name.value) {
            this.props.loader.load(this.props.client.user.setUsername(name.value))
                .then(_ => {
                    name.style.border = '1px solid black';
                    this.props.logger.success(`Changed username to '${name.value}'`)
                })
                .catch(_ => name.value = this.props.client.user.username);
        } else {
            name.value = this.props.client.user.username;
        }
    }

    private onBotGameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let activity: HTMLSelectElement = document.getElementById('bot-activity') as HTMLSelectElement;
        if (game.value) {
            let actNumber: number = this.activityNameToNum(activity.value);
            this.props.loader.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to '${activity.value.toLowerCase()} ${game.value}'`))
                .catch(_ => {
                    let gamePresence: Discord.Game = this.props.client.user.presence.game;
                    if (gamePresence) {
                        game.value = gamePresence.name;
                        let act = this.activityNumToName(gamePresence.type);
                        activity.value = act;
                        activity.nextSibling.textContent = act[0] + act.slice(1).toLowerCase();
                    }
                });
        } else {
            this.props.loader.load(this.props.client.user.setActivity(''))
                .then(_ => this.props.logger.success('Removed the current game activity'));
        }
    }

    private activityNumToName(actNum: number): string {
        switch (actNum) {
            case 0:
                return 'PLAYING';
            case 1:
                return 'STREAMING';
            case 2:
                return 'LISTENING';
            case 3:
                return 'WATCHING';
            default:
                return '';
        }
    }

    private activityNameToNum(activity: string): number {
        switch (activity) {
            case 'PLAYING':
                return 0;
            case 'STREAMING':
                return 1;
            case 'LISTENING':
                return 2;
            case 'WATCHING':
                return 3;
            default:
                return 0;
        }
    }

    private statusNameToDisplay(status: string): string {
        switch (status) {
            case 'online':
                return 'Online';
            case 'idle':
                return 'Idle';
            case 'dnd':
                return 'Do Not Disturb';
            default:
                return 'Online';
        }
    }

    private onBotPresenceChanged(actName: string): void {
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let activity: HTMLSelectElement = document.getElementById('bot-activity') as HTMLSelectElement;
        if (game.value) {
            let actNumber: number = this.activityNameToNum(actName);
            this.props.loader.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to '${actName.toLowerCase()} ${game.value}'`))
                .catch(_ => {
                    let gamePresence: Discord.Game = this.props.client.user.presence.game;
                    if (gamePresence) {
                        game.value = gamePresence.name;
                        let act = this.activityNumToName(gamePresence.type);
                        activity.value = act;
                        activity.nextSibling.textContent = act[0] + act.slice(1).toLowerCase();
                    }
                });
        }
    }

    private onBotStatusChanged(status: string): void {
        let select: HTMLSelectElement = document.getElementById('bot-status') as HTMLSelectElement;
        this.props.loader.load(this.props.client.user.setPresence({ status: status as Discord.PresenceStatus }))
            .then(_ => this.props.logger.success(`Changed status to '${this.statusNameToDisplay(status)}'`))
            .catch(_ => {
                status = this.props.client.user.presence.status;
                select.value = status;
                select.nextSibling.textContent = this.statusNameToDisplay(status);
            });
    }

    private onBotClose(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.props.loader.load(this.props.client.destroy())
            .then(_ => this.props.logger.success('Disconnected'));
        let dashboard: HTMLElement = document.getElementById('dashboard');
        let form: HTMLElement = document.getElementById('token-form');
        dashboard.style.display = 'none';
        form.style.display = 'block';

        location.reload();
    }

    private onInviteClick(): void {
        window.open(`https://discordapp.com/oauth2/authorize?client_id=${this.props.client.user.id}&scope=bot&permissions=0`);
    }

    render(): JSX.Element {
        return <div className='row dashboard-info '>
            <div className='col-md-1'>
                <div style={{ height: '5px' }} />
                <BotAvatar id='bot-avatar' client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
            </div>
            <div className='col-md-2'>
                <Input placeholder='name...' id='bot-tag' onValidated={this.onBotNameValidated.bind(this)} />
                <Input placeholder='game...' id='bot-game' onValidated={this.onBotGameValidated.bind(this)} />
            </div>
            <div className='col-md-2'>
                <Select id='bot-activity' onSelected={this.onBotPresenceChanged.bind(this)} defaultValue='PLAYING'>
                    <option value='PLAYING'>Playing</option>
                    <option value='STREAMING'>Streaming</option>
                    <option value='LISTENING'>Listening</option>
                    <option value='WATCHING'>Watching</option>
                </Select>
                <div style={{ height: '5px' }} />
                <Select id='bot-status' onSelected={this.onBotStatusChanged.bind(this)} defaultValue='online'>
                    <option value='online'>Online</option>
                    <option value='idle'>Idle</option>
                    <option value='dnd'>Do Not Disturb</option>
                </Select>
            </div>
            <div className='bot-stats col-md-2'>
                <div style={{ height: '5px' }} />
                Shards: <span id='shard-count'>>?</span><br />
                Guilds: <span id='guild-count'>>?</span><br />
                Users: <span id='user-count'>?</span>
            </div>
            <div className='bot-stats col-md-3'>
                <div style={{ height: '5px' }} />
                ID: <span id='bot-id'>0</span><br />
                <button className='purple-btn small-btn'
                    style={{ marginTop: '5px' }}
                    onClick={this.onInviteClick.bind(this)}>
                    Bot Invite Link
                </button>
            </div>
            <div className='col-md-2'>
                <div style={{ height: '5px' }} />
                <button className='red-btn' onClick={this.onBotClose.bind(this)} id='disconnect-btn'>Disconnect</button>
            </div>
        </div>
    }
}