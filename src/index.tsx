import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

const client = new Discord.Client();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', console.log);

import { Login } from './components/login';

ReactDOM.render(
    <Login client={client} />,
    document.getElementById('root')
);