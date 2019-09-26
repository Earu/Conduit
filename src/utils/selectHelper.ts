export class SelectHelper {
    private static tryGetSelect(selectId: string): { success: boolean; select: HTMLSelectElement }  {
        let select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
        if (!select) return { success: false, select: null };

        return { success: true, select: select };
    }

    private static tryGetOption(select: HTMLSelectElement, value: string): { success: boolean; option: HTMLOptionElement } {
        for (let opt of select.options) {
            if (opt.value === value) {
                return { success: true, option: opt };
            }
        }

        return { success: false, option: null };
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
        let { success, select } = SelectHelper.tryGetSelect(selectId);
        if (!success) return false;

        select.value = value;
        select.nextSibling.textContent = select.options[select.selectedIndex].textContent;
        return true;
    }

    public static trySetOptions(selectId: string, opts: Array<HTMLOptionElement>, onSelected: (value: string) => void): boolean {
        let { success, select } = SelectHelper.tryGetSelect(selectId);
        if (!success) return false;

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
        let { success, select } = SelectHelper.tryGetSelect(selectId);
        if (!success) return false;

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
        let obj: any = SelectHelper.tryGetSelect(selectId);
        if (!obj.success) return false;
        let select: HTMLSelectElement = obj.select;
        obj = SelectHelper.tryGetOption(select, value);
        if (!obj.success) return false;
        let opt: HTMLOptionElement = obj.option;

        select.removeChild(opt);

        let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
        let foundItem: HTMLDivElement = null;
        for (let child of items.children) {
            if (child.textContent === opt.textContent) {
                foundItem = child as HTMLDivElement;
                break;
            }
        }

        if (!foundItem) return false;
        items.removeChild(foundItem);

        return true;
    }

    public static tryChangeOptionText(selectId: string, value: string, newText: string): boolean {
        let obj: any = SelectHelper.tryGetSelect(selectId);
        if (!obj.success) return false;
        let select: HTMLSelectElement = obj.select;
        obj = SelectHelper.tryGetOption(select, value);
        if (!obj.success) return false;
        let opt: HTMLOptionElement = obj.option;

        let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
        let foundItem: HTMLDivElement = null;
        for (let child of items.children) {
            if (child.textContent === opt.textContent) {
                foundItem = child as HTMLDivElement;
                break;
            }
        }

        if (!foundItem) return false;
        if (select.nextSibling.textContent === opt.textContent) {
            select.nextSibling.textContent = newText;
        }

        foundItem.textContent = newText
        opt.textContent = newText;
    }
}