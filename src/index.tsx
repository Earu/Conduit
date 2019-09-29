import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Client } from 'discord.js';
import { Login } from './components/login';
import { Loader } from './components/loader';
import { Logger } from './utils/logger';
import { Loader as LoaderHelper } from './utils/loader';
import { Dashboard } from './components/dashboard/dashboard';
import { Header } from './components/header';
import { EventEmitter } from 'events';

const client: Client = new Client();
const logger: Logger = new Logger();
const loader: LoaderHelper = new LoaderHelper(logger);

EventEmitter.defaultMaxListeners = 20;

ReactDOM.render(
    <div>
        <Header/>
        <Login client={client} logger={logger} loader={loader}/>
        <Dashboard client={client} logger={logger} loader={loader}/>
        <Loader />
    </div>,
    document.getElementById('root')
);