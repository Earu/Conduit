import { ConduitChannelProps } from '../../../utils/conduitProps';
import * as React from 'react';
import { VoiceChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { ConduitEvent } from '../../../utils/conduitEvent';

export class DashboardVoiceChannel extends React.Component<ConduitChannelProps<VoiceChannel>, {}> {
    private onChannelDeletion: ConduitEvent<void>;

    constructor (props: any) {
        super(props);

        this.onChannelDeletion = new ConduitEvent();
        if (this.props.onDeletion) {
            this.onChannelDeletion.on(this.props.onDeletion);
        }
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
                    .then((c: VoiceChannel) => {
                        this.props.logger.success('Changed selected channel\'s name');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
                    })
                    .catch(_ => input.value = this.props.channel.name);
            }
        } else {
            input.value = this.props.channel.name;
        }
	}

	private onChannelUserLimitChanged(): void {
		let input: HTMLInputElement = document.getElementById('channel-user-limit') as HTMLInputElement;
		if (input.value) {
			if (!this.props.channel.manageable) {
				this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
				input.value = this.props.channel.userLimit > 0 ? `${this.props.channel.userLimit} max users` : '';
			} else {
				let regex: RegExp = /^(\d+)(\s*max\s*users)?$/;
				let matches: RegExpMatchArray = input.value.match(regex);
				if (matches && matches[1]) {
					let limit = Number(matches[1]);
                    let oldLimit: number = this.props.channel.userLimit;
                    this.props.loader.load(this.props.channel.setUserLimit(limit))
                        .then((c: VoiceChannel) => {
                            input.value = c.userLimit > 0 ? `${c.userLimit} max users` : '';
							this.props.logger.success('Changed selected channel\'s user limit');
							let oldLimitDisplay: string = oldLimit === 0 ? 'inf' : `${oldLimit} max users`;
							let newLimitDisplay: string = c.userLimit === 0 ? 'inf' : `${c.userLimit} max users`;
                            this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s user limit [ \`${oldLimitDisplay}\` -> \`${newLimitDisplay}\` ]`, c.guild);
                        })
                        .catch(_ => input.value = this.props.channel.userLimit > 0 ? `${this.props.channel.userLimit} max users` : '');
				} else {
					input.value = this.props.channel.userLimit > 0 ? `${this.props.channel.userLimit} max users` : '';
				}
			}
		}
	}

	private onChannelDelete(): void {
        if (!this.props.channel.deletable) {
            this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
        } else {
            this.props.loader.load(this.props.channel.delete())
                .then((c: VoiceChannel) => {
                    this.props.logger.success(`Deleted selected channel`);
                    this.onChannelDeletion.trigger();
                    this.props.reporter.reportGuildAction(`Deleted channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)`, c.guild);
                });
        }
    }

	private onInitialize(): void {
		let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
		let userLimitInput: HTMLInputElement = document.getElementById('channel-user-limit') as HTMLInputElement;

		nameInput.value = this.props.channel.name;
		userLimitInput.value = this.props.channel.userLimit > 0 ? `${this.props.channel.userLimit} max users` : '';
    }

    componentDidMount(): void {
        this.onInitialize();
    }

    componentDidUpdate(): void {
        this.onInitialize();
	}

	render(): JSX.Element {
		return <div>
			<div className='row' style={{ padding: '5px' }}>
				<div className='col-md-3'>
					<Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='name...' />
					<Input id='channel-user-limit' onValidated={this.onChannelUserLimitChanged.bind(this)} placeholder='user limit...'/>
				</div>
				<div className='col-md-3'>
                    <button style={{ height: '68px', width: '100%' }} className='purple-btn' onClick={this.onChannelDelete.bind(this)}>Permissions</button>
                </div>
				<div className='col-md-3'>
                    <button style={{ height: '68px', width: '100%' }} className='red-btn' onClick={this.onChannelDelete.bind(this)}>Delete</button>
                </div>
			</div>
		</div>;
	}
}