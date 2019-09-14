import * as React from 'react';

export interface SelectProps {
    id: string;
    defaultValue?: string;
    onSelected: (value: string) => void;
}

export class Select extends React.Component<SelectProps, {}> {
    private static addedHandler: boolean = false;

    private lastValue: string;

    constructor(props: any) {
        super(props);

        if (this.props.defaultValue) {
            this.lastValue = this.props.defaultValue;
        } else {
            this.lastValue = '';
        }

        if (!Select.addedHandler) {
            document.addEventListener('click', () => this.closeSelect(null, document.getElementsByClassName('select-items'), document.getElementsByClassName('select-selected')));
            Select.addedHandler = true;
        }
    }

    private onSelected(value: string): void {
        if (value !== this.lastValue) {
            this.props.onSelected(value);
            this.lastValue = value;
        }
    }

    private closeSelect(item: Element, selectItems: HTMLCollectionOf<Element>, selectSelectedItems: HTMLCollectionOf<Element>): void {
        let indexes: Array<number> = [];
        for (let i: number = 0; i < selectSelectedItems.length; i++) {
            if (item == selectSelectedItems[i]) {
                indexes.push(i);
            } else {
                selectSelectedItems[i].classList.remove('select-arrow-active');
            }
        }
        for (let i: number = 0; i < selectItems.length; i++) {
            if (indexes.indexOf(i)) {
                selectItems[i].classList.add('select-hide');
            }
        }
    }

    componentDidMount(): void {
        let parent: HTMLDivElement = document.getElementById(`parent-${this.props.id}`) as HTMLDivElement;
        let select: HTMLSelectElement = document.getElementById(this.props.id) as HTMLSelectElement;

        let a: HTMLDivElement = document.createElement('div');
        a.setAttribute('class', 'select-selected');
        if (select.options.selectedIndex !== -1) {
            a.textContent = select.options[select.selectedIndex].textContent;
        }

        parent.appendChild(a);

        let b: HTMLDivElement = document.createElement('div');
        b.setAttribute('class', 'select-items select-hide');

        for (let i: number = 0; i < select.length; i++) {
            let opt: HTMLOptionElement = select.options[i];
            let optRow: HTMLDivElement = document.createElement('div');
            optRow.textContent = opt.textContent;
            optRow.addEventListener('click', (_: MouseEvent) => {
                let sibling: HTMLElement = optRow.parentNode.previousSibling as HTMLElement;
                for (let j: number = 0; j < select.length; j += 1) {
                    if (opt.textContent == optRow.textContent) {
                        select.selectedIndex = j;
                        sibling.textContent = optRow.textContent;
                        let selecteds: HTMLCollectionOf<Element> = (optRow.parentNode as HTMLElement).getElementsByClassName('same-as-selected');
                        for (let k: number = 0; k < selecteds.length; k++) {
                            selecteds[k].removeAttribute('class');
                        }
                        optRow.setAttribute('class', 'same-as-selected');
                        break;
                    }
                }
                sibling.click();

                // fix for events
                select.value = opt.value;
                optRow.textContent = opt.text;
                this.onSelected(opt.value);
            });
            b.appendChild(optRow);
        }

        parent.appendChild(b);
        a.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            this.closeSelect(a, parent.getElementsByClassName('select-items'), parent.getElementsByClassName('select-selected'));
            (a.nextSibling as HTMLElement).classList.toggle('select-hide');
        });
    }

    render(): JSX.Element {
        return <div className='conduit-select' id={`parent-${this.props.id}`}>
            <select id={this.props.id}
                defaultValue={this.props.defaultValue}>
                {this.props.children}
            </select>
        </div>
    }
}