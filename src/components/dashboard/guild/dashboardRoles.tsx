import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitGuildSubPanelProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { ColorPicker } from '../../controls/colorPicker';

export class DashboardRoles extends React.Component<ConduitGuildSubPanelProps, {}> {
	private selectedRole: Discord.Role;

	private async valideColorChange(color: string): Promise<boolean> {
		if (!this.selectedRole) return false;

		try {
			await this.props.loader.load(this.selectedRole.setColor(color))
			return true;
		} catch {
			return false;
		}
	}

	private onColorChangeFail(): string {
		if (!this.selectedRole) return '000000';

		return this.selectedRole.color.toString(16);
	}

	private loadRole(roleId: string): void {
		let roleContainer: HTMLElement = document.getElementById('role');
		let role: Discord.Role = this.props.guild.roles.find((r: Discord.Role) => r.id === roleId && !r.deleted);
		if (role) {
			this.selectedRole = role;
			ReactDOM.render(<div className='row'>
				<div className='col-md-1'>
					<ColorPicker id='role-color' color={role.color.toString(16)} validateChange={this.valideColorChange.bind(this)}
						failedChange={this.onColorChangeFail} style={{ width: '100%', height: '32px' }} />
				</div>
				<div className='col-md-2'>
					<Input id='role-name' value={role.name} placeholder='name...' />
				</div>
				<div className='col-md-3' />
				<div className='col-md-3'>
					<button className='purple-btn small-btn'>Permissions</button>
				</div>
				<div className='col-md-3'>
					<button className='red-btn small-btn'>Delete</button>
				</div>
			</div>, roleContainer);
		} else {
			ReactDOM.render(<div />, roleContainer);
		}
	}

	private onRoleSelected(): void {
		let input: HTMLInputElement = document.getElementById('guild-role') as HTMLInputElement;
		if (input.value) {
			this.loadRole(input.value);
		}
	}

	private renderRoles(): JSX.Element {
		let roles: Discord.Collection<string, Discord.Role> = this.props.guild.roles.filter((r: Discord.Role) => !r.deleted);
		if (roles.size > 0) {
			let opts: Array<JSX.Element> = roles.map((r: Discord.Role) => <option key={`${this.props.guild.id}_${r.id}`} value={r.id}>{r.name} [ {r.hexColor} | {r.id} ]</option>);

			return <div>
				<Input id='guild-role' placeholder='role name or id...' onValidated={this.onRoleSelected.bind(this)} list='guild-roles'/>
				<datalist id='guild-roles'>{opts}</datalist>
				<hr style={{ marginBottom: '0px' }} />
			</div>;
		} else {
			return <div />;
		}
	}

	private postRender(): void {
		let input: HTMLInputElement = document.getElementById('guild-role') as HTMLInputElement;
		let roles: Discord.Collection<string, Discord.Role> = this.props.guild.roles.filter((r: Discord.Role) => !r.deleted);
		if (input && roles.size > 0) {
			input.value = roles.first().id;
			this.loadRole(input.value);
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