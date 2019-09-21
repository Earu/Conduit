import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from '../../../utils/conduitProps';
import { BotInput } from '../../controls/botInput';
import { Select } from '../../controls/select';
import { BotAvatar } from '../../controls/avatar/botAvatar';

export class DashboardHeaderInfo extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this))
            .on('guildCreate', this.onGuildX.bind(this))
            .on('guildDelete', this.onGuildX.bind(this));
    }

    private onReady(): void {
        let user: Discord.ClientUser = this.props.client.user;
        let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let shards: HTMLElement = document.getElementById('shard-count');
        let guilds: HTMLElement = document.getElementById('guild-count');
        let users: HTMLElement = document.getElementById('user-count');
        let botId: HTMLElement = document.getElementById('bot-id');
        let botInvite: HTMLLinkElement = document.getElementById('bot-invite') as HTMLLinkElement;

        name.value = user.username;
        guilds.innerText = this.props.client.guilds.size.toString();
        users.innerText = this.props.client.users.size.toString();
        botId.innerText = user.id;
        botInvite.href = `https://discordapp.com/oauth2/authorize?client_id=${user.id}`;

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
                .catch(_ => name.style.border = '2px solid red');
        }
    }

    private onBotGameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let activity: HTMLSelectElement = document.getElementById('bot-activity') as HTMLSelectElement;
        if (game.value) {
            let actNumber: number = this.activityNameToNum(activity.value);
            this.props.loader.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to '${activity.value.toLowerCase()} ${game.value}'`));
        } else {
            this.props.loader.load(this.props.client.user.setActivity(''))
                .then(_ => this.props.logger.success('Removed the current game activity'));
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
        if (game.value) {
            let actNumber: number = this.activityNameToNum(actName);
            this.props.loader.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to '${actName.toLowerCase()} ${game.value}'`));
        }
    }

    private onBotStatusChanged(status: string): void {
        this.props.loader.load(this.props.client.user.setPresence({ status: status as Discord.PresenceStatus }))
            .then(_ => this.props.logger.success(`Changed status to '${this.statusNameToDisplay(status)}'`))
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

    render(): JSX.Element {
        return <div className='row dashboard-info '>
            <div className='col-md-1'>
                <div style={{ height: '5px' }} />
                <BotAvatar id='bot-avatar' client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
            </div>
            <div className='col-md-2'>
                <BotInput placeholder='name...' id='bot-tag' onValidated={this.onBotNameValidated.bind(this)} />
                <BotInput placeholder='game...' id='bot-game' onValidated={this.onBotGameValidated.bind(this)} />
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
                Shards: <span id='shard-count'>0</span><br />
                Guilds: <span id='guild-count'>0</span><br />
                Users: <span id='user-count'>0</span>
            </div>
            <div className='bot-stats col-md-3'>
                <div style={{ height: '5px' }} />
                ID: <span id='bot-id'>0</span><br />
                <a id='bot-invite' className='purple-btn'>Bot Invite Link</a>
            </div>
            <div className='col-md-2'>
                <div style={{ height: '5px' }} />
                <button className='red-btn' onClick={this.onBotClose.bind(this)} id='disconnect-btn'>Disconnect</button>
            </div>
        </div>
    }
}