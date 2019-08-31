import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from '../interfaces/conduitprops';
import { BotInput } from './botinput';
import { Notyf } from 'notyf';

export class Dashboard extends React.Component<ConduitProps, {}> {
    private notifications: Notyf;

    constructor(props: any) {
        super(props);

        this.notifications = new Notyf({
            duration: 5000,
            ripple: true,
        });
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
            console.log(error.message);
            this.notifications.error(error.message);
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
                    this.notifications.success(`Changed username to "${name.value}"`)
                })
                .catch(_ => name.style.borderBottom = '2px solid red');
        }
    }

    private onBotGameValidated(_: React.KeyboardEvent<HTMLInputElement>): void {
        let game: HTMLInputElement = document.getElementById('bot-game') as HTMLInputElement;
        if (game.value) {
            this.load(this.props.client.user.setActivity(game.value))
                .then(_ => this.notifications.success(`Changed activity to "${game.value}"`));
        } else {
            this.load(this.props.client.user.setActivity(""))
                .then(_ => this.notifications.success("Removed the current game activity"));
        }
    }

    render(): JSX.Element {
        return <div id='dashboard'>
            <div className='dashboard-header'>
                <h1 className='title'>CONDUIT</h1>
            </div>
            <div className='dashboard-info'>
                <img id='bot-avatar' alt='avatar'/>
                <BotInput placeholder='name...' id='bot-tag' onValidated={this.onBotNameValidated.bind(this)}/>
                <BotInput placeholder='game...' id='bot-game' onValidated={this.onBotGameValidated.bind(this)}/>
                <button id='disconnect-btn'>X</button>
            </div>
        </div>
    }
}