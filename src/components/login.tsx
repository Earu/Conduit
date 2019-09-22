import * as React from 'react';
import { ConduitProps } from '../utils/conduitProps';

export class Login extends React.Component<ConduitProps, {}> {
    private onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();

        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form: HTMLElement = document.getElementById('token-form');
            input.disabled = true;
            this.props.loader.load(this.props.client.login(input.value))
                .then(_ => {
                    if (!this.props.client.user.bot) { // we do NOT endorse user bots
                        this.props.loader.load(this.props.client.destroy())
                            .then(_ => {
                                input.style.border = '2px solid red';
                                input.disabled = false;
                                this.props.logger.error('You cannot login with a user token');
                            });
                    } else {
                        form.style.display = 'none';
                        let dashboard: HTMLElement = document.getElementById('dashboard');
                        dashboard.style.display = 'block';

                        let header: HTMLDivElement = document.getElementsByClassName('header')[0] as HTMLDivElement;
                        header.style.display = 'none';

                        this.props.logger.success(`Logged in as ${this.props.client.user.tag}!`);
                        input.disabled = false;
                    }
                })
                .catch(_ => {
                    input.style.border = '2px solid red';
                    input.disabled = false;
                });
        } else {
            input.style.border = '2px solid red';
            input.disabled = false;
        }
    }

    private onTokenChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (!e.target.value) {
            e.target.style.border = 'none';
        }
    }

    render(): JSX.Element {
        return (<div id='token-form'>
            <span className='title'>BOT LOGIN</span>
            <input onChange={this.onTokenChange} id='token-input' type='password' placeholder='discord bot token...' />
            <button className='classic-btn' onClick={this.onConnect.bind(this)}>Connect</button>
        </div>);
    }
}
