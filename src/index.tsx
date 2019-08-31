import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { Login } from './components/login';
import { Loader } from './components/loader';
import { Dashboard } from './components/dashboard';

let client = new Discord.Client();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', console.log);

ReactDOM.render(
    <div>
        <Login client={client}/>
        <Dashboard client={client}/>
        <Loader />
    </div>,
    document.getElementById('root')
);