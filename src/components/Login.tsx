import * as React from "react";

export class Login extends React.Component {
    private onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        //e.preventDefault();
        console.debug('test');

        let input: HTMLElement = document.getElementById('token-input');
        let token: string = input.textContent;
        if (token) {
            let form = document.getElementById('token-form');
            form.style.display = 'none';
            console.debug('test');
        }
    }

    public render(): JSX.Element {
        return (<div id='token-form'>
            <span>CONDUIT</span>
            <input id='token-input' type='password' placeholder='discord bot token...'/>
            <button onClick={this.onClick}>Connect</button>
        </div>);
    }
}