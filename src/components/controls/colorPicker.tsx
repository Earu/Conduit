import * as React from 'react'

import { BlockPicker } from 'react-color'

export interface ColorPickerProps {
	id: string;
	color: string;
}

export interface ColorPickerState {
	displayColorPicker: boolean,
	background: string,
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
	constructor(props: any){
		super(props);

		this.state = {
			displayColorPicker: false,
			background: '#fff',
		};
	}

	private onClick(): void {
		this.setState({
			displayColorPicker: !this.state.displayColorPicker,
			background: this.state.background,
		});
	}

	private onClose(): void {
		this.setState({
			displayColorPicker: false,
			background: this.state.background,
		});
	}

	private onChange(color: any): void {
		this.setState({
			displayColorPicker: this.state.displayColorPicker,
			background: color.hex,
		});
	}

	componentDidUpdate(): void {
		this.setState({
			displayColorPicker: false,
			background: this.props.color,
		});
	}

	render(): JSX.Element {
		let popOver: React.CSSProperties = {
			position: 'absolute',
			zIndex: 2,
		};

		let cover: React.CSSProperties = {
			position: 'fixed',
			top: '0px',
			right: '0px',
			bottom: '0px',
			left: '0px',
		};

		return <div>
			<button id={this.props.id}
				onClick={this.onClick.bind(this)}
				style={{ border: 'none', backgroundColor: this.state.background, color: 'white' }}>
				{this.state.background}
			</button>
			{this.state.displayColorPicker ? <div style={popOver}>
				<div style={cover} onClick={this.onClose.bind(this)} />
				<BlockPicker color={this.state.background} onChangeCompleted={this.onChange.bind(this)} />
			</div> : <div />}
		</div>
	}
}