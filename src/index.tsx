import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { Login } from './components/login';
import { Loader } from './components/loader';
import { DashboardHeader } from './components/dashboardHeader';
import { Logger } from './utils/logger';
import { Loader as LoaderHelper } from './utils/loader';

const client: Discord.Client = new Discord.Client();
const logger: Logger = new Logger();
const loader: LoaderHelper = new LoaderHelper(logger);

ReactDOM.render(
    <div>
        <Login client={client} logger={logger} loader={loader}/>
        <DashboardHeader client={client} logger={logger} loader={loader}/>
        <Loader />
    </div>,
    document.getElementById('root')
);