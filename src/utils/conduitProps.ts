import * as Discord from 'discord.js';
import { Logger } from './logger';
import { Loader } from './loader';
import { TextChannel } from 'discord.js';
import { ActionReporter } from './actionReporter';
import { GuildChannel } from 'discord.js';

export interface ConduitProps {
    client: Discord.Client;
    logger: Logger;
    loader: Loader;
}

export interface ConduitChannelProps<T extends GuildChannel> extends ConduitProps {
    channel: T;
    reporter: ActionReporter;
    onDeletion?: () => void;
}