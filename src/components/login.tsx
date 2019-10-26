import * as React from 'react';

import { ConduitProps } from '../utils/conduitProps';

export class Login extends React.Component<ConduitProps, {}> {
    private waitGatewayWS(wsObject: any): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, _) => {
            let wsHandle: number = -1;
            let checkWs = () => { 
                if (wsObject.connection && wsObject.connection.ws) {
                    if (wsHandle != -1) {
                        clearInterval(wsHandle);
                    }

                    resolve(wsObject.connection.ws);
                } 
            };

            wsHandle = setInterval(checkWs, 250);
            setTimeout(() => {
                clearInterval(wsHandle);
                resolve(null);
            }, 5000)
        });
    }

    private async getGatewayWS(): Promise<WebSocket> {
        let obj: any = this.props.client as any;
        return await this.waitGatewayWS(obj.ws);
    }

    private async createReadyPromise(): Promise<boolean> {
        return new Promise<boolean>((resolve, _) => {
            setTimeout(() => resolve(false), 5000);

            this.getGatewayWS().then((ws: WebSocket) => {
                if (!ws) {
                    resolve(false);
                    return;
                }
    
                let readyCallback = (ev: MessageEvent) => {
                    let data = JSON.parse(ev.data);
                    if (data.t === 'GUILD_CREATE') { // We wait for the first guild because READY is too early for d.js
                        ws.removeEventListener('message', readyCallback);
                        this.props.client.emit('loggedIn');
                        resolve(true);
                    }
                };
                ws.addEventListener('message', readyCallback);
            });
        });
    }

    private connect(): void {
        let input: HTMLInputElement = document.getElementById('token-input') as HTMLInputElement;
        if (input.value) {
            let form: HTMLElement = document.getElementById('token-form');
            input.disabled = true;
            this.props.loader.load(this.props.client.login(input.value))
                .catch(_ => {
                    input.style.border = '2px solid red';
                    input.disabled = false;
                });

            this.createReadyPromise()
                .then((succ: boolean) => {
                    if (!succ) return;
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
                });
        } else {
            input.style.border = '2px solid red';
            input.disabled = false;
        }
    }

    private onConnect(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.preventDefault();
        this.connect();
    }

    private onTokenChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (!e.target.value) {
            e.target.style.border = 'none';
        }
    }

    private onKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.which === 13) {
            this.connect();
        }
    }

    render(): JSX.Element {
        return (<div id='token-form'>
            <span className='title'>BOT LOGIN</span>
            <input onKeyPress={this.onKeyPress.bind(this)} onChange={this.onTokenChange} id='token-input' type='password' placeholder='discord bot token...' />
            <button className='classic-btn' onClick={this.onConnect.bind(this)}>Connect</button>
        </div>);
    }
}
