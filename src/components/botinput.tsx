import * as React from 'react';

export interface BotInputProps {
    placeholder: string;
    id: string;
    onValidated: () => void;
}

export class BotInput extends React.Component<BotInputProps, {}> {
    private onChange(e: React.ChangeEvent<HTMLInputElement>){
        if (!e.target.value) {
            e.target.style.border = null;
        }
    }

    private onKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.which === 13) {
            this.props.onValidated();
        }
    }

    render(): JSX.Element {
        return <input onChange={this.onChange}
            className='bot-edit-input'
            id={this.props.id}
            type='text'
            onKeyPress={this.onKeyPress.bind(this)}
            placeholder={this.props.placeholder}/>
    }
}