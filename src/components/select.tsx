import * as React from 'react';

export interface SelectProps {
    id: string;
    defaultValue?: string;
    onSelected: (value: string) => void;
}

export class Select extends React.Component<SelectProps, {}> {
    private lastValue: string;

    constructor(props: any) {
        super(props);

        if (this.props.defaultValue) {
            this.lastValue = this.props.defaultValue;
        } else {
            this.lastValue = '';
        }
    }

    private onClick(_: React.MouseEvent<HTMLSelectElement, MouseEvent>): void {
        let select: HTMLSelectElement = document.getElementById(this.props.id) as HTMLSelectElement;
        if (select.value !== this.lastValue) {
            this.props.onSelected(select.value);
            this.lastValue = select.value;
        }
    }

    render(): JSX.Element {
        return <div className='conduit-select'
            onClick={this.onClick.bind(this)}
            onMouseUp={this.onClick.bind(this)}
            onMouseDown={this.onClick.bind(this)}
            id={`parent-${this.props.id}`}>
        <select id={this.props.id}
            defaultValue={this.props.defaultValue}>
            {this.props.children}
        </select>
      </div>
    }
}