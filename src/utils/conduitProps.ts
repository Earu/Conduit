import * as Discord from 'discord.js';

import { Logger } from './logger';
import { Loader } from './loader';
import { ActionReporter } from './actionReporter';
import { RestClient } from '../http/restClient';

export interface ConduitProps {
	client: Discord.Client;
	logger: Logger;
	loader: Loader;
}

export interface ConduitGuildSubPanelProps extends ConduitProps {
	guild: Discord.Guild;
	reporter: ActionReporter;
	restClient: RestClient;
	onLayoutInvalidated?: () => void;
}

export interface ConduitChannelProps<T extends Discord.GuildChannel> extends ConduitProps {
	channel: T;
	reporter: ActionReporter;
	onLayoutInvalidated?: () => void;
}