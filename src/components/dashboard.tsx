import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitProps';
import { DashboardHeader } from './dashboardHeader';
import { DashboardPanel } from './dashboardPanel';

export class Dashboard extends React.Component<ConduitProps, {}> {
    render(): JSX.Element {
        return <div id='dashboard'>
            <DashboardHeader client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
            <div className='row'>
                <div className='col-md-4'>
                    <DashboardPanel title='GUILDS' client={this.props.client} logger={this.props.logger} loader={this.props.loader}>
                    </DashboardPanel>
                </div>
                <div className='col-md-4'>
                    <DashboardPanel title='SCRIPTS' client={this.props.client} logger={this.props.logger} loader={this.props.loader}>
                    </DashboardPanel>
                </div>
                <div className='col-md-4'>
                    <DashboardPanel title='CONSOLE' client={this.props.client} logger={this.props.logger} loader={this.props.loader}>
                    </DashboardPanel>
                </div>
            </div>
        </div>
    }
}