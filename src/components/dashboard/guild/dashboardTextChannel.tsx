import * as React from 'react';
import { ConduitProps } from '../../../interfaces/conduitProps';
import { TextChannel } from 'discord.js';
import { BotInput } from '../../controls/botInput';

export interface DashboardTextChannelProps extends ConduitProps {
    channel: TextChannel;
}

export class DashboardTextChannel extends React.Component<DashboardTextChannelProps, {}> {
    private onChannelNameChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        if (input.value) {
            if (this.props.channel.manageable) {
                this.props.logger.success('You do not have the permission to manage the selected channel');
            } else {
                this.props.loader.load(this.props.channel.setName(input.value))
                    .then(_ => this.props.logger.success('Changed selected channel\'s name'));
            }
        }
    }

    private onChannelTopicChanged(): void {
        let input: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        if (input.value) {
            if (this.props.channel.manageable) {
                this.props.logger.success('You do not have the permission to manage the selected channel');
            } else {
                this.props.loader.load(this.props.channel.setTopic(input.value))
                    .then(_ => this.props.logger.success('Changed selected channel\'s topic'));
            }
        }
    }

    private onInitialize(): void {
        let nameInput: HTMLInputElement = document.getElementById('channel-name') as HTMLInputElement;
        let topicInput: HTMLInputElement = document.getElementById('channel-topic') as HTMLInputElement;
        let rtInput: HTMLInputElement = document.getElementById('channel-rate-limit') as HTMLInputElement;

        nameInput.value = this.props.channel.name;
        topicInput.value = this.props.channel.topic;
        //if (this.props.channel.)
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
                <BotInput id='channel-name' onValidated={this.onChannelNameChanged.bind(this)} placeholder='channel name...' />
                <BotInput id='channel-topic' onValidated={this.onChannelTopicChanged.bind(this)} placeholder='channel topic...' />
            </div>
            <div className='col-md-3'>
                <BotInput id='channel-rate-limit' onValidated={() => {}} placeholder='channel slowmode (in seconds)...' />
                <input type='checkbox' />
            </div>
        </div>;
    }
}