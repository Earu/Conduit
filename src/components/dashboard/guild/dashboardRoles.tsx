import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from '../../../utils/conduitProps';
import { Select } from '../../controls/select';
import { Input } from '../../controls/input';

export class DashboardRoles extends React.Component<ConduitGuildSubPanelProps, {}> {
	private initializeRole(role: Discord.Role): void {
		role.color
	}

	private loadRole(roleId: string): void {
		let roleContainer: HTMLElement = document.getElementById('role');
		let role: Discord.Role = this.props.guild.roles.find((r: Discord.Role) => r.id === roleId && !r.deleted);
		if (role) {
			ReactDOM.render(<div className='row'>
				<div className='col-md-3'>
					<Input id='role-name' placeholder='name...' style={{ display: 'inline-block', width: '75%', marginLeft: '5%' }} />
				</div>
				<div className='col-md-3' />
				<div className='col-md-3'>
					<button className='purple-btn small-btn'>Permissions</button>
				</div>
				<div className='col-md-3'>
					<button className='red-btn small-btn'>Delete</button>
				</div>
			</div>, roleContainer);

			this.initializeRole(role);
		} else {
			ReactDOM.render(<div />, roleContainer);
		}
	}

	private renderRoles(): JSX.Element {
		let roles: Discord.Collection<string, Discord.Role> = this.props.guild.roles.filter((r: Discord.Role) => !r.deleted);
		if (roles.size > 0) {
			let roleId: string = roles.first().id;
			let opts: Array<JSX.Element> = roles.map((r: Discord.Role) => <option key={`${this.props.guild.id}_${r.id}`} value={r.id}>{r.name} [ {r.hexColor} ]</option>);

			return <div>
				<Select id='guild-role' defaultValue={roleId} onSelected={this.loadRole.bind(this)}>{opts}</Select>
				<hr style={{ marginBottom: '0px' }} />
			</div>;
		} else {
			return <div />
		}
	}

	private postRender(): void {
		let select: HTMLSelectElement = document.getElementById('guild-role') as HTMLSelectElement;
		if (select) {
			this.loadRole(select.value);
		} else {
			ReactDOM.render(<div />, document.getElementById('role'));
		}
	}

	componentDidMount(): void {
		this.postRender();
	}

	componentDidUpdate(): void {
		this.postRender();
	}

	render(): JSX.Element {
		return <div>
			<div style={{ padding: '10px', paddingBottom: '0px' }}>
				<div className='row'>
					<div className='col-md-12'>
						{this.renderRoles()}
					</div>
				</div>
			</div>
			<div id='role' style={{ padding: '10px', paddingBottom: '5px' }} />
		</div>;
	}
}