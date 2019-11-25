import * as React from 'react';

import { ConduitProps } from '../../../utils/conduitProps';

export interface AvatarProps extends ConduitProps {
	id: string;
}

export class Avatar<T extends AvatarProps> extends React.Component<T, {}> {
	protected onValidated(fileType: string, base64: string): void {
		console.debug(`onValidated was not overriden!`);
	}

	private onClick(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
		let avatar: HTMLElement = document.getElementById(this.props.id);
		let fileInput: HTMLInputElement = avatar.getElementsByTagName('input')[0];
		fileInput.click();
	}

	private onChange(e: React.ChangeEvent<HTMLInputElement>): void {
		let fileReader: FileReader = new FileReader();
		let file: File = e.target.files[0];
		fileReader.onload = () => {
			let arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
			let array: Uint8Array = new Uint8Array(arrayBuffer);
			let base64: string = btoa(String.fromCharCode.apply(null, array));
			this.onValidated(file.type, base64);
		};

		fileReader.readAsArrayBuffer(file);
	}

	private onError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
		let avatar: HTMLElement = e.currentTarget.parentElement;
		let img: HTMLImageElement = avatar.getElementsByTagName('img')[0];
		let alt: HTMLSpanElement = avatar.getElementsByTagName('span')[0];

		img.style.display = 'none';
		alt.style.display = 'block';
	}

	render(): JSX.Element {
		return <div id={this.props.id} className='avatar-control'>
			<span />
			<img alt='avatar' onError={this.onError.bind(this)} />
			<button onClick={this.onClick.bind(this)}>Change Avatar</button>
			<input onChange={this.onChange.bind(this)} type='file' accept='image/png,image/jpeg' />
		</div>
	}
}