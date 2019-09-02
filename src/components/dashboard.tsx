import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from '../interfaces/conduitprops';
import { BotInput } from './botinput';
import { Select } from './select';
import { DashboardInfo } from './dashboardinfo';

export class Dashboard extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);
    }

    private onBotClose(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.props.loader.load(this.props.client.destroy())
            .then(_ => this.props.logger.success('Disconnected'));
        let dashboard: HTMLElement = document.getElementById('dashboard');
        let form: HTMLElement = document.getElementById('token-form');
        dashboard.style.display = 'none';
        form.style.display = 'block';
    }

    render(): JSX.Element {
        return <div className='container' id='dashboard'>
            <div className='dashboard-header'>
                <h1 className='title'>CONDUIT</h1>
                <button onClick={this.onBotClose.bind(this)} id='disconnect-btn'>X</button>
            </div>
            <DashboardInfo client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
        </div>;
    }
}