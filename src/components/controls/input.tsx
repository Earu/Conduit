import * as React from 'react';

export interface InputProps {
    placeholder: string;
    id: string;
    onValidated?: () => void;
    onChange?: (value: string) => void;
    multiline?: boolean;
    list?: string;
    value?: string;
    style?: React.CSSProperties;
}

export class Input extends React.Component<InputProps, {}> {
    private style: React.CSSProperties;

    constructor (props: InputProps) {
        super(props);

        if (!props.style) {
            this.style = { resize: 'none' };
        } else {
            this.style = props.style;
            this.style.resize = 'none';
        }
    }

    private onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.value) {
            e.target.style.border = null;
        }
    }

    private onTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
        if (!e.target.value) {
            e.target.style.border = null;
        }
    }

    private onKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (this.props.onChange) {
            this.props.onChange(e.currentTarget.value);
        }

        if (e.which === 13 && this.props.onValidated) {
            this.props.onValidated();
        }
    }

    render(): JSX.Element {
        if (this.props.multiline) {
            return <textarea onChange={this.onTextAreaChange}
                className='bot-edit-input'
                id={this.props.id}
                onKeyPress={this.onKeyPress.bind(this)}
                placeholder={this.props.placeholder}
                value={this.props.value}
                style={this.style} />;
        } else {
            return <input onChange={this.onInputChange}
                className='bot-edit-input'
                id={this.props.id}
                type='text'
                onKeyPress={this.onKeyPress.bind(this)}
                placeholder={this.props.placeholder}
                list={this.props.list}
                value={this.props.value}
                style={this.style} />;
        }
    }
}