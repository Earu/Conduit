import * as React from 'react';

export interface DashboardPanelProps {
	title: string;
	foldable?: boolean;
	style?: React.CSSProperties;
	id?: string;
}

export class DashboardPanel extends React.Component<DashboardPanelProps, {}> {
	private folded: boolean;

	constructor(props: any) {
		super(props);

		this.folded = false;
	}

	private onFoldClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
		let panel: HTMLElement = e.currentTarget.parentElement.parentElement;
		let content: HTMLDivElement = panel.getElementsByClassName('content')[0] as HTMLDivElement;

		if (!this.folded) {
			content.style.display = 'none';
			e.currentTarget.textContent = '▼'
			this.folded = true;
		} else {
			content.style.display = 'block';
			e.currentTarget.textContent = '▲'
			this.folded = false;
		}
	}

	render(): JSX.Element {
		return <div id={this.props.id} className='dashboard-panel' style={this.props.style}>
			<div className='dashboard-header'>
				<span className='title'>{this.props.title}</span>
				<button className='fold-btn'
					onClick={this.onFoldClick.bind(this)}
					style={{ display: this.props.foldable ? 'block' : 'none' }}>
					▲
				</button>
			</div>
			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
}