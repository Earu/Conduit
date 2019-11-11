import * as React from 'react'

export interface ColorPickerProps {
	id: string;
	color: string;
	validateChange: (color: string) => Promise<boolean>;
	failedChange: () => string;
	style?: React.CSSProperties;
}

export class ColorPicker extends React.Component<ColorPickerProps, {}> {
	private setColor(color: string): void {
		color = color === '0' ? '99AAB5' : color; // default discord role color
		let picker: HTMLElement = document.getElementById(this.props.id);
		let input: HTMLInputElement = picker.getElementsByTagName('input')[0];
		let display: HTMLDivElement = picker.getElementsByTagName('div')[0];

		input.value = color;
		display.style.backgroundColor = `#${color}`;
	}

	private onClick(_: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		let picker: HTMLElement = document.getElementById(this.props.id);
		let input: HTMLInputElement = picker.getElementsByTagName('input')[0];
		input.click();
	}

	private async onChange(_: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		let picker: HTMLElement = document.getElementById(this.props.id);
		let input: HTMLInputElement = picker.getElementsByTagName('input')[0];
		let change: boolean = await this.props.validateChange(input.value);
		if (change) {
			this.setColor(input.value);
		} else {
			let color: string = this.props.failedChange()
			this.setColor(color);
		}
	}

	componentDidMount(): void {
		this.setColor(this.props.color);
	}

	componentDidUpdate(): void {
		this.setColor(this.props.color);
	}

	render(): JSX.Element {
		return <div id={this.props.id} style={this.props.style}>
			<input type='color' onChange={this.onChange.bind(this)} style={{ display: 'none' }} />
			<div onClick={this.onClick.bind(this)} style={{
				backgroundColor: this.props.color,
				height: '100%',
				width: '100%',
				border: '1px solid black',
				display: 'inline-block',
			}} />
		</div>;
	}
}