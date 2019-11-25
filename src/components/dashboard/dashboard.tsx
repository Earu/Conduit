import * as React from 'react';

import { ConduitProps } from '../../utils/conduitProps';
import { DashboardHeader } from './header/dashboardHeader';
import { DashboardPanel } from './dashboardPanel';
import { DashboardConsole } from './dashboardConsole';
import { DashboardGuilds } from './guild/dashboardGuilds';
import { ClientHelper } from '../../utils/clientHelper';

export class Dashboard extends React.Component<ConduitProps, {}> {
	private clientHelper: ClientHelper;

	constructor(props: ConduitProps) {
		super(props);
		this.clientHelper = new ClientHelper(this.props.client);
		this.props.client
			.on('loggedIn', this.onLoggedIn.bind(this))
			.on('ready', this.onReady.bind(this));
	}

	private async onLoggedIn(): Promise<void> {
		let wss: Array<WebSocket> = await this.clientHelper.getAllGatewayWS();
		if (wss.length === 0) return;

		let count: number = 0;
		let title: HTMLSpanElement = this.getPanelTitle('guild-panel');
		let guildCount: number = 0;
		for (let ws of wss) {
			let guildCallback = (ev: MessageEvent) => {
				let data = JSON.parse(ev.data);
				if (data.t != 'GUILD_CREATE') return;

				count++;
				let value: number = Math.ceil(count / guildCount* 100);
				if (value >= 100) {
					title.textContent = 'GUILDS';
					ws.removeEventListener('message', guildCallback);
				} else {
					title.textContent = `GUILDS (caching: ${value}%)`;
				}

				if (data.d) {
					this.props.client.emit('guildCached', data.d.id, data.d.name);
				}
			};
			ws.addEventListener('message', guildCallback);
			ws.addEventListener('close', async _ => { // try to switch to new gateway ws
				ws.removeEventListener('message', guildCallback);
				ws = await this.clientHelper.getGatewayWS();
				if (!ws) return;
				ws.addEventListener('message', guildCallback);
			});
		}

		if (!this.props.client.shard) {
			guildCount = this.props.client.guilds.size;
		} else {
			guildCount = (await this.props.client.shard.fetchClientValues('guilds.size')).reduce((a: number, b: number) => a + b, 0);
		}
	}

	private onReady(): void {
		let title: HTMLSpanElement = this.getPanelTitle('guild-panel');
		title.textContent = 'GUILDS';
	}

	private getPanelTitle(id: string): HTMLSpanElement {
		let panel: HTMLElement = document.getElementById(id);
		return panel.getElementsByClassName('title')[0] as HTMLSpanElement;
	}

	render(): JSX.Element {
		return <div id='dashboard'>
			<DashboardHeader client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
			<div className='row' style={{ paddingBottom: '400px' }}>
				<div className='col-md-6'>
					<DashboardPanel id='guild-panel' title='GUILDS' foldable={true}>
						<DashboardGuilds client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
					</DashboardPanel>
				</div>
				<div className='col-md-6'>
					<div className='row'>
						<div className='col-md-12'>
							<DashboardPanel title='TOOLBOX' foldable={true}>
							</DashboardPanel>
						</div>
						<div className='col-md-12'>
							<DashboardPanel title='SCRIPTS' foldable={true}>
							</DashboardPanel>
						</div>
					</div>
				</div>
				<div className='col-md-12'>
					<DashboardPanel id='console-panel' title='CONSOLE' foldable={true} style={{ position: 'fixed', bottom: '0px', width: '100%' }}>
						<DashboardConsole client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
					</DashboardPanel>
				</div>
			</div>
		</div>;
	}
}