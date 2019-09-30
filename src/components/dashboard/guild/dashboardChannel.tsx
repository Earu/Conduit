import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConduitProps } from '../../../utils/conduitProps';
import { GuildChannel, CategoryChannel, TextChannel, VoiceChannel, Guild, Collection, Channel } from 'discord.js';
import { DashboardCategoryChannel } from './dashboardCategoryChannel';
import { DashboardTextChannel } from './dashboardTextChannel';
import { DashboardVoiceChannel } from './dashboardVoiceChannel';
import { Select } from '../../controls/select';
import { ActionReporter } from '../../../utils/actionReporter';
import { SelectHelper } from '../../../utils/selectHelper';

export interface DashboardChannelProps extends ConduitProps {
	guild: Guild;
	reporter: ActionReporter;
	onUpdateRequested: () => void;
}

export class DashboardChannel extends React.Component<DashboardChannelProps, {}> {
	constructor(props: any) {
		super(props);

		this.props.client
			.on('channelCreate', this.onChannelCreate.bind(this))
			.on('channelDelete', this.onChannelDelete.bind(this))
			.on('channelUpdate', (_, c: Channel) => this.onChannelUpdate(c));
	}

	private onChannelX(chan: Channel, callback: (guildChan: GuildChannel) => void): void {
		if (!this.props.guild) return;
		if (chan.type === 'dm' || chan.type === 'group') return;
		let guildChan: GuildChannel = chan as GuildChannel;
		if (guildChan.guild.id === this.props.guild.id) {
			callback(guildChan);
		}
	}

	private onChannelUpdate(chan: Channel): void {
		this.onChannelX(chan, (guildChan: GuildChannel) => {
			SelectHelper.tryChangeOptionText('guild-channel', guildChan.id, `${guildChan.name} [ ${guildChan.type} ]`);
		});
	}

	private onChannelCreate(chan: Channel): void {
		this.onChannelX(chan, (guildChan: GuildChannel) => {
			if (this.props.guild.channels.size === 1) {
				this.props.onUpdateRequested();
			} else {
				SelectHelper.tryAddValue('guild-channel', guildChan.id, `${guildChan.name} [ ${guildChan.type} ]`, this.loadChannel.bind(this));
			}
		});
	}

	private onChannelDelete(chan: Channel): void {
		this.onChannelX(chan, (guildChan: GuildChannel) => {
			if (this.props.guild.channels.size < 1) {
				this.props.onUpdateRequested();
			} else {
				SelectHelper.tryRemoveValue('guild-channel', guildChan.id);
			}
		});
	}

	private loadChannel(chanId: string): JSX.Element {
		let chan: GuildChannel = this.props.guild.channels.find((c: GuildChannel) => c.id === chanId);
		if (!chan) return;
		if (chan.deleted) return;

		let jsx: JSX.Element = <div>UNKNOWN</div>;
		switch (chan.type) {
			case 'category':
				let catChan: CategoryChannel = chan as CategoryChannel;
				jsx = <DashboardCategoryChannel reporter={this.props.reporter} channel={catChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onUpdateRequested={this.props.onUpdateRequested.bind(this)} />;
				break;
			case 'store':
			case 'news':
			case 'text':
				let txtChan: TextChannel = chan as TextChannel;
				jsx = <DashboardTextChannel reporter={this.props.reporter} channel={txtChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onUpdateRequested={this.props.onUpdateRequested.bind(this)} />;
				break;
			case 'voice':
				let voiceChan: VoiceChannel = chan as VoiceChannel;
				jsx = <DashboardVoiceChannel reporter={this.props.reporter} channel={voiceChan} client={this.props.client}
					logger={this.props.logger} loader={this.props.loader} onUpdateRequested={this.props.onUpdateRequested.bind(this)} />;
				break;
			default:
				// unknown channel type, typically new or unexpected channel types
				break;
		}

		ReactDOM.render(jsx, document.getElementById('channel'));
	}

	private renderChannels(): JSX.Element {
		let chans: Collection<string, GuildChannel> = this.props.guild.channels.filter((c: GuildChannel) => !c.deleted);
		if (chans.size > 0) {
			let chanId: string = chans.first().id;
			let opts: Array<JSX.Element> = chans.map((c: GuildChannel) => <option key={`${this.props.guild.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} ]</option>);

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