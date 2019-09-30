import * as React from 'react';
import { ConduitProps } from '../../../utils/conduitProps';
import { Guild, Emoji } from 'discord.js';


export interface DashboardEmojiSelectorProps extends ConduitProps {
	id: string;
	guild: Guild;
	onSelected: (emoji: Emoji) => void;
}

export class DashboardEmojiSelector extends React.Component<DashboardEmojiSelectorProps, {}> {
	private selectedEmoji: Emoji;

	constructor (props: DashboardEmojiSelectorProps) {
		super(props);

		this.selectedEmoji = null;
		props.client
			.on('emojiCreate', this.onEmojiCreate.bind(this))
			.on('emojiUpdate', (_, emoji: Emoji) => this.onEmojiUpdate(emoji))
			.on('emojiDelete', this.onEmojiDelete.bind(this));

	}

	private onEmojiCreate(emoji: Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let selector: HTMLElement = document.getElementById(this.props.id);
		let img: HTMLImageElement = document.createElement('img');
		img.style.display = 'inline-block';
		img.style.marginBottom = '5px';
		img.style.marginRight = '5px';
		img.alt = emoji.name;
		img.src = emoji.url;
		img.width = 32;
		img.id = emoji.id;
		img.onclick = _ => {
			img.style.border = '3px solid #677bc4';
			this.selectedEmoji = emoji;
			this.props.onSelected(this.selectedEmoji);
		};
		selector.appendChild(img);
	}

	private onEmojiUpdate(emoji: Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let img: HTMLImageElement = this.findEmojiImage(emoji.id);
		if (!img) return;

		img.alt = emoji.name;
		img.src = emoji.url;
	}

	private onEmojiDelete(emoji: Emoji): void {
		if (!this.isValidEmoji(emoji)) return;

		let img: HTMLImageElement = this.findEmojiImage(emoji.id);
		if (!img) return;

		let selector: HTMLElement = document.getElementById(this.props.id);
		selector.removeChild(img);
	}

	private isValidEmoji(emoji: Emoji): boolean {
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
		let emoji: Emoji = this.props.guild.emojis.find((e: Emoji) => e.id === emojiId);
		if (!emoji) return;

		if (this.selectedEmoji) {
			let oldImg: HTMLImageElement = this.findEmojiImage(this.selectedEmoji.id);
			if (oldImg) {
				oldImg.style.border = 'none';
			}
		}

		e.currentTarget.style.border = '3px solid #677bc4';
		this.selectedEmoji = emoji;
		this.props.onSelected(this.selectedEmoji);
	}

	private renderEmojis(): Array<JSX.Element> {
		let res: Array<JSX.Element> = [];
		let selectedFirst: boolean = false;
		for (let item of this.props.guild.emojis) {
			let emoji: Emoji = item[1];
			if (emoji.deleted) continue;

			let style: React.CSSProperties = {
				display: 'inline-block',
				marginBottom: '5px',
				marginRight: '5px',
			};

			if (!selectedFirst) {
				selectedFirst = true;
				style.border = '2px solid #677bc4';
				this.selectedEmoji = emoji;
			}

			res.push(<img key={emoji.id}
				id={emoji.id}
				src={emoji.url}
				alt={emoji.name}
				width='32px'
				onClick={this.onClick.bind(this)}
				style={style} />);
		}

		this.props.onSelected(this.selectedEmoji);
		return res;
	}

	render(): JSX.Element {
		return <div id={this.props.id}>
			{this.renderEmojis()}
		</div>
	}
}