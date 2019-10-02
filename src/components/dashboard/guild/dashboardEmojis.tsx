import * as React from 'react';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from "../../../utils/conduitProps";
import { EmojiSelector } from '../../controls/emojiSelector';
import { Input } from '../../controls/input';

export class DashboardEmojis extends React.Component<ConduitGuildSubPanelProps, {}> {
	private selectedEmoji: Discord.Emoji;

	private onEmojiChange(emoji: Discord.Emoji): void {
		if (!emoji) return;

		this.selectedEmoji = emoji;
		let input: HTMLInputElement = document.getElementById('emoji-name') as HTMLInputElement;
		if (!input) return;

		input.value = emoji.name;
	}

	private onEmojiNameChange(): void {
		if (!this.isCurrentEmojiValid()) return;

		let input: HTMLInputElement = document.getElementById('emoji-name') as HTMLInputElement;
		if (input.value) {
			if (this.selectedEmoji.deletable) {
				let oldName: string = this.selectedEmoji.name;
				this.props.loader.load(this.selectedEmoji.setName(input.value))
					.then((e: Discord.Emoji) => {
						input.value = e.name;
						this.props.logger.success('Successfully changed the name of the selected emoji');
						this.props.reporter.reportGuildAction(`Changed emoji \`${e.name}\` (**${e.id}**)'s name [ \`${oldName}\` -> \`${e.name}]\``, this.props.guild);
					});
			} else {
				this.props.logger.error('You do not have the \'MANAGE_EMOJIS\' permission in the selected guild');
				input.value = this.selectedEmoji.name;
			}
		} else {
			input.value = this.selectedEmoji.name;
		}
	}

	private onEmojiDelete(): void {
		if (!this.isCurrentEmojiValid()) return;

		if (this.selectedEmoji.deletable) {
			this.props.loader.load(this.props.guild.deleteEmoji(this.selectedEmoji))
				.then(_ => {
					this.props.logger.success('Successfully deleted the selected emoji');
					this.props.reporter.reportGuildAction(`Deleted emoji \`${this.selectedEmoji.name}\` (**${this.selectedEmoji.id}**)`, this.props.guild);
				});
		} else {
			this.props.logger.error('You do not have the \'MANAGE_EMOJIS\' permission in the selected guild');
		}
	}

	private isCurrentEmojiValid(): boolean {
		if (!this.selectedEmoji) return false;
		if (this.selectedEmoji.deleted) return false;

		return this.selectedEmoji.guild.id === this.props.guild.id;
	}

	render(): JSX.Element {
		return <div>
			<div className='row'>
				<div className='col-md-12'>
					<EmojiSelector id='guild-emojis' guild={this.props.guild} onEmojiSelectedUpdate={this.onEmojiChange.bind(this)}
						onSelected={this.onEmojiChange.bind(this)} client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
					<hr style={{ marginBottom: '10px' }} />
				</div>
			</div>
			<div className='row'>
				<div className='col-md-6'>
					<Input id='emoji-name' onValidated={this.onEmojiNameChange.bind(this)} placeholder='name...' />
				</div>
				<div className='col-md-6'>
					<button className='red-btn small-btn' onClick={this.onEmojiDelete.bind(this)}>Delete</button>
				</div>
			</div>
		</div>;
	}
}