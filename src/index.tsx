import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

const client = new Discord.Client();

import { Login } from './components/Login';

ReactDOM.render(
    <Login client={client}/>,
    document.getElementById('root')
);