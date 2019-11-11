import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { Login } from './components/login';
import { Loader } from './components/loader';
import { Logger } from './utils/logger';
import { Loader as LoaderHelper } from './utils/loader';
import { Dashboard } from './components/dashboard/dashboard';
import { Header } from './components/header';
import { EventEmitter } from 'events';

const client: Discord.Client = new Discord.Client();
const logger: Logger = new Logger();
const loader: LoaderHelper = new LoaderHelper(logger);

EventEmitter.defaultMaxListeners = 20;
client.options.messageCacheMaxSize = 1;
client.options.messageCacheLifetime = 1;
client.options.ws.large_threshold = 1;
client.options.fetchAllMembers = false;
client.options.shardCount = 1;

// forgotten discord.js typings
declare module 'discord.js' {
    interface TextChannel {
        rateLimitPerUser: number;
        setNSFW(state: boolean, reason?: string): Promise<GuildChannel>;
    }

    interface Guild {
        deleted: boolean;
    }

    interface Channel {
        deleted: boolean;
    }

    interface Emoji {
        deleted: boolean;
    }

    interface Role {
        deleted: boolean;
    }
}

ReactDOM.render(<div>
    <Header />
    <Login client={client} logger={logger} loader={loader} />
    <Dashboard client={client} logger={logger} loader={loader} />
    <Loader />
</div>, document.getElementById('root'));