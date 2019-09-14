import * as React from 'react';

export interface DashboardPanelProps { title: string }

export class DashboardPanel extends React.Component<DashboardPanelProps, {}> {
    render(): JSX.Element {
        return <div className='dashboard-panel'>
            <div className='dashboard-header'>
                <span className='title'>{this.props.title}</span>
            </div>
            <div className='content'>
                {this.props.children}
            </div>
        </div>;
    }
}