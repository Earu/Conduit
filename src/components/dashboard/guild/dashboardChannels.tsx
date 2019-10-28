import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from '../../../utils/conduitProps';
import { DashboardCategoryChannel } from '../channel/dashboardCategoryChannel';
import { DashboardTextChannel } from '../channel/dashboardTextChannel';
import { DashboardVoiceChannel } from '../channel/dashboardVoiceChannel';
import { Input } from '../../controls/input';

export class DashboardChannels extends React.Component<ConduitGuildSubPanelProps, {}> {
	constructor(props: any) {
		super(props);

		this.props.client
			.on('channelCreate', this.onChannelCreate.bind(this))
			.on('channelDelete', this.onChannelDelete.bind(this));
	}

	private onChannelX(chan: Discord.Channel, callback: (guildChan: Discord.GuildChannel) => void): void {
		if (!this.props.guild) return;
		if (chan.type === 'dm' || chan.type === 'group') return;
		let guildChan: Discord.GuildChannel = chan as Discord.GuildChannel;
		if (guildChan.guild.id === this.props.guild.id) {
			callback(guildChan);
		}
	}

	private onChannelCreate(chan: Discord.Channel): void {
		this.onChannelX(chan, (guildChan: Discord.GuildChannel) => {
			if (this.props.guild.channels.size === 1) {
				this.props.onLayoutInvalidated();
			} else {
				let opt: HTMLOptionElement = document.createElement('option');
				opt.value = guildChan.id;
				opt.textContent = `${guildChan.name} [ ${guildChan.id} ]`;

				let datalist: HTMLElement = document.getElementById('guild-channels');
				datalist.appendChild(opt);
			}
		});
	}

	private onChannelDelete(chan: Discord.Channel): void {
		this.onChannelX(chan, (guildChan: Discord.GuildChannel) => {
			if (this.props.guild.channels.size < 1) {
				this.props.onLayoutInvalidated();
			} else {
				let channels: HTMLDataListElement = document.getElementById('guild-channels') as HTMLDataListElement;
				let node: Node = null;
				for (let child of channels.childNodes) {
					let opt: HTMLOptionElement = child as HTMLOptionElement;
					if (opt.value === guildChan.id) {
						node = opt;
						break;
					}
				}

				if (node) {
					channels.removeChild(node);
				}
			}
		});
	}

	private loadChannel(chanId: string): void {
		let chan: Discord.GuildChannel = this.props.guild.channels.get(chanId);
		let container: HTMLElement = document.getElementById('channel');
		let jsx: JSX.Element = <div />;

		if (!chan || (chan && chan.deleted)) {
			ReactDOM.render(jsx, container);
			return;
		}

		switch (chan.type) {
			case 'category':
				let catChan: Discord.CategoryChannel = chan as Discord.CategoryChannel;
				jsx = <DashboardCategoryChannel reporter={this.props.reporter} channel={catChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onLayoutInvalidated={this.props.onLayoutInvalidated.bind(this)} />;
				break;
			case 'store':
			case 'news':
			case 'text':
				let txtChan: Discord.TextChannel = chan as Discord.TextChannel;
				jsx = <DashboardTextChannel reporter={this.props.reporter} channel={txtChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onLayoutInvalidated={this.props.onLayoutInvalidated.bind(this)} />;
				break;
			case 'voice':
				let voiceChan: Discord.VoiceChannel = chan as Discord.VoiceChannel;
				jsx = <DashboardVoiceChannel reporter={this.props.reporter} channel={voiceChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onLayoutInvalidated={this.props.onLayoutInvalidated.bind(this)} />;
				break;
			default:
				// unknown channel type, typically new or unexpected channel types
				break;
		}

		ReactDOM.render(jsx, container);
	}

	private onChannelSelected(): void {
		let input: HTMLInputElement = document.getElementById('guild-channel') as HTMLInputElement;
		if (input.value) {
			this.loadChannel(input.value);
		}
	}

	private renderChannels(): JSX.Element {
		let chans: Discord.Collection<string, Discord.GuildChannel> = this.props.guild.channels.filter((c: Discord.GuildChannel) => !c.deleted);
		if (chans.size > 0) {
			let opts: Array<JSX.Element> = chans.map((c: Discord.GuildChannel) => <option key={`${this.props.guild.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} | {c.id} ]</option>);

			return <div>
				<Input id='guild-channel' onValidated={this.onChannelSelected.bind(this)} placeholder='channel name or id...' list='guild-channels'/>
				<datalist id='guild-channels' >{opts}</datalist>
				<hr style={{ marginBottom: '0px' }} />
			</div>;
		} else {
			return <div />;
		}
	}

	private postRender(): void {
		let input: HTMLInputElement = document.getElementById('guild-channel') as HTMLInputElement;
		if (input) {
			let chans: Discord.Collection<string, Discord.GuildChannel> = this.props.guild.channels.filter((c: Discord.GuildChannel) => !c.deleted);
			if (chans.size > 0) {
				this.loadChannel(chans.first().id);
			}
		} else {
			ReactDOM.render(<div />, document.getElementById('channel'));
		}
	}

	componentDidUpdate(): void {
		this.postRender();
	}

	componentDidMount(): void {
		this.postRender();
	}

	render(): JSX.Element {
		return <div>
			<div style={{ padding: '10px', paddingBottom: '0px' }}>
				<div className='row'>
					<div className='col-md-12'>
						{this.renderChannels()}
					</div>
				</div>
			</div>
			<div id='channel' style={{ padding: '5px', paddingBottom: '0px' }} />
		</div>;
	}
}