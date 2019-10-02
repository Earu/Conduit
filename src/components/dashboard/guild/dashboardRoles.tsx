import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from '../../../utils/conduitProps';
import { Select } from '../../controls/select';
import { Input } from '../../controls/input';

export class DashboardRoles extends React.Component<ConduitGuildSubPanelProps, {}> {
	private loadRole(roleId: string): void {
		let roleContainer: HTMLElement = document.getElementById('role');
		if (!roleContainer) return;

		let role: Discord.Role = this.props.guild.roles.find((r: Discord.Role) => r.id === roleId && !r.deleted);
		if (role) {
			ReactDOM.render(<div className='row'>
				<Input id='role-name' placeholder='name...' />
			</div>, roleContainer);
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
			<div id='role' style={{ padding: '5px', paddingBottom: '0px' }} />
		</div>;
	}
}