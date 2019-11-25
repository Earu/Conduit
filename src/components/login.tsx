import * as React from 'react';

import { ConduitProps } from '../utils/conduitProps';
import { ClientHelper } from '../utils/clientHelper';

export class Login extends React.Component<ConduitProps, {}> {
	private clientHelper: ClientHelper;

	constructor (props: ConduitProps) {
		super(props);

		this.clientHelper = new ClientHelper(this.props.client);
	}

	private async createReadyPromise(): Promise<boolean> {
		return new Promise<boolean>(async (resolve, _) => {
			setTimeout(() => resolve(false), 30000); // 30s

			let wss: Array<WebSocket> = await this.clientHelper.getAllGatewayWS();
			if (wss.length === 0) {
				resolve(false);
				return;
			}

			let i: number = 0;
			for (let ws of wss) {
				let readyCallback = (ev: MessageEvent) => {
					let data = JSON.parse(ev.data);
					if (!data) {
						ws.removeEventListener('message', readyCallback);
						resolve(false);
					} else if (data.t === 'READY' && data.d.guilds && data.d.guilds.length < 1) {
						ws.removeEventListener('message', readyCallback);
						setTimeout(() => { // wait for d.js to process the msg
							this.props.client.emit('loggedIn');
							if (++i === wss.length) {
								resolve(true);
							}
						}, 2000);
					} else if (data.t === 'GUILD_CREATE') { // If we have more than 1 guild wait for first guild
						ws.removeEventListener('message', readyCallback);
						this.props.client.emit('loggedIn');
						if (++i === wss.length) {
							resolve(true);
						}
					}
				};
				ws.addEventListener('message', readyCallback);
			}
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
					if (!succ) {
						this.props.loader.load(this.props.client.destroy())
							.then(_ => {
								input.style.border = '2px solid red';
								input.disabled = false;
								this.props.logger.error('Connection timed out or failed');
							});
						return;
					}

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
