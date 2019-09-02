import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitProps';
import { DashboardHeaderInfo } from './dashboardHeaderInfo';

export class DashboardHeader extends React.Component<ConduitProps, {}> {
    private onBotClose(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.props.loader.load(this.props.client.destroy())
            .then(_ => this.props.logger.success('Disconnected'));
        let dashboard: HTMLElement = document.getElementById('dashboard');
        let form: HTMLElement = document.getElementById('token-form');
        dashboard.style.display = 'none';
        form.style.display = 'block';
    }

    render(): JSX.Element {
        return <div className='container' id='dashboard-header'>
            <div className='dashboard-header'>
                <h1 className='title'>CONDUIT</h1>
                <button onClick={this.onBotClose.bind(this)} id='disconnect-btn'>X</button>
            </div>
            <DashboardHeaderInfo client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
        </div>;
    }
}