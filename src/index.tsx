import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';
import { Router, Route } from 'react-router';
import { createBrowserHistory } from 'history'

const client = new Discord.Client();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', console.log);

import { Login } from './components/login';
import { Loader } from './components/loader';
import { Dashboard } from './components/dashboard';

ReactDOM.render(
    <div>
        <Router history={createBrowserHistory()}>
            <Route path='/' exact><Login client={client} /></Route>
            <Route path='/login'><Login client={client} /></Route>
            <Route path='dashboard'><Dashboard client={client} /></Route>
        </Router>
        <Loader />
    </div>,
    document.getElementById('root')
);