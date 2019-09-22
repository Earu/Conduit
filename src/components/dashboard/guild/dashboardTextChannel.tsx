import * as React from 'react';
import { ConduitProps } from '../../../utils/conduitProps';
import { TextChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { ActionReporter } from '../../../utils/actionReporter';

declare module 'discord.js' {
	interface TextChannel {
		rateLimitPerUser: number;
	}
}

export interface DashboardTextChannelProps extends ConduitProps {
    channel: TextChannel;
    reporter: ActionReporter;
}

export class DashboardTextChannel extends React.Component<DashboardTextChannelProps, {}> {
    private onChannelNameChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        if (input.value) {
            if (!this.props.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
            } else {
                let oldName: string = this.props.channel.name;
                this.props.loader.load(this.props.channel.setName(input.value))
                    .then((c: TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s name');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name}\` (**${c.id}**)'s name [ \`${oldName}\` -> \`${c.name}\` ]`, c.guild);
                    });
            }
        }
    }

    private onChannelTopicChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        if (input.value) {
            if (!this.props.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
            } else {
                this.props.loader.load(this.props.channel.setTopic(input.value))
                    .then((c: TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s topic');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name}\` (**${c.id}**)'s topic`, c.guild);
                    });
            }
        }
    }

    private onChannelRateLimitChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;
        if (input.value) {
            if (!this.props.channel.manageable) {
                this.props.logger.error('You do not have the \'MANAGE_CHANNEL\' permission in the selected guild');
            } else {
                let oldLimit: number = this.props.channel.rateLimitPerUser;
                this.props.loader.load(this.props.channel.setRateLimitPerUser(Number(input.value)))
                    .then((c: TextChannel) => {
                        this.props.logger.success('Changed selected channel\'s user rate-limit');
                        this.props.reporter.reportGuildAction(`Changed channel \`${c.name}\` (**${c.id}**)'s user rate-limit [ \`${oldLimit}s\` -> \`${c.rateLimitPerUser}s\` ]`, c.guild);
                    });
            }
        }
    }

    private onInitialize(): void {
        let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        let topicInput: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        let rtInput: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;

        nameInput.value = this.props.channel.name;
        topicInput.value = this.props.channel.topic;
        if (this.props.channel.rateLimitPerUser > 0) {
            rtInput.value = this.props.channel.rateLimitPerUser.toString();
        }
    }

    componentDidMount(): void {
        this.onInitialize();
    }

    componentDidUpdate(): void {
        this.onInitialize();
    }

    render(): JSX.Element {
        return <div className='row'>
            <div className='col-md-3'>
                <Input id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='channel name...' />
                <Input id='channel-topic' onValidated={this.onChannelTopicChanged.bind(this)} placeholder='channel topic...' />
            </div>
            <div className='col-md-3'>
                <Input id='channel-rate-limit' onValidated={this.onChannelRateLimitChanged.bind(this)} placeholder='channel slowmode (in seconds)...' />
                <input type='checkbox' />
            </div>
        </div>;
    }
}