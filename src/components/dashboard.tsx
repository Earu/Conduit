import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from '../interfaces/conduitprops';
import { BotInput } from './botinput';
import { Select } from './select';

export class Dashboard extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this))
    }

    private onReady(): void {
        let user: Discord.ClientUser = this.props.client.user;
        let avatar: HTMLImageElement = document.getElementById('bot-avatar') as HTMLImageElement;
        let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;

        avatar.src = user.avatarURL;
        name.value = user.username;
        if (user.presence.game) {
            game.value = user.presence.game.name;
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

    private async load(promise: Promise<any>) {
        let loader: HTMLElement = document.getElementById('loader');
        loader.style.display = 'block';
        try {
            let res: any = await promise;
            loader.style.display = 'none';
            return res;
        } catch (err) {
            let error: Error = err as Error;
            this.props.logger.error(error.message);
            loader.style.display = 'none';
            throw err;
        }
    }

    private onBotNameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let name: HTMLInputElement = document.getElementById('bot-tag') as HTMLInputElement;
        if (name.value) {
            this.load(this.props.client.user.setUsername(name.value))
                .then(_ => {
                    name.style.borderBottom = '1px solid gray';
                    this.props.logger.success(`Changed username to "${name.value}"`)
                })
                .catch(_ => name.style.borderBottom = '2px solid red');
        }
    }

    private onBotGameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        let activity: HTMLSelectElement = document.getElementById('bot-activity') as HTMLSelectElement;
        if (game.value) {
            let actNumber: number = this.activityNameToNum(activity.value);
            this.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to "${activity.value.toLowerCase()} ${game.value}"`));
        } else {
            this.load(this.props.client.user.setActivity(""))
                .then(_ => this.props.logger.success("Removed the current game activity"));
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
        switch(status) {
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
            this.load(this.props.client.user.setActivity(game.value, { type: actNumber }))
                .then(_ => this.props.logger.success(`Changed activity to "${actName.toLowerCase()} ${game.value}"`));
        }
    }

    private onBotStatusChanged(status: string): void {
        this.load(this.props.client.user.setPresence({ status: status as Discord.PresenceStatus }))
            .then(_ => this.props.logger.success(`Changed status to "${this.statusNameToDisplay(status)}"`))
    }

    private onBotClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.load(this.props.client.destroy())
            .then(_ => this.props.logger.success('Disconnected'));
        let dashboard: HTMLElement = document.getElementById('dashboard');
        let form: HTMLElement = document.getElementById('token-form');
        dashboard.style.display = 'none';
        form.style.display = 'block';
    }

    render(): JSX.Element {
        return <div id='dashboard'>
            <div className='dashboard-header'>
                <h1 className='title'>CONDUIT</h1>
                <button onClick={this.onBotClose.bind(this)} id='disconnect-btn'>X</button>
            </div>
            <div className='dashboard-info'>
                <img id='bot-avatar' alt='avatar'/>
                <BotInput placeholder='name...' id='bot-tag' onValidated={this.onBotNameValidated.bind(this)}/>
                <BotInput placeholder='game...' id='bot-game' onValidated={this.onBotGameValidated.bind(this)}/>
                <Select id='bot-activity' onSelected={this.onBotPresenceChanged.bind(this)} defaultValue='PLAYING' width='125px'>
                    <option value='PLAYING'>Playing</option>
                    <option value='STREAMING'>Streaming</option>
                    <option value='LISTENING'>Listening</option>
                    <option value='WATCHING'>Watching</option>
                </Select>
                <Select id='bot-status' onSelected={this.onBotStatusChanged.bind(this)} defaultValue='online' width='125px'>
                    <option value='online'>Online</option>
                    <option value='idle'>Idle</option>
                    <option value='dnd'>Do Not Disturb</option>
                </Select>
            </div>
        </div>
    }
}