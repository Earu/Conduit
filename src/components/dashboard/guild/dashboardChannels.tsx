import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from '../../../utils/conduitProps';
import { DashboardCategoryChannel } from '../channel/dashboardCategoryChannel';
import { DashboardTextChannel } from '../channel/dashboardTextChannel';
import { DashboardVoiceChannel } from '../channel/dashboardVoiceChannel';
import { Select } from '../../controls/select';
import { SelectHelper } from '../../../utils/selectHelper';

export class DashboardChannels extends React.Component<ConduitGuildSubPanelProps, {}> {
	constructor(props: any) {
		super(props);

		this.props.client
			.on('channelCreate', this.onChannelCreate.bind(this))
			.on('channelDelete', this.onChannelDelete.bind(this))
			.on('channelUpdate', (_, c: Discord.Channel) => this.onChannelUpdate(c));
	}

	private onChannelX(chan: Discord.Channel, callback: (guildChan: Discord.GuildChannel) => void): void {
		if (!this.props.guild) return;
		if (chan.type === 'dm' || chan.type === 'group') return;
		let guildChan: Discord.GuildChannel = chan as Discord.GuildChannel;
		if (guildChan.guild.id === this.props.guild.id) {
			callback(guildChan);
		}
	}

	private onChannelUpdate(chan: Discord.Channel): void {
		this.onChannelX(chan, (guildChan: Discord.GuildChannel) => {
			SelectHelper.tryChangeOptionText('guild-channel', guildChan.id, `${guildChan.name} [ ${guildChan.type} ]`);
		});
	}

	private onChannelCreate(chan: Discord.Channel): void {
		this.onChannelX(chan, (guildChan: Discord.GuildChannel) => {
			if (this.props.guild.channels.size === 1) {
				this.props.onLayoutInvalidated();
			} else {
				SelectHelper.tryAddValue('guild-channel', guildChan.id, `${guildChan.name} [ ${guildChan.type} ]`, this.loadChannel.bind(this));
			}
		});
	}

	private onChannelDelete(chan: Discord.Channel): void {
		this.onChannelX(chan, (guildChan: Discord.GuildChannel) => {
			if (this.props.guild.channels.size < 1) {
				this.props.onLayoutInvalidated();
			} else {
				SelectHelper.tryRemoveValue('guild-channel', guildChan.id);
			}
		});
	}

	private loadChannel(chanId: string): void {
		let chan: Discord.GuildChannel = this.props.guild.channels.find((c: Discord.GuildChannel) => c.id === chanId);
		let jsx: JSX.Element = <div/>;
		if (!chan || chan && chan.deleted) {
			ReactDOM.render(jsx, document.getElementById('channel'));
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

		ReactDOM.render(jsx, document.getElementById('channel'));
	}

	private renderChannels(): JSX.Element {
		if (!this.props.guild.channels) return <div />;

		let chans: Discord.Collection<string, Discord.GuildChannel> = this.props.guild.channels.filter((c: Discord.GuildChannel) => !c.deleted);
		if (chans.size > 0) {
			let chanId: string = chans.first().id;
			let opts: Array<JSX.Element> = chans.map((c: Discord.GuildChannel) => <option key={`${this.props.guild.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} ]</option>);

			return <div>
				<Select id='guild-channel' defaultValue={chanId} onSelected={this.loadChannel.bind(this)}>{opts}</Select>
				<hr style={{ marginBottom: '0px' }} />
			</div>;
		} else {
			return <div />;
		}
	}

	private postRender(): void {
		let select: HTMLSelectElement = document.getElementById('guild-channel') as HTMLSelectElement;
		if (select) {
			this.loadChannel(select.value);
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