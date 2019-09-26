import { ConduitChannelProps } from '../../../utils/conduitProps';
import * as React from 'react';
import { CategoryChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { GuildChannel } from 'discord.js';
import { Select } from '../../controls/select';
import { Collection } from 'discord.js';
import { SelectHelper } from '../../../utils/selectHelper';
import { Channel } from 'discord.js';

export class DashboardCategoryChannel extends React.Component<ConduitChannelProps<CategoryChannel>, {}> {
	private onChannelDeletion: ConduitEvent<void>;
	private childrenChannels: Collection<string, GuildChannel>;
	private nonChildrenChannels: Collection<string, GuildChannel>;

	private category: CategoryChannel;
	private chanIdToRemove: string;
	private chanIdToAdd: string;

	constructor(props: any) {
		super(props);

		this.onChannelDeletion = new ConduitEvent();
		this.category = this.props.channel;

		if (this.props.onDeletion) {
			this.onChannelDeletion.on(this.props.onDeletion);
		}

		this.props.client
			.on('channelDelete', (c: Channel) => {
				if (c.id === this.category.id) {
					this.onChannelDeletion.trigger();
				}
			})
			.on('channelUpdate', (_, c: Channel) => {
				if (c.id === this.category.id) {
					this.category = c as CategoryChannel;
					this.updateChannels();
					this.onInitialize();
				}
			});
	}

	private updateChannels() {
		this.childrenChannels = this.getChannels(true);
		this.nonChildrenChannels = this.getChannels(false);

		let chanToAdd: GuildChannel = this.nonChildrenChannels.first();
		let chanToRemove: GuildChannel = this.childrenChannels.first();

		if (chanToAdd) {
			this.chanIdToAdd = chanToAdd.id;
			let opts = this.nonChildrenChannels.map((c: GuildChannel) => {
				let opt: HTMLOptionElement = document.createElement('option');
				opt.value = c.id;
				opt.textContent = `${c.name} [ ${c.type} ]`;
				return opt;
			});
			SelectHelper.trySetOptions('channel-not-children', opts, this.onChannelNotChildrenSelected.bind(this));
		} else {
			this.chanIdToAdd = null;
		}

		if (chanToRemove) {
			this.chanIdToRemove = chanToRemove.id;
			let opts = this.childrenChannels.map((c: GuildChannel) => {
				let opt: HTMLOptionElement = document.createElement('option');
				opt.value = c.id;
				opt.textContent = `${c.name} [ ${c.type} ]`;
				return opt;
			});
			SelectHelper.trySetOptions('channel-children', opts, this.onChannelChildrenSelected.bind(this));
		} else {
			this.chanIdToRemove = null;
		}

	}

	private getChannels(inCat: boolean): Collection<string, GuildChannel> {
		if (inCat) {
			return this.category.children;
		} else {
			return this.category.guild.channels
				.filter((c: GuildChannel) => c.type != 'category' && (!c.parent || c.parent.id != this.category.id));
		}
	}

	private async deleteChildren(): Promise<void> {
		let action: string = 'Deleted channels:\n';
		for (let item of this.category.children) {
			let chan: GuildChannel = item[1];
			if (!chan.deletable) continue;

			try {
				chan.delete();
				action += `- \`${this.props.reporter.formatChannel(chan)}\n`;
			} catch (err) {
				this.props.logger.error(`Could not delete channel [ ${chan.id} ]`)
			}
		}

		this.props.reporter.reportGuildAction(action, this.category.guild);
	}

	private onChannelNameChanged(): void {
		let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		if (input.value) {
			if (!this.category.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.category.name;
			} else {
				let oldName: string = this.category.name;
				this.props.loader.load(this.category.setName(input.value))
					.then((c: CategoryChannel) => {
						this.props.logger.success('Changed selected channel\'s name');
						this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
					})
					.catch(_ => input.value = this.category.name);
			}
		} else {
			input.value = this.category.name;
		}
	}

	private onChannelDelete(): void {
		if (!this.category.deletable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			this.props.loader.load(this.category.delete())
				.then((c: CategoryChannel) => {
					this.props.logger.success(`Deleted selected channel`);
					this.onChannelDeletion.trigger();
					this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
				});
		}
	}

	private onChannelChildrenDelete(): void {
		this.props.loader.load(this.deleteChildren())
			.then(() => {
				this.props.loader.load(this.category.delete())
					.then((c: CategoryChannel) => {
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

		let chan: GuildChannel = this.category.children.find((c: GuildChannel) => c.id === this.chanIdToRemove);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(null))
				.then((c: GuildChannel) => {
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

		let chan: GuildChannel = this.category.guild.channels.find((c: GuildChannel) => c.id === this.chanIdToAdd);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(this.category))
				.then((c: GuildChannel) => {
					this.updateChannels();
					this.props.logger.success(`Successfully added selected channel to category`);
					this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} to ${this.props.reporter.formatChannel(this.category)}`, this.category.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		}
	}

	private onInitialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		nameInput.value = this.category.name;
	}

	componentDidMount(): void {
		this.updateChannels();
		this.onInitialize();
	}

	componentDidUpdate(): void {
		this.updateChannels();
		this.onInitialize();
	}

	render(): JSX.Element {
		return <div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-3'>
					<Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='name...' />
				</div>
				<div className='col-md-3' />
				<div className='col-md-3'>
					<button className='purple-btn large-btn'>Permissions</button>
				</div>
				<div className='col-md-3'>
					<button style={{ marginBottom: '5px' }} className='red-btn small-btn' onClick={this.onChannelDelete.bind(this)}>Delete Category</button>
					<button className='red-btn small-btn' onClick={this.onChannelChildrenDelete.bind(this)}>Delete All</button>
				</div>
			</div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-6'>
					<Select id='channel-children' onSelected={this.onChannelChildrenSelected.bind(this)} />
					<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelChildrenRemoved.bind(this)}>
						Remove Channel
					</button>
				</div>
				<div className='col-md-6'>
					<Select id='channel-not-children' onSelected={this.onChannelNotChildrenSelected.bind(this)} />
					<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelNonChildrenAdded.bind(this)}>
						Add Channel
					</button>
				</div>
			</div>
		</div>;
	}
}