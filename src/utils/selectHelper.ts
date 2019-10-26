class SelectResult<T extends HTMLElement> {
    public success: boolean;
    public element: T;

    constructor (element: T) {
        this.element = element;
        this.success = element ? true : false;
    }

    public toNode(): T {
        return this.element;
    }
}

export class SelectHelper {
    private static tryGetSelect(selectId: string): SelectResult<HTMLSelectElement> {
        let select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
        return new SelectResult(select);
    }

    private static tryGetOption(select: HTMLSelectElement, value: string): SelectResult<HTMLOptionElement> {
        try {
            for (let opt of select.options) {
                if (opt.value === value) {
                    return new SelectResult(opt);
                }
            }

            return new SelectResult(null);
        } catch {
            return new SelectResult(null);
        }
    }

    private static tryGetItem(select: HTMLSelectElement, opt: HTMLOptionElement): SelectResult<HTMLDivElement> {
        try {
            let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
            for (let child of items.children) {
                if (child.textContent === opt.textContent) {
                    return new SelectResult(child as HTMLDivElement);
                }
            }

            return new SelectResult(null);
        } catch {
            return new SelectResult(null);
        }
    }

    private static addHandler(select: HTMLSelectElement, opt: HTMLOptionElement, div: HTMLDivElement, onSelected: (value: string) => void) {
        div.addEventListener('click', (_: MouseEvent) => {
            let sibling: HTMLElement = div.parentNode.previousSibling as HTMLElement;
            for (let i: number = 0; i < select.length; i += 1) {
                if (opt.textContent == div.textContent) {
                    select.selectedIndex = i;
                    sibling.textContent = div.textContent;
                    let selecteds: HTMLCollectionOf<Element> = (div.parentNode as HTMLElement).getElementsByClassName('same-as-selected');
                    for (let k: number = 0; k < selecteds.length; k++) {
                        selecteds[k].removeAttribute('class');
                    }
                    div.setAttribute('class', 'same-as-selected');
                    break;
                }
            }
            sibling.click();

            // fix for events
            select.value = opt.value;
            div.textContent = opt.text;
            onSelected(opt.value);
        });
    }

    public static trySetValue(selectId: string, value: string): boolean {
        let resSelect: SelectResult<HTMLSelectElement> = SelectHelper.tryGetSelect(selectId);
        if (!resSelect.success) return false;

        let select: HTMLSelectElement = resSelect.toNode();
        select.value = value;

        let selectedIndex: number = select.selectedIndex > -1 ? select.selectedIndex : 0;
        select.nextSibling.textContent = select.options[selectedIndex].textContent;
        
        return true;
    }

    public static trySetOptions(selectId: string, opts: Array<HTMLOptionElement>, onSelected: (value: string) => void): boolean {
        let resSelect: SelectResult<HTMLSelectElement> = SelectHelper.tryGetSelect(selectId);
        if (!resSelect.success) return false;

        let select: HTMLSelectElement = resSelect.toNode();
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }

        let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
        while (items.firstChild) {
            items.removeChild(items.firstChild);
        }

        if (opts.length <= 0) return true;

        for (let opt of opts) {
            select.appendChild(opt);
            let div: HTMLDivElement = document.createElement('div');
            div.textContent = opt.textContent;
            items.appendChild(div);
            SelectHelper.addHandler(select, opt, div, onSelected);
        }

        select.value = opts[0].value;
        select.nextSibling.textContent = opts[0].textContent;
        return true;
    }

    public static tryAddValue(selectId: string, value: string, text: string, onSelected: (value: string) => void): boolean {
        let resSelect: SelectResult<HTMLSelectElement> = SelectHelper.tryGetSelect(selectId);
        if (!resSelect.success) return false;
        let resOpt: SelectResult<HTMLOptionElement> = SelectHelper.tryGetOption(resSelect.element, value);
        if (resOpt.success) { // in case value already exists
            return SelectHelper.tryChangeOptionText(selectId, value, text);
        }

        let select: HTMLSelectElement = resSelect.toNode();
        let opt: HTMLOptionElement = document.createElement('option');
        opt.value = value;
        opt.textContent = text;
        select.appendChild(opt);

        let div: HTMLDivElement = document.createElement('div');
        div.textContent = text;
        let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
        items.appendChild(div);
        SelectHelper.addHandler(select, opt, div, onSelected);
        return true;
    }

    public static tryRemoveValue(selectId: string, value: string): boolean {
        let resSelect: SelectResult<HTMLSelectElement> = SelectHelper.tryGetSelect(selectId);
        if (!resSelect.success) return false;
        let resOpt: SelectResult<HTMLOptionElement> = SelectHelper.tryGetOption(resSelect.element, value);
        if (!resOpt.success) return false;
        let resItem: SelectResult<HTMLDivElement> = SelectHelper.tryGetItem(resSelect.element, resOpt.element);
        if (!resItem.success) return false;

        let select: HTMLSelectElement = resSelect.toNode();
        let opt: HTMLOptionElement = resOpt.toNode();

        let items: ChildNode = select.nextSibling.nextSibling;
        let item: HTMLDivElement = resItem.toNode();

        select.removeChild(opt);
        items.removeChild(item);

        // in case we're removing the selected element
        if (opt.textContent === select.nextSibling.textContent) {
            select.selectedIndex = 0;
            let newOpt: HTMLOptionElement = select.options[select.selectedIndex];
            if (!newOpt) {
                select.value = '';
                select.nextSibling.textContent = '';
            } else {
                select.value = newOpt.value;
                select.nextSibling.textContent = newOpt.textContent;
            }
        }

        return true;
    }

    public static tryChangeOptionText(selectId: string, value: string, newText: string): boolean {
        let resSelect: SelectResult<HTMLSelectElement> = SelectHelper.tryGetSelect(selectId);
        if (!resSelect.success) return false;
        let resOpt: SelectResult<HTMLOptionElement> = SelectHelper.tryGetOption(resSelect.element, value);
        if (!resOpt.success) return false;
        let resItem: SelectResult<HTMLDivElement> = SelectHelper.tryGetItem(resSelect.element, resOpt.element);
        if (!resItem.success) return false;

        let select: HTMLSelectElement = resSelect.toNode();
        let opt: HTMLOptionElement = resOpt.toNode();
        let item: HTMLDivElement = resItem.toNode();

        if (select.nextSibling.textContent === opt.textContent) {
            select.nextSibling.textContent = newText;
        }

        item.textContent = newText
        opt.textContent = newText;
    }
}