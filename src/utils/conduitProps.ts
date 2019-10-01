import * as Discord from 'discord.js';

import { Logger } from './logger';
import { Loader } from './loader';
import { ActionReporter } from './actionReporter';

export interface ConduitProps {
    client: Discord.Client;
    logger: Logger;
    loader: Loader;
}

export interface ConduitChannelProps<T extends Discord.GuildChannel> extends ConduitProps {
    channel: T;
    reporter: ActionReporter;
    onUpdateRequested?: () => void;
}