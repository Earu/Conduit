import * as React from 'react';

export interface SelectProps {
    id: string;
    defaultValue: string;
    onSelected: (value: string) => void;
    width: string;
}

export class Select extends React.Component<SelectProps, {}> {
    private lastValue: string;

    constructor(props: any) {
        super(props);

        this.lastValue = this.props.defaultValue;
    }

    private onClick(_: React.MouseEvent<HTMLSelectElement, MouseEvent>): void {
        let select: HTMLSelectElement = document.getElementById(this.props.id) as HTMLSelectElement;
        if (select.value !== this.lastValue) {
            this.props.onSelected(select.value);
            this.lastValue = select.value;
        }
    }

    render(): JSX.Element {
        return <div className='custom-select'
            onClick={this.onClick.bind(this)}
            onMouseUp={this.onClick.bind(this)}
            onMouseDown={this.onClick.bind(this)}
            style={{width: this.props.width}}
            id={`parent-${this.props.id}`}>
        <select id={this.props.id}
            defaultValue={this.props.defaultValue}>
            {this.props.children}
        </select>
      </div>
    }
}