import * as React from 'react';
import { ConduitChannelProps } from '../../../utils/conduitProps';
import { TextChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { Checkbox } from '../../controls/checkbox';
import { GuildChannel } from 'discord.js';
import { ConduitEvent } from '../../../utils/conduitEvent';
import { HttpClient, HttpResult } from '../../../utils/httpClient';

declare module 'discord.js' {
    interface TextChannel {
        rateLimitPerUser: number;
    }
}

export class DashboardTextChannel extends React.Component<ConduitChannelProps<TextChannel>, {}> {
    private onChannelDeletion: ConduitEvent<void>;
    private httpClient: HttpClient;

    constructor(props: any) {
        super(props);

        this.onChannelDeletion = new ConduitEvent();
        this.httpClient = new HttpClient();
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
                        this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
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
                        this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s topic`, c.guild);
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
                            this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s user rate-limit [ \`${oldLimit}s\` -> \`${c.rateLimitPerUser}s\` ]`, c.guild);
                        })
                        .catch(_ => input.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : '');
                } else {
                    input.value = this.props.channel.rateLimitPerUser > 0 ? `${this.props.channel.rateLimitPerUser}s` : '';
                }
            }
        }
    }

    private fileToBinary(file: File): Promise<string> {
        return new Promise(resolve => {
            let fileReader: FileReader = new FileReader();
            fileReader.onload = () => {
                let arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
                let array: Uint8Array = new Uint8Array(arrayBuffer);
                resolve(String.fromCharCode.apply(null, array))
            };

            fileReader.readAsArrayBuffer(file);
        });
    }

    private onChannelMessageSent(): void {
        let input: HTMLInputElement = document.getElementById('channel-message') as HTMLInputElement;
        let fileInput: HTMLInputElement = document.getElementById('channel-file') as HTMLInputElement;
        let file: File = fileInput.files[0];
        if (file) {
            let form: FormData = new FormData();
            form.append('file', file.slice(), file.name);
            if (input.value) {
                form.append('payload_json', JSON.stringify({ content: input.value, tts: false, embed: null }));
            }

            this.props.loader.load(this.httpClient.post(`https://discordapp.com/api/channels/${this.props.channel.id}/messages`, form, {
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
            this.props.loader.load(this.props.channel.send(input.value))
                .then(_ => {
                    this.props.logger.success(`Successfully sent a message to the selected channel and guild`);
                    input.value = '';
                    fileInput.value = '';
                });
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
                    this.props.reporter.reportGuildAction(`Changed ${this.props.reporter.formatChannel(c)}'s nsfw state [ \`${oldNsfw}\` -> \`${c.nsfw}\` ]`, c.guild);
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
                    this.props.reporter.reportGuildAction(`Deleted ${this.props.reporter.formatChannel(c)}`, c.guild);
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
                    <button style={{ marginBottom: '5px' }} className='purple-btn small-btn'>Permissions</button>
                    <button className='purple-btn small-btn'>Webhooks</button>
                </div>
                <div className='col-md-3'>
                    <button className='red-btn large-btn' onClick={this.onChannelDelete.bind(this)}>Delete</button>
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