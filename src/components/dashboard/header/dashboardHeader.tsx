import * as React from 'react';
import { ConduitProps } from '../../../utils/conduitProps';
import { DashboardHeaderInfo } from './dashboardHeaderInfo';

export class DashboardHeader extends React.Component<ConduitProps, {}> {
    render(): JSX.Element {
        return <div className='container' id='dashboard-header'>
            <div className='dashboard-header'>
                <span className='title'>GENERAL</span>
            </div>
            <DashboardHeaderInfo client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
        </div>;
    }
}