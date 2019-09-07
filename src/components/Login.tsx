import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitProps';

export class Login extends React.Component<ConduitProps, {}> {
    private onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();

        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form: HTMLElement = document.getElementById('token-form');
            input.disabled = true;
            this.props.loader.load(this.props.client.login(input.value))
                .then(_ => {
                    form.style.display = 'none';
                    let dashboard: HTMLElement = document.getElementById('dashboard');
                    dashboard.style.display = 'block';
                    this.props.logger.success(`Logged in as ${this.props.client.user.tag}!`);
                    input.disabled = false;
                })
                .catch(_ => {
                    input.style.border = '2px solid red';
                    input.disabled = false;
                });
        } else {
            input.style.border = '2px solid red';
        }
    }

    private onTokenChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (!e.target.value) {
            e.target.style.border = 'none';
        }
    }

    render(): JSX.Element {
        return (<div id='token-form'>
            <h1 className='title'>CONDUIT</h1>
            <input onChange={this.onTokenChange} id='token-input' type='password' placeholder='discord bot token...' />
            <button onClick={this.onConnect.bind(this)}>Connect</button>
        </div>);
    }
}