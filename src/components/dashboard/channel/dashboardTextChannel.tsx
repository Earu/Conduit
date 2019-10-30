import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitChannelProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { Checkbox } from '../../controls/checkbox';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { HttpClient, HttpResult } from '../../../http/httpClient';
import { Select } from '../../controls/select';
import { SelectHelper } from '../../../utils/selectHelper';

export class DashboardTextChannel extends React.Component<ConduitChannelProps<Discord.TextChannel>, {}> {
    private static registeredEvents: boolean = false;

    private onChannelDeletion: ConduitEvent<void>;
    private httpClient: HttpClient;
    private channel: Discord.TextChannel;

    constructor(props: ConduitChannelProps<Discord.TextChannel>) {
        super(props);

        this.onChannelDeletion = new ConduitEvent();
        this.httpClient = new HttpClient();
        this.channel = props.channel;
        if (props.onLayoutInvalidated) {
            this.onChannelDeletion.on(props.onLayoutInvalidated);
        }

        if (!DashboardTextChannel.registeredEvents) {
            props.client
                .on('channelCreate', this.onChannelCreate.bind(this))
                .on('channelDelete', this.onChannelDelete.bind(this))
                .on('channelUpdate', (_, c: Discord.Channel) => this.onChannelUpdate(c));
            DashboardTextChannel.registeredEvents = true;
        }
    }

    private onChannelCreate(c: Discord.Channel): void {
        if (this.isValidChannel(c) && c.type === 'category') {
            let cat: Discord.CategoryChannel = c as Discord.CategoryChannel;
            SelectHelper.tryAddValue('channel-parent', cat.id, `${cat.name} [ ${cat.id} ]`, this.onParentSelected.bind(this));
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
                this.channel = c as Discord.TextChannel;
                this.initialize();
            } else if (c.type === 'category') {
                let cat: Discord.CategoryChannel = c as Discord.CategoryChannel;
                SelectHelper.tryChangeOptionText('channel-parent', cat.id, `${cat.name} [ ${cat.id} ]`);
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
        if (document.getElementById('text-channel')) return true;

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
                    .then((c: Discord.TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s name');
                        this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
                    })
                    .catch(_ => input.value = this.channel.name);
            }
        } else {
            input.value = this.channel.name;
        }
    }

    private onChannelTopicChanged(): void {
        if (!this.isCurrentChannelValid()) return;

        let input: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        if (input.value) {
            if (!this.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
                input.value = this.channel.topic;
            } else {
                this.props.loader.load(this.channel.setTopic(input.value))
                    .then((c: Discord.TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s topic');
                        this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s topic`, c.guild);
                    })
                    .catch(_ => input.value = this.channel.topic);
            }
        }
    }

    private onChannelRateLimitChanged(): void {
        if (!this.isCurrentChannelValid()) return;

        let input: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;
        if (input.value) {
            if (!this.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
                input.value = this.channel.rateLimitPerUser > 0 ? `${this.channel.rateLimitPerUser}s` : '';
            } else {
                let regex: RegExp = /^(\d+)(\s*s)?$/;
                let matches: RegExpMatchArray = input.value.match(regex);
                if (matches && matches[1]) {
                    let limit: number = Number(matches[1]);
                    let oldLimit: number = this.channel.rateLimitPerUser;
                    this.props.loader.load(this.channel.setRateLimitPerUser(limit))
                        .then((c: Discord.TextChannel) => {
                            input.value = c.rateLimitPerUser > 0 ? `${c.rateLimitPerUser}s` : '';
                            this.props.logger.success('Changed selected channel\'s user rate-limit');
                            this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s user rate-limit [ \`${oldLimit}s\` -> \`${c.rateLimitPerUser}s\` ]`, c.guild);
                        })
                        .catch(_ => input.value = this.channel.rateLimitPerUser > 0 ? `${this.channel.rateLimitPerUser}s` : '');
                } else {
                    input.value = this.channel.rateLimitPerUser > 0 ? `${this.channel.rateLimitPerUser}s` : '';
                }
            }
        }
    }

    private onChannelMessageSent(): void {
        if (!this.isCurrentChannelValid()) return;
        if (!this.channel.memberPermissions(this.props.client.user).has('SEND_MESSAGES')) {
            this.props.logger.error(`You do not have the \'SEND_MESSAGE\' permission for the selected channel`);
            return;
        }

        let input: HTMLInputElement = document.getElementById('channel-message') as HTMLInputElement;
        let fileInput: HTMLInputElement = document.getElementById('channel-file') as HTMLInputElement;
        let file: File = fileInput.files[0];
        if (file) {
            let form: FormData = new FormData();
            form.append('file', file.slice(), file.name);
            if (input.value) {
                form.append('payload_json', JSON.stringify({ content: input.value, tts: false, embed: null }));
            }

            this.props.loader.load(this.httpClient.post(`https://discordapp.com/api/channels/${this.channel.id}/messages`, form, {
                'Authorization': `Bot ${this.props.client.token}`,
            })).then((res: HttpResult) => {
                if (res.isSuccess) {
                    this.props.logger.success(`Successfully sent a message to the selected channel and guild`);
                } else {
                    let obj = res.asObject<{ message?: string }>();
                    if (obj.message) {
                        this.props.logger.error(obj.message);
                    } else {
                        this.props.logger.error('Could not send a message to the selected channel and guild');
                    }
                }

                input.value = '';
                fileInput.value = '';
            });
        } else if (input.value) {
            this.props.loader.load(this.channel.send(input.value))
                .then(_ => {
                    this.props.logger.success(`Successfully sent a message to the selected channel and guild`);
                    input.value = '';
                    fileInput.value = '';
                });
        }

    }

    private onChannelNsfwChanged(state: boolean): void {
        if (!this.isCurrentChannelValid()) return;

        let input: HTMLInputElement = document.getElementById('channel-nsfw') as HTMLInputElement;
        if (!this.channel.manageable) {
            this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
            input.checked = this.channel.nsfw;
        } else {
            let oldNsfw: boolean = this.channel.nsfw;
            this.props.loader.load(this.channel.setNSFW(state))
                .then((c: Discord.TextChannel) => {
                    this.props.logger.success(`Set selected channel\'s nsfw state to ${state}`);
                    this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s nsfw state [ \`${oldNsfw}\` -> \`${c.nsfw}\` ]`, c.guild);
                })
                .catch(_ => {
                    input.checked = this.channel.nsfw;
                });
        }
    }

    private onChannelDeleted(): void {
        if (!this.isCurrentChannelValid()) return;

        if (!this.channel.deletable) {
            this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
        } else {
            this.props.loader.load(this.channel.delete())
                .then((c: Discord.GuildChannel) => {
                    this.props.logger.success(`Deleted selected channel`);
                    this.onChannelDeletion.trigger();
                    this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
                });
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
                    .then((c: Discord.TextChannel) => {
                        this.props.logger.success(`Changed selected channel's category`);
                        let report: string = `Moved ${this.props.reporter.formatChannel(c)} out of ${this.props.reporter.formatChannel(oldParent)}`;
                        this.props.reporter.reportGuildAction(report, c.guild);
                    })
                    .catch(_ => SelectHelper.trySetValue('channel-parent', this.channel.parent ? this.channel.parentID : 'NONE'));
            } else {
                let parent: Discord.GuildChannel = this.channel.guild.channels.find((c: Discord.GuildChannel) => c.id === value);
                if (!parent) return;

                this.props.loader.load(this.channel.setParent(parent))
                    .then((c: Discord.TextChannel) => {
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

    private initialize(): void {
        let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        let topicInput: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        let rtInput: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;
        let nsfwInput: HTMLInputElement = document.getElementById('channel-nsfw') as HTMLInputElement;
        let chanContainer: HTMLElement = document.getElementById('container-channel-parent');
        if (!nameInput || !topicInput || !rtInput || !nsfwInput || !chanContainer) return;

        nameInput.value = this.channel.name;
        topicInput.value = this.channel.topic ? this.channel.topic : '';
        rtInput.value = this.channel.rateLimitPerUser > 0 ? `${this.channel.rateLimitPerUser}s` : '';
        nsfwInput.checked = this.channel.nsfw;

        let chans: Discord.Collection<string, Discord.GuildChannel> = this.channel.guild.channels.filter((c: Discord.GuildChannel) => c.type === 'category');
        let categories: Array<JSX.Element> = [];
        categories.push(<option key={`${this.channel.id}_NONE`} value='NONE'>no category</option>);
        if (chans.size > 0) {
            for (let item of chans) {
                let c: Discord.GuildChannel = item[1];
                if (c.deleted) continue;
                categories.push(<option key={`${this.channel.id}_${c.id}`} value={c.id}>{c.name} [ {c.id} ]</option>);
            }
        }

        ReactDOM.render(<Select id='channel-parent' onSelected={this.onParentSelected.bind(this)} defaultValue={this.channel.parent ? this.channel.parentID : 'NONE'}>
            {categories}
        </Select>, chanContainer);
    }

    componentDidMount(): void {
        this.channel = this.props.channel;
        this.initialize();
    }

    componentDidUpdate(): void {
        this.channel = this.props.channel;
        this.initialize();
    }

    render(): JSX.Element {
        return <div id='text-channel'>
            <div className='row' style={{ padding: '5px' }}>
                <div className='col-md-12'>
                    <div id='container-channel-parent' />
                </div>
            </div>
            <div className='row' style={{ padding: '5px' }}>
                <div className='col-md-3'>
                    <Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='name...' />
                    <Input id='channel-topic' onValidated={this.onChannelTopicChanged.bind(this)} placeholder='topic...' />
                </div>
                <div className='col-md-3'>
                    <Input id='channel-rate-limit' onValidated={this.onChannelRateLimitChanged.bind(this)} placeholder=' slowmode (in seconds)...' />
                    <Checkbox id='channel-nsfw' name='NSFW' defaultValue={this.channel.nsfw} onChange={this.onChannelNsfwChanged.bind(this)} />
                </div>
                <div className='col-md-3'>
                    <button style={{ marginBottom: '5px' }} className='purple-btn small-btn'>Permissions</button>
                    <button className='purple-btn small-btn'>Webhooks</button>
                </div>
                <div className='col-md-3'>
                    <button className='red-btn large-btn' onClick={this.onChannelDeleted.bind(this)}>Delete</button>
                </div>
            </div>
            <div className='row' style={{ padding: '5px', paddingBottom: '10px' }}>
                <div className='col-md-12'>
                    <Input id='channel-message' onValidated={this.onChannelMessageSent.bind(this)} placeholder='message...' />
                    <input id='channel-file' type='file' />
                </div>
            </div>
        </div>;
    }
}