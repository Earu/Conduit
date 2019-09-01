import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitprops';

export class Login extends React.Component<ConduitProps, {}> {
    private onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();

        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form = document.getElementById('token-form');
            let loader = document.getElementById('loader');
            loader.style.display = 'block';
            input.disabled = true;
            this.props.client.login(input.value)
                .then(_ => {
                    form.style.display = 'none';
                    loader.style.display = 'none';
                    let dashboard = document.getElementById('dashboard');
                    dashboard.style.display = 'block';
                    this.props.logger.success(`Logged in as ${this.props.client.user.tag}!`);
                })
                .catch(err => {
                    input.style.border = '2px solid red';
                    loader.style.display = 'none';
                    input.disabled = false;
                    let error: Error = err as Error;
                    console.log(error.message);
                    this.props.logger.error(error.message);
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
            <span className='title'>CONDUIT</span>
            <input onChange={this.onTokenChange} id='token-input' type='password' placeholder='discord bot token...' />
            <button onClick={this.onConnect.bind(this)}>Connect</button>
        </div>);
    }
}