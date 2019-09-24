import * as React from 'react';

export interface InputProps {
    placeholder: string;
    id: string;
    onValidated?: () => void;
    onChange?: (value: string) => void;
    list?: string;
    style?: React.CSSProperties;
}

export class Input extends React.Component<InputProps, {}> {
    private onChange(e: React.ChangeEvent<HTMLInputElement>) {
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
        return <input onChange={this.onChange}
            className='bot-edit-input'
            id={this.props.id}
            type='text'
            onKeyPress={this.onKeyPress.bind(this)}
            placeholder={this.props.placeholder}
            list={this.props.list}
            style={this.props.style}/>;
    }
}