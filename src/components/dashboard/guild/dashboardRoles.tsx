import * as React from 'react';
import * as Discord from 'discord.js';

import { ConduitProps } from '../../../utils/conduitProps';
import { Select } from '../../controls/select';
import { ActionReporter } from '../../../utils/actionReporter';

export interface DashboardRolesProps extends ConduitProps {
	guild: Discord.Guild;
	reporter: ActionReporter;
}

export class DashboardRoles extends React.Component<DashboardRolesProps, {}> {
	private loadRole(roleId: string): void {

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