import * as Discord from 'discord.js';
import { Logger } from '../utils/logger';

export interface ConduitProps { client: Discord.Client; logger: Logger }