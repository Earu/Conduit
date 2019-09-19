import * as React from 'react';
import { ConduitProps } from '../../../interfaces/conduitProps';
import { TextChannel } from 'discord.js';

export interface DashboardTextChannelProps extends ConduitProps {
    channel: TextChannel;
}

export class DashboardTextChannel extends React.Component<DashboardTextChannelProps, {}> {
    render(): JSX.Element {
        return <div>
            awdawd
        </div>;
    }
}