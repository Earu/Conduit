import { ConduitChannelProps } from '../../../utils/conduitProps';
import * as React from 'react';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { Channel, GuildChannel, VoiceChannel } from 'discord.js';

export class DashboardVoiceChannel extends React.Component<ConduitChannelProps<VoiceChannel>, {}> {
	private onChannelDeletion: ConduitEvent<void>;
	private channel: VoiceChannel;

	constructor(props: ConduitChannelProps<VoiceChannel>) {
		super(props);

		this.onChannelDeletion = new ConduitEvent();
		this.channel = props.channel;
		if (props.onDeletion) {
			this.onChannelDeletion.on(props.onDeletion);
		}

		props.client
			.on('channelDelete', (c: Channel) => this.onChannelX(c, () => {
				if (c.id === this.channel.id) {
					this.onChannelDeletion.trigger();
				}
			}))
			.on('channelUpdate', (c: Channel) => this.onChannelX(c, () => {
				this.channel = c as VoiceChannel;
				this.onInitialize();
			}));
	}

	private onChannelX(c: Channel, callback: () => void) {
		if (c.type === 'dm' || c.type === 'group') return;
		let guildChan: GuildChannel = c as GuildChannel;
		if (guildChan.guild.id === this.channel.guild.id) {
			callback();
		}
	}

	private onChannelNameChanged(): void {
		let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		if (input.value) {
			if (!this.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.channel.name;
			} else {
				let oldName: string = this.channel.name;
				this.props.loader.load(this.channel.setName(input.value))
					.then((c: VoiceChannel) => {
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
						.then((c: VoiceChannel) => {
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
						.then((c: VoiceChannel) => {
							input.value = `${c.bitrate}kbps`;
							this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s bitratee [ \`${oldBitrate}\` -> \`${c.bitrate}\` ]`, c.guild);
						})
						.catch(_ => input.value = `${this.channel.bitrate}kbps`);
				}
			}
		} else {
			input.value = `${this.channel.bitrate}kbps`;
		}
	}

	private onChannelDelete(): void {
		if (!this.channel.deletable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			this.props.loader.load(this.channel.delete())
				.then((c: VoiceChannel) => {
					this.props.logger.success(`Deleted selected channel`);
					this.onChannelDeletion.trigger();
					this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
				});
		}
	}

	/*private onJoinLeaveClick(): void {
		let vcon: VoiceConnection = this.channel.guild.voiceConnection;
		if (vcon && vcon.channel.id === this.channel.id) {
			this.channel.leave();
			this.props.logger.success(`Disconnected from voice channel \`${this.channel.name} [ ${this.channel.type} ]\` (**${this.channel.id}**)`);
		} else {
			if (this.channel.joinable) {
				this.props.loader.load(this.channel.join())
					.then((con: VoiceConnection) => {
						this.props.logger.success(`Connected to voice channel \`${con.channel.name} [ ${con.channel.type} ]\` (**${con.channel.id}**)`);
					});
			} else {
				this.props.logger.error('You cannot join this voice channel');
			}
		}
	}*/

	private onInitialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		let userLimitInput: HTMLInputElement = document.getElementById('channel-user-limit') as HTMLInputElement;
		let bitrateInput: HTMLInputElement = document.getElementById('channel-bitrate') as HTMLInputElement;
		if (!nameInput || !userLimitInput || !bitrateInput) return;

		nameInput.value = this.channel.name;
		userLimitInput.value = this.channel.userLimit > 0 ? `${this.channel.userLimit} max. users` : '';
		bitrateInput.value = `${this.channel.bitrate}kbps`;
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
		return <div>
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
					<button className='red-btn large-btn' onClick={this.onChannelDelete.bind(this)}>Delete</button>
				</div>
			</div>
			{/*
			<div className='row' style={{ padding: '5px' }}>
                <div className='col-md-3'>
					<button style={{ height: '68px', width: '100%' }} className='purple-btn' onClick={this.onJoinLeaveClick.bind(this)}>Join / Leave</button>
                </div>
				<div className='col-md-3'>
					<Input id='channel-tts' placeholder='tts message...' multiline={true} style={{ height: '68px', width: '100%' }}/>
				</div>
				<div className='col-md-6'>
					<Input id='channel-url' placeholder='file url...' />
					<input id='channel-file' type='file' />
				</div>
            </div>
			*/}
		</div>;
	}
}