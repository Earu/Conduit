import * as React from 'react';
import { ConduitChannelProps } from '../../../utils/conduitProps';
import { TextChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { Checkbox } from '../../controls/checkbox';
import { GuildChannel } from 'discord.js';
import { ConduitEvent } from '../../../utils/conduitEvent';

declare module 'discord.js' {
    interface TextChannel {
        rateLimitPerUser: number;
    }
}

export class DashboardTextChannel extends React.Component<ConduitChannelProps<TextChannel>, {}> {
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
                    .then((c: TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s name');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
                    })
                    .catch(_ => input.value = this.props.channel.name);
            }
        } else {
            input.value = this.props.channel.name;
        }
    }

    private onChannelTopicChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        if (input.value) {
            if (!this.props.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
                input.value = this.props.channel.topic;
            } else {
                this.props.loader.load(this.props.channel.setTopic(input.value))
                    .then((c: TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s topic');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s topic`, c.guild);
                    })
                    .catch(_ => input.value = this.props.channel.topic);
            }
        }
    }

    private onChannelRateLimitChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;
        if (input.value) {
            if (!this.props.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
                input.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : '';
            } else {
                let regex: RegExp = /^(\d+)(\s*s)?$/;
                let matches: RegExpMatchArray = input.value.match(regex);
                if (matches && matches[1]) {
                    let limit: number = Number(matches[1]);
                    let oldLimit: number = this.props.channel.rateLimitPerUser;
                    this.props.loader.load(this.props.channel.setRateLimitPerUser(limit))
                        .then((c: TextChannel) => {
                            input.value = c.rateLimitPerUser > 0 ? `${c.rateLimitPerUser}s` : '';
                            this.props.logger.success('Changed selected channel\'s user rate-limit');
                            this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s user rate-limit [ \`${oldLimit}s\` -> \`${c.rateLimitPerUser}s\` ]`, c.guild);
                        })
                        .catch(_ => input.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : '');
                } else {
                    input.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : '';
                }
            }
        }
    }

    private onChannelMessageSent(): void {
        let input: HTMLInputElement = document.getElementById('channel-message') as HTMLInputElement;
        if (input.value) {
            this.props.loader.load(this.props.channel.send(input.value))
                .then(_ => this.props.logger.success(`Successfully sent a message to the selected channel and guild`));
            input.value = '';
        }
    }

    private onChannelNsfwChanged(state: boolean): void {
        let input: HTMLInputElement = document.getElementById('channel-nsfw') as HTMLInputElement;
        if (!this.props.channel.manageable) {
            this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
            input.checked = this.props.channel.nsfw;
        } else {
            let oldNsfw: boolean = this.props.channel.nsfw;
            this.props.loader.load(this.props.channel.setNSFW(state, ''))
                .then((c: TextChannel) => {
                    this.props.logger.success(`Set selected channel\'s nsfw state to ${state}`);
                    this.props.reporter.reportGuildAction(`Changed channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)'s nsfw state [ \`${oldNsfw}\` -> \`${c.nsfw}\` ]`, c.guild);
                })
                .catch(_ => {
                    input.checked = this.props.channel.nsfw;
                });
        }
    }

    private onChannelDelete(): void {
        if (!this.props.channel.deletable) {
            this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
        } else {
            this.props.loader.load(this.props.channel.delete())
                .then((c: GuildChannel) => {
                    this.props.logger.success(`Deleted selected channel`);
                    this.onChannelDeletion.trigger();
                    this.props.reporter.reportGuildAction(`Deleted channel \`${c.name} [ ${c.type} ]\` (**${c.id}**)`, c.guild);
                });
        }
    }

    private onInitialize(): void {
        let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        let topicInput: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        let rtInput: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;

        nameInput.value = this.props.channel.name;
        topicInput.value = this.props.channel.topic;
        rtInput.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : ''
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
                    <Input id='channel-topic' onValidated={this.onChannelTopicChanged.bind(this)} placeholder='topic...' />
                </div>
                <div className='col-md-3'>
                    <Input id='channel-rate-limit' onValidated={this.onChannelRateLimitChanged.bind(this)} placeholder=' slowmode (in seconds)...' />
                    <Checkbox id='channel-nsfw' name='NSFW' defaultValue={this.props.channel.nsfw} onChange={this.onChannelNsfwChanged.bind(this)} />
                </div>
                <div className='col-md-3'>
                    <button style={{ width: '100%', padding: '0', height: '32px', marginBottom: '5px' }} className='purple-btn'>Permissions</button>
                    <button style={{ width: '100%', padding: '0', height: '32px' }} className='purple-btn'>Webhooks</button>
                </div>
                <div className='col-md-3'>
                    <button style={{ height: '68px', width: '100%' }} className='red-btn' onClick={this.onChannelDelete.bind(this)}>Delete</button>
                </div>
            </div>
            <div className='row' style={{ padding: '5px' }}>
                <div className='col-md-12'>
                    <Input id='channel-message' onValidated={this.onChannelMessageSent.bind(this)} placeholder='message...' />
                    <input id='channel-file' type='file' />
                </div>
            </div>
        </div>;
    }
}