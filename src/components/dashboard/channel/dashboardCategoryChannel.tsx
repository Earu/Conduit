import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitChannelProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { Select } from '../../controls/select';

export class DashboardCategoryChannel extends React.Component<ConduitChannelProps<Discord.CategoryChannel>, {}> {
	private static registeredEvents: boolean = false;

	private onChannelDeletion: ConduitEvent<void>;
	private childrenChannels: Array<Discord.GuildChannel>;
	private nonChildrenChannels: Array<Discord.GuildChannel>;

	private category: Discord.CategoryChannel;
	private chanIdToRemove: string;
	private chanIdToAdd: string;

	constructor(props: ConduitChannelProps<Discord.CategoryChannel>) {
		super(props);

		this.onChannelDeletion = new ConduitEvent();
		this.category = props.channel;

		if (props.onLayoutInvalidated) {
			this.onChannelDeletion.on(props.onLayoutInvalidated);
		}

		if (!DashboardCategoryChannel.registeredEvents) {
			props.client
				.on('channelDelete', this.onChannelDelete.bind(this))
				.on('channelUpdate', (_, c: Discord.Channel) => this.onChannelUpdate(c))
				.on('channelCreate', this.onChannelCreate.bind(this));
			DashboardCategoryChannel.registeredEvents = true;
		}
	}

	private onChannelDelete(c: Discord.Channel): void {
		if (this.isValidChannel(c) && c.id === this.category.id) {
			this.onChannelDeletion.trigger();
		}
	}

	private onChannelUpdate(c: Discord.Channel): void {
		if (this.isValidChannel(c)) {
			if (c.id === this.category.id) {
				this.category = c as Discord.CategoryChannel;
				this.initialize();
			}
			this.updateChannels();
		}
	}

	private onChannelCreate(c: Discord.Channel): void {
		if (this.isValidChannel(c)) {
			this.updateChannels();
		}
	}

	private isValidChannel(c: Discord.Channel) {
		if (!this.isVisible()) return false;
		if (c.type === 'dm' || c.type === 'group') return false;
		let guildChan: Discord.GuildChannel = c as Discord.GuildChannel;
		return guildChan.guild.id === this.category.guild.id;
	}

	private isVisible() {
		if (document.getElementById('category-channel')) return true;

		return false;
	}

	private updateChannels() {
		let containerAdd: HTMLElement = document.getElementById('container-channel-not-children');
		let containerRemove: HTMLElement = document.getElementById('container-channel-children');
		if (!containerAdd || !containerRemove) return;

		this.childrenChannels = this.getChannels(true);
		this.nonChildrenChannels = this.getChannels(false);

		let chanToAdd: Discord.GuildChannel = this.nonChildrenChannels[0];
		let chanToRemove: Discord.GuildChannel = this.childrenChannels[0];

		if (chanToAdd) {
			this.chanIdToAdd = chanToAdd.id;
			let opts: Array<JSX.Element> = this.nonChildrenChannels.map((c: Discord.GuildChannel) => <option key={`${this.category.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} | {c.id} ]</option>);

			ReactDOM.render(<div>
				<Select id='channel-not-children' onSelected={this.onChannelNotChildrenSelected.bind(this)}>{opts}</Select>
				<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelNonChildrenAdded.bind(this)}>
					Add Channel
				</button>
			</div>, containerAdd);

		} else {
			this.chanIdToAdd = null;
			ReactDOM.render(<div />, containerAdd);
		}

		if (chanToRemove) {
			this.chanIdToRemove = chanToRemove.id;
			let opts: Array<JSX.Element> = this.childrenChannels.map((c: Discord.GuildChannel) => <option key={`${this.category.id}_${c.id}`} value={c.id}>{c.name} [ {c.type} | {c.id} ]</option>);

			ReactDOM.render(<div>
				<Select id='channel-children' onSelected={this.onChannelChildrenSelected.bind(this)}>{opts}</Select>
				<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelChildrenRemoved.bind(this)}>
					Remove Channel
				</button>
			</div>, containerRemove);
		} else {
			this.chanIdToRemove = null;
			ReactDOM.render(<div />, containerRemove);
		}
	}

	private getChannels(inCat: boolean): Array<Discord.GuildChannel> {
		let res: Array<Discord.GuildChannel> = [];
		for (let item of this.category.guild.channels) {
			let chan: Discord.GuildChannel = item[1];
			if (chan.deleted || chan.type === 'category') continue;
			if (inCat) { // could be simplified but confusing to read
				if (chan.parentID === this.category.id) {
					res.push(chan);
				}
			} else {
				if (chan.parentID !== this.category.id) {
					res.push(chan);
				}
			}
		}

		return res;
	}

	private async deleteChildren(): Promise<void> {
		let action: string = 'Deleted channels:\n';
		for (let item of this.category.children) {
			let chan: Discord.GuildChannel = item[1];
			if (!chan.deletable || chan.deleted) continue;

			try {
				await chan.delete();
				action += `- ${this.props.reporter.formatChannel(chan)}\n`;
			} catch (err) {
				this.props.logger.error(`Could not delete channel [ ${chan.id} ]`)
			}
		}

		this.props.reporter.reportGuildAction(action, this.category.guild);
	}

	private onChannelNameChanged(): void {
		if (!this.isCurrentChannelValid()) return;

		let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		if (input.value) {
			if (!this.category.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.category.name;
			} else {
				let oldName: string = this.category.name;
				this.props.loader.load(this.category.setName(input.value))
					.then((c: Discord.CategoryChannel) => {
						this.props.logger.success('Changed selected channel\'s name');
						this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
					})
					.catch(_ => input.value = this.category.name);
			}
		} else {
			input.value = this.category.name;
		}
	}

	private onChannelDeleted(): void {
		if (!this.isCurrentChannelValid()) return;

		if (!this.category.deletable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			this.props.loader.load(this.category.delete())
				.then((c: Discord.CategoryChannel) => {
					this.props.logger.success(`Deleted selected channel`);
					this.onChannelDeletion.trigger();
					this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
				});
		}
	}

	private onChannelChildrenDeleted(): void {
		if (!this.isCurrentChannelValid()) return;

		this.props.loader.load(this.deleteChildren())
			.then(() => {
				this.props.loader.load(this.category.delete())
					.then((c: Discord.CategoryChannel) => {
						this.props.logger.success(`Deleted selected channel`);
						this.onChannelDeletion.trigger();
						this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
					});
			});
	}

	private onChannelChildrenSelected(chanId: string): void {
		this.chanIdToRemove = chanId;
	}

	private onChannelNotChildrenSelected(chanId: string): void {
		this.chanIdToAdd = chanId;
	}

	private onChannelChildrenRemoved(): void {
		if (!this.chanIdToRemove) return;
		if (!this.isCurrentChannelValid()) return;

		let chan: Discord.GuildChannel = this.category.guild.channels.find((c: Discord.GuildChannel) => c.id === this.chanIdToRemove);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(null))
				.then((c: Discord.GuildChannel) => {
					this.updateChannels();
					this.props.logger.success(`Successfully removed selected channel from category`);
					this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} out of ${this.props.reporter.formatChannel(this.category)}`, this.category.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		}
	}

	private onChannelNonChildrenAdded(): void {
		if (!this.chanIdToAdd) return;
		if (!this.isCurrentChannelValid()) return;

		let chan: Discord.GuildChannel = this.category.guild.channels.find((c: Discord.GuildChannel) => c.id === this.chanIdToAdd);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(this.category))
				.then((c: Discord.GuildChannel) => {
					this.updateChannels();
					this.props.logger.success(`Successfully added selected channel to category`);
					this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} to ${this.props.reporter.formatChannel(this.category)}`, this.category.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		}
	}

	private isCurrentChannelValid(): boolean {
        if (!this.category) return false;
        if (this.category.deleted) return false;

        return true;
    }

	private initialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		nameInput.value = this.category.name;
	}

	componentDidMount(): void {
		this.category = this.props.channel;
		this.updateChannels();
		this.initialize();
	}

	componentDidUpdate(): void {
		this.category = this.props.channel;
		this.updateChannels();
		this.initialize();
	}

	render(): JSX.Element {
		return <div id='category-channel'>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-3'>
					<Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='name...' />
				</div>
				<div className='col-md-3' />
				<div className='col-md-3'>
					<button className='purple-btn large-btn'>Permissions</button>
				</div>
				<div className='col-md-3'>
					<button style={{ marginBottom: '5px' }} className='red-btn small-btn' onClick={this.onChannelDeleted.bind(this)}>Delete Category</button>
					<button className='red-btn small-btn' onClick={this.onChannelChildrenDeleted.bind(this)}>Delete All</button>
				</div>
			</div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-6'>
					<div id='container-channel-children' />
				</div>
				<div className='col-md-6'>
					<div id='container-channel-not-children' />
				</div>
			</div>
		</div>;
	}
}