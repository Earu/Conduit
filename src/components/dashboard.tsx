import * as React from 'react';
import { ConduitProps } from '../interfaces/conduitProps';
import { DashboardHeader } from './dashboardHeader';
import { DashboardPanel } from './dashboardPanel';
import { DashboardConsole } from './dashboardConsole';
import { DashboardGuilds } from './dashboardGuilds';

export class Dashboard extends React.Component<ConduitProps, {}> {
    render(): JSX.Element {
        return <div id='dashboard'>
            <DashboardHeader client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
            <div className='row'>
                <div className='col-md-6'>
                    <DashboardPanel title='GUILDS'>
                        <DashboardGuilds client={this.props.client} logger={this.props.logger} loader={this.props.loader}/>
                    </DashboardPanel>
                </div>
                <div className='col-md-6'>
                    <DashboardPanel title='SCRIPTS'>
                    </DashboardPanel>
                </div>
                <div className='col-md-12'>
                    <DashboardPanel title='CONSOLE'>
                        <DashboardConsole client={this.props.client} logger={this.props.logger} loader={this.props.loader}/>
                    </DashboardPanel>
                </div>
            </div>
        </div>
    }
}