import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitprops';

export class Login extends React.Component<ConduitProps, {}> {
    onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();

        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form = document.getElementById('token-form');
            this.props.client.login(input.value)
                .then(_ => form.style.display = 'none')
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