import * as React from 'react';

export interface CheckboxProps {
	id: string;
	name: string;
	defaultValue: boolean;
	onChange: (state: boolean) => void;
}

export class Checkbox extends React.Component<CheckboxProps> {
	private onChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.onChange(e.target.checked);
	}

	render(): JSX.Element {
		return <div className='pretty p-switch p-fill'>
			<input id={this.props.id} type='checkbox' defaultChecked={this.props.defaultValue} onChange={this.onChange.bind(this)} />
			<div className='state p-danger'>
				<label>{this.props.name}</label>
			</div>
		</div>;
	}
}