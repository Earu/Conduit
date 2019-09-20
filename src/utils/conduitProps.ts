import * as Discord from 'discord.js';
import { Logger } from './logger';
import { Loader } from './loader';

export interface ConduitProps {
    client: Discord.Client;
    logger: Logger;
    loader: Loader;
}