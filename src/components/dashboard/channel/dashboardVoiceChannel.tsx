import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitChannelProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { Select } from '../../controls/select';
import { SelectHelper } from '../../../utils/selectHelper';
import { VoiceClient } from '../../../voice/voiceClient';

export class DashboardVoiceChannel extends React.Component<ConduitChannelProps<Discord.VoiceChannel>, {}> {
	private static registeredEvents: boolean = false;

	private onChannelDeletion: ConduitEvent<void>;
	private channel: Discord.VoiceChannel;
	private voiceClient: VoiceClient;

	constructor(props: ConduitChannelProps<Discord.VoiceChannel>) {
		super(props);

		this.onChannelDeletion = new ConduitEvent();
		this.channel = props.channel;
		this.voiceClient = null;
		if (props.onLayoutInvalidated) {
			this.onChannelDeletion.on(props.onLayoutInvalidated);
		}

		if (!DashboardVoiceChannel.registeredEvents) {
			props.client
				.on('channelCreate', this.onChannelCreate.bind(this))
				.on('channelDelete', this.onChannelDelete.bind(this))
				.on('channelUpdate', (_, c: Discord.Channel) => this.onChannelUpdate(c));
			//.on('voiceStateUpdate', console.log);

			DashboardVoiceChannel.registeredEvents = true;
		}
	}

	private onChannelCreate(c: Discord.Channel): void {
		if (this.isValidChannel(c) && c.type === 'category') {
			let cat: Discord.CategoryChannel = c as Discord.CategoryChannel;
			SelectHelper.tryAddValue('channel-parent', cat.id, `${cat.name} [ ${cat.type} ]`, this.onParentSelected.bind(this));
		}
	}

	private onChannelDelete(c: Discord.Channel): void {
		if (this.isValidChannel(c)) {
			if (c.id === this.channel.id) {
				this.onChannelDeletion.trigger();
			} else if (c.type === 'category') {
				SelectHelper.tryRemoveValue('channel-parent', c.id);
			}
		}
	}

	private onChannelUpdate(c: Discord.Channel): void {
		if (this.isValidChannel(c)) {
			if (c.id === this.channel.id) {
				this.channel = c as Discord.VoiceChannel;
				this.onInitialize();
			} else if (c.type === 'category') {
				let cat: Discord.CategoryChannel = c as Discord.CategoryChannel;
				SelectHelper.tryChangeOptionText('channel-parent', cat.id, `${cat.name} [ ${cat.type} ]`);
			}
		}
	}

	private isValidChannel(c: Discord.Channel): boolean {
		if (!this.isVisible()) return false;
		if (c.type === 'dm' || c.type === 'group') return false;
		let guildChan: Discord.GuildChannel = c as Discord.GuildChannel;
		return guildChan.guild.id === this.channel.guild.id;
	}

	private isVisible(): boolean {
		if (document.getElementById('voice-channel')) return true;

		return false;
	}

	private onChannelNameChanged(): void {
		if (!this.isCurrentChannelValid()) return;

		let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		if (input.value) {
			if (!this.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.channel.name;
			} else {
				let oldName: string = this.channel.name;
				this.props.loader.load(this.channel.setName(input.value))
					.then((c: Discord.VoiceChannel) => {
						this.props.logger.success('Changed selected channel\'s name');
						this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
					})
					.catch(_ => input.value = this.channel.name);
			}
		} else {
			input.value = this.channel.name;
		}
	}

	private onChannelUserLimitChanged(): void {
		if (!this.isCurrentChannelValid()) return;

		let input: HTMLInputElement = document.getElementById('channel-user-limit') as HTMLInputElement;
		if (input.value) {
			if (!this.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.channel.userLimit > 0 ? `${this.channel.userLimit} max. users` : '';
			} else {
				let regex: RegExp = /^(\d+)(\s*max\.?\s*users)?$/;
				let matches: RegExpMatchArray = input.value.match(regex);
				if (matches && matches[1]) {
					let limit: number = Number(matches[1]);
					let oldLimit: number = this.channel.userLimit;
					this.props.loader.load(this.channel.setUserLimit(limit))
						.then((c: Discord.VoiceChannel) => {
							input.value = c.userLimit > 0 ? `${c.userLimit} max. users` : '';
							this.props.logger.success('Changed selected channel\'s user limit');
							let oldLimitDisplay: string = oldLimit === 0 ? 'inf' : `${oldLimit} max. users`;
							let newLimitDisplay: string = c.userLimit === 0 ? 'inf' : `${c.userLimit} max. users`;
							this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s user limit [ \`${oldLimitDisplay}\` -> \`${newLimitDisplay}\` ]`, c.guild);
						})
						.catch(_ => input.value = this.channel.userLimit > 0 ? `${this.channel.userLimit} max. users` : '');
				} else {
					input.value = this.channel.userLimit > 0 ? `${this.channel.userLimit} max. users` : '';
				}
			}
		}
	}

	private onChannelBitrateChanged(): void {
		if (!this.isCurrentChannelValid()) return;

		let input: HTMLInputElement = document.getElementById('channel-bitrate') as HTMLInputElement;
		if (input.value) {
			if (!this.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = `${this.channel.bitrate}kbps`;
			} else {
				let regex: RegExp = /^(\d+)(\s*kbps)?$/;
				let matches: RegExpMatchArray = input.value.match(regex);
				if (matches && matches[1]) {
					let bitrate: number = Number(matches[1]);
					let oldBitrate: number = this.channel.bitrate;
					this.props.loader.load(this.channel.setBitrate(bitrate))
						.then((c: Discord.VoiceChannel) => {
							input.value = `${c.bitrate}kbps`;
							this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s bitrate [ \`${oldBitrate}\` -> \`${c.bitrate}\` ]`, c.guild);
						})
						.catch(_ => input.value = `${this.channel.bitrate}kbps`);
				}
			}
		} else {
			input.value = `${this.channel.bitrate}kbps`;
		}
	}

	private onChannelDeleted(): void {
		if (!this.isCurrentChannelValid()) return;

		if (!this.channel.deletable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			this.props.loader.load(this.channel.delete())
				.then((c: Discord.VoiceChannel) => {
					this.props.logger.success(`Deleted selected channel`);
					this.onChannelDeletion.trigger();
					this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
				});
		}
	}

	private connect(): void {
		this.voiceClient = new VoiceClient(this.channel);
		this.props.loader.load(this.voiceClient.connect())
			.then((success: boolean) => {
				let msg: string = success
					? 'Connected to selected voice channel'
					: 'Could not connect to selected voice channel';
				this.props.logger.success(msg);
				console.debug(this.props.client.voiceConnections);
			});
	}

	private onJoinLeaveClick(): void {
		if (this.voiceClient && this.voiceClient.isConnected) {
			this.voiceClient.disconnect();
			this.props.logger.success('Should disconnect');
			if (this.voiceClient.channel.id != this.channel.id) {
				this.connect();
			}
		} else {
			this.connect();
		}
	}

	private onParentSelected(value: string): void {
		if (!this.isCurrentChannelValid()) return;

		if (!this.channel.manageable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			if (value === 'NONE') {
				let oldParent = this.channel.parent;
				this.props.loader.load(this.channel.setParent(null))
					.then((c: Discord.VoiceChannel) => {
						this.props.logger.success(`Changed selected channel's category`);
						let report: string = `Moved ${this.props.reporter.formatChannel(c)} out of ${this.props.reporter.formatChannel(oldParent)}`;
						this.props.reporter.reportGuildAction(report, c.guild);
					})
					.catch(_ => SelectHelper.trySetValue('channel-parent', this.channel.parent ? this.channel.parentID : 'NONE'));
			} else {
				let parent: Discord.GuildChannel = this.channel.guild.channels.find((c: Discord.GuildChannel) => c.id === value);
				if (!parent) return;

				this.props.loader.load(this.channel.setParent(parent))
					.then((c: Discord.VoiceChannel) => {
						this.props.logger.success(`Changed selected channel's category`);
						this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} to ${this.props.reporter.formatChannel(parent)}`, c.guild);
					})
					.catch(_ => SelectHelper.trySetValue('channel-parent', this.channel.parent ? this.channel.parentID : 'NONE'));
			}
		}
	}

	private isCurrentChannelValid(): boolean {
		if (!this.channel) return false;
		if (this.channel.deleted) return false;

		return true;
	}

	private onInitialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		let userLimitInput: HTMLInputElement = document.getElementById('channel-user-limit') as HTMLInputElement;
		let bitrateInput: HTMLInputElement = document.getElementById('channel-bitrate') as HTMLInputElement;
		let chanContainer: HTMLElement = document.getElementById('container-channel-parent');
		if (!nameInput || !userLimitInput || !bitrateInput || !chanContainer) return;

		nameInput.value = this.channel.name;
		userLimitInput.value = this.channel.userLimit > 0 ? `${this.channel.userLimit} max. users` : '';
		bitrateInput.value = this.channel.bitrate ? `${this.channel.bitrate}kbps` : ''; // should never happen

		let chans: Discord.Collection<string, Discord.GuildChannel> = this.channel.guild.channels.filter((c: Discord.GuildChannel) => c.type === 'category');
		let categories: Array<JSX.Element> = [];
		categories.push(<option key={`${this.channel.id}_NONE`} value='NONE'>no category</option>);
		if (chans.size > 0) {
			for (let item of chans) {
				let c: Discord.GuildChannel = item[1];
				if (c.deleted) continue;
				categories.push(<option key={`${this.channel.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} ]</option>);
			}
		}

		ReactDOM.render(<Select id='channel-parent' onSelected={this.onParentSelected.bind(this)} defaultValue={this.channel.parent ? this.channel.parentID : 'NONE'}>
			{categories}
		</Select>, chanContainer);
	}

	componentDidMount(): void {
		this.channel = this.props.channel;
		this.onInitialize();
	}

	componentDidUpdate(): void {
		this.channel = this.props.channel;
		this.onInitialize();
	}

	render(): JSX.Element {
		return <div id='voice-channel'>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-12'>
					<div id='container-channel-parent' />
				</div>
			</div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-3'>
					<Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='name...' />
					<Input id='channel-user-limit' onValidated={this.onChannelUserLimitChanged.bind(this)} placeholder='user limit...' />
				</div>
				<div className='col-md-3'>
					<Input id='channel-bitrate' onValidated={this.onChannelBitrateChanged.bind(this)} placeholder='bitrate...' />
				</div>
				<div className='col-md-3'>
					<button className='purple-btn large-btn'>Permissions</button>
				</div>
				<div className='col-md-3'>
					<button className='red-btn large-btn' onClick={this.onChannelDeleted.bind(this)}>Delete</button>
				</div>
			</div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-3'>
					<button style={{ height: '68px', width: '100%' }} className='purple-btn' onClick={this.onJoinLeaveClick.bind(this)}>Join / Leave</button>
				</div>
				<div className='col-md-3'>
					<Input id='channel-tts' placeholder='tts message...' multiline={true} style={{ height: '68px', width: '100%' }} />
				</div>
				<div className='col-md-6'>
					<Input id='channel-url' placeholder='file url...' />
					<input id='channel-file' type='file' />
				</div>
			</div>
		</div>;
	}
}