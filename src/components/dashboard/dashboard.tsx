import * as React from 'react';
import { ConduitProps } from '../../interfaces/conduitProps';
import { DashboardHeader } from './header/dashboardHeader';
import { DashboardPanel } from './dashboardPanel';
import { DashboardConsole } from './dashboardConsole';
import { DashboardGuilds } from './guild/dashboardGuilds';

export class Dashboard extends React.Component<ConduitProps, {}> {
    render(): JSX.Element {
        return <div id='dashboard'>
            <DashboardHeader client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
            <div className='row' style={{ paddingBottom: '345px' }}>
                <div className='col-md-6'>
                    <DashboardPanel title='GUILDS' foldable={true}>
                        <DashboardGuilds client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
                    </DashboardPanel>
                </div>
                <div className='col-md-6'>
                    <DashboardPanel title='SCRIPTS' foldable={true}>
                    </DashboardPanel>
                </div>
                <div className='col-md-12'>
                    <DashboardPanel title='CONSOLE' foldable={true} style={{ position: 'fixed', bottom: '0px', width: '100%' }}>
                        <DashboardConsole client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
                    </DashboardPanel>
                </div>
            </div>
        </div>
    }
}