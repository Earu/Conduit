import { ConduitChannelProps } from '../../../utils/conduitProps';
import * as React from 'react';
import { CategoryChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { GuildChannel } from 'discord.js';
import { Select } from '../../controls/select';
import { Collection } from 'discord.js';

export class DashboardCategoryChannel extends React.Component<ConduitChannelProps<CategoryChannel>, {}> {
	private onChannelDeletion: ConduitEvent<void>;
	private childrenChannels: Collection<string, GuildChannel> ;
	private nonChildrenChannels: Collection<string, GuildChannel> ;

	private chanIdToRemove: string;
	private chanIdToAdd: string;

	constructor(props: any) {
		super(props);

		this.onChannelDeletion = new ConduitEvent();
		this.childrenChannels = this.getChannels(true);
		this.nonChildrenChannels = this.getChannels(false);

		this.chanIdToAdd = this.nonChildrenChannels.first().id;
		this.chanIdToRemove = this.childrenChannels.first().id;

		if (this.props.onDeletion) {
			this.onChannelDeletion.on(this.props.onDeletion);
		}
	}

	private getChannels(inCat: boolean): Collection<string, GuildChannel>  {
		if (inCat) {
			return this.props.channel.children;
		} else {
			return this.props.channel.guild.channels
				.filter((c: GuildChannel) => c.type != 'category' && (!c.parent || c.parent.id != this.props.channel.id));
		}
	}

	private async deleteChildren(): Promise<void> {
		let action: string = 'Deleted channels:\n';
		for (let item of this.props.channel.children) {
			let chan: GuildChannel = item[1];
			if (!chan.deletable) continue;

			try {
				chan.delete();
				action += `- \`${this.props.reporter.formatChannel(chan)}\n`;
			} catch (err) {
				this.props.logger.error(`Could not delete channel [ ${chan.id} ]`)
			}
		}

		this.props.reporter.reportGuildAction(action, this.props.channel.guild);
	}

	private onChannelNameChanged(): void {
		let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		if (input.value) {
			if (!this.props.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.props.channel.name;
			} else {
				let oldName: string = this.props.channel.name;
				this.props.loader.load(this.props.channel.setName(input.value))
					.then((c: CategoryChannel) => {
						this.props.logger.success('Changed selected channel\'s name');
						this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
					})
					.catch(_ => input.value = this.props.channel.name);
			}
		} else {
			input.value = this.props.channel.name;
		}
	}

	private onChannelDelete(): void {
		if (!this.props.channel.deletable) {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		} else {
			this.props.loader.load(this.props.channel.delete())
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
				this.props.loader.load(this.props.channel.delete())
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
		let chan: GuildChannel = this.props.channel.children.find((c: GuildChannel) => c.id === this.chanIdToRemove);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(null))
				.then((c: GuildChannel) => {
					this.props.logger.success(`Successfully removed selected channel from category`);
					this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} out of ${this.props.reporter.formatChannel(this.props.channel)}`, this.props.channel.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		}
	}

	private onChannelNonChildrenAdded(): void {
		let chan: GuildChannel = this.props.channel.guild.channels.find((c: GuildChannel) => c.id === this.chanIdToAdd);
		if (!chan) return;

		if (chan.manageable) {
			this.props.loader.load(chan.setParent(this.props.channel))
				.then((c: GuildChannel) => {
					this.props.logger.success(`Successfully added selected channel to category`);
					this.props.reporter.reportGuildAction(`Moved ${this.props.reporter.formatChannel(c)} to ${this.props.reporter.formatChannel(this.props.channel)}`, this.props.channel.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
		}
	}

	private onInitialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		nameInput.value = this.props.channel.name;
	}

	componentDidMount(): void {
		this.childrenChannels = this.getChannels(true);
		this.nonChildrenChannels = this.getChannels(false);

		this.chanIdToAdd = this.nonChildrenChannels.first().id;
		this.chanIdToRemove = this.childrenChannels.first().id;
		this.onInitialize();
	}

	componentDidUpdate(): void {
		this.childrenChannels = this.getChannels(true);
		this.nonChildrenChannels = this.getChannels(false);

		this.chanIdToAdd = this.nonChildrenChannels.first().id;
		this.chanIdToRemove = this.childrenChannels.first().id;
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
					<button style={{  marginBottom: '5px' }} className='red-btn small-btn' onClick={this.onChannelDelete.bind(this)}>Delete Category</button>
					<button className='red-btn small-btn' onClick={this.onChannelChildrenDelete.bind(this)}>Delete All</button>
				</div>
			</div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-6'>
					<Select id='channel-children' onSelected={this.onChannelChildrenSelected.bind(this)}>
						{this.childrenChannels.map((g: GuildChannel) => <option key={g.id} value={g.id}>{g.name} [ {g.type} ]</option>)}
					</Select>
					<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelChildrenRemoved.bind(this)}>
						Remove Channel
					</button>
				</div>
				<div className='col-md-6'>
					<Select id='channel-not-children' onSelected={this.onChannelNotChildrenSelected.bind(this)}>
						{this.nonChildrenChannels.map((g: GuildChannel) => <option key={g.id} value={g.id}>{g.name} [ {g.type} ]</option>)}
					</Select>
					<button style={{ marginTop: '5px', marginBottom: '5px' }} className='purple-btn small-btn' onClick={this.onChannelNonChildrenAdded.bind(this)}>
						Add Channel
					</button>
				</div>
			</div>
		</div>;
	}
}