import * as Discord from 'discord.js';
import { Logger } from '../utils/logger';
import { Loader } from '../utils/loader';

export interface ConduitProps {
    client: Discord.Client;
    logger: Logger;
    loader: Loader;
}