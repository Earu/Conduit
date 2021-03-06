import * as React from 'react';
import * as Discord from 'discord.js';

import { ConduitProps } from '../../utils/conduitProps';

export interface EmojiSelectorProps extends ConduitProps {
	id: string;
	guild: Discord.Guild;
	onEmojiSelectedUpdate?: (emoji: Discord.Emoji) => void;
	hideSelected?: boolean;
	onSelected: (emoji: Discord.Emoji) => void;
}

export class EmojiSelector extends React.Component<EmojiSelectorProps, {}> {
	private selectedEmoji: Discord.Emoji;

	constructor (props: EmojiSelectorProps) {
		super(props);

		this.selectedEmoji = null;
		props.client
			.on('emojiCreate', this.onEmojiCreate.bind(this))
			.on('emojiUpdate', (_, emoji: Discord.Emoji) => this.onEmojiUpdate(emoji))
			.on('emojiDelete', this.onEmojiDelete.bind(this));

	}

	private onEmojiCreate(emoji: Discord.Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let img: HTMLImageElement = this.findEmojiImage(emoji.id);
		if (img) return;

		let selector: HTMLElement = document.getElementById(this.props.id);
		img = document.createElement('img');
		img.alt = emoji.name;
		img.src = emoji.url;
		img.title = emoji.toString();
		img.id = emoji.id;
		img.onclick = _ => {
			if (!this.props.hideSelected) {
				if (this.selectedEmoji) {
					let oldImg: HTMLImageElement = this.findEmojiImage(this.selectedEmoji.id);
					if (oldImg) {
						oldImg.style.border = 'none';
					}
				}

				img.style.border = '3px solid #677bc4';
			}

			this.selectedEmoji = emoji;
			this.props.onSelected(this.selectedEmoji);
		};
		selector.appendChild(img);
	}

	private onEmojiUpdate(emoji: Discord.Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let img: HTMLImageElement = this.findEmojiImage(emoji.id);
		if (!img) return;

		img.alt = emoji.name;
		img.title = emoji.toString();
		img.src = emoji.url;

		if (emoji.id === this.selectedEmoji.id) {
			this.selectedEmoji = emoji;
			if (this.props.onEmojiSelectedUpdate) {
				this.props.onEmojiSelectedUpdate(emoji);
			}
		}
	}

	private onEmojiDelete(emoji: Discord.Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let img: HTMLImageElement = this.findEmojiImage(emoji.id);
		if (!img) return;

		let selector: HTMLElement = document.getElementById(this.props.id);
		selector.removeChild(img);
	}

	private isValidEmoji(emoji: Discord.Emoji): boolean {
		return this.isVisible() && emoji.guild.id === this.props.guild.id;
	}

	private isVisible(): boolean {
		if (document.getElementById(this.props.id)) return true;

		return false;
	}

	private findEmojiImage(emojiId: string): HTMLImageElement {
		let selector: HTMLElement = document.getElementById(this.props.id);
		for (let child of selector.children) {
			if (child.id === emojiId) {
				return child as HTMLImageElement;
			}
		}

		return null;
	}

	private onClick(e: React.MouseEvent<HTMLImageElement, MouseEvent>): void {
		let emojiId: string = e.currentTarget.id;
		let emoji: Discord.Emoji = this.props.guild.emojis.find((e: Discord.Emoji) => e.id === emojiId);
		if (!emoji) return;

		if (!this.props.hideSelected) {
			if (this.selectedEmoji) {
				let oldImg: HTMLImageElement = this.findEmojiImage(this.selectedEmoji.id);
				if (oldImg) {
					oldImg.style.border = 'none';
				}
			}

			e.currentTarget.style.border = '3px solid #677bc4';
		}

		this.selectedEmoji = emoji;
		this.props.onSelected(this.selectedEmoji);
	}

	private renderEmojis(): Array<JSX.Element> {
		let res: Array<JSX.Element> = [];
		if (!this.props.guild.emojis) {
			return res;
		}

		let selectedFirst: boolean = false;
		for (let item of this.props.guild.emojis) {
			let emoji: Discord.Emoji = item[1];
			if (emoji.deleted) continue;

			let style: React.CSSProperties = {};
			if (!selectedFirst) {
				selectedFirst = true;
				this.selectedEmoji = emoji;
				if (!this.props.hideSelected) {
					style.border = '3px solid #677bc4';
				}
			}

			res.push(<img key={emoji.id}
				id={emoji.id}
				src={emoji.url}
				alt={emoji.name}
				title={emoji.toString()}
				onClick={this.onClick.bind(this)}
				style={style} />);
		}

		this.props.onSelected(this.selectedEmoji);
		return res;
	}

	render(): JSX.Element {
		return <div id={this.props.id} className='emoji-selector'>
			{this.renderEmojis()}
		</div>
	}
}