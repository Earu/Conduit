import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { Login } from './components/login';
import { Loader } from './components/loader';
import { Dashboard } from './components/dashboard';
import { Logger } from './utils/logger';

const client: Discord.Client = new Discord.Client();
const logger: Logger = new Logger();

ReactDOM.render(
    <div>
        <Login client={client} logger={logger}/>
        <Dashboard client={client} logger={logger}/>
        <Loader />
    </div>,
    document.getElementById('root')
);