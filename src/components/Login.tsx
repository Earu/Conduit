import * as React from 'react';
import * as Discord from 'discord.js';

export interface LoginProps { client: Discord.Client }

export class Login extends React.Component<LoginProps, {}> {
    onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();

        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form = document.getElementById('token-form');
            //form.style.display = 'none';
            this.props.client.login(input.value)
                .then(_ => {
                    let botUser: Discord.ClientUser = this.props.client.user;
                    console.log('Logged in as ' + botUser.username + '#' + botUser.discriminator);
                })
                .catch(console.error);
        } else {
            input.style.border = '2px solid red';
        }
    }

    render(): JSX.Element {
        return (<div id='token-form'>
            <span>CONDUIT</span>
            <input id='token-input' type='password' placeholder='discord bot token...' />
            <button onClick={this.onConnect.bind(this)}>Connect</button>
        </div>);
    }
}