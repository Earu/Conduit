export class SelectHelper {
    private static tryGetSelect(selectId: string): { success: boolean; select: HTMLSelectElement }  {
        let select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
        if (!select) return { success: false, select: null };

        return { success: true, select: select };
    }

    public static trySetValue(selectId: string, value: string): boolean {
        let { success, select } = SelectHelper.tryGetSelect(selectId);
        if (!success) return false;

        select.value = value;
        select.nextSibling.textContent = select.options[select.selectedIndex].textContent;
        return true;
    }

    public static trySetOptions(selectId: string, opts: Array<HTMLOptionElement>): boolean {
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
        }

        select.value = opts[0].value;
        select.nextSibling.textContent = opts[0].textContent;
        return true;
    }

    public static tryAddValue(selectId: string, value: string, text: string): boolean {
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
        return true;
    }

    public static tryRemoveValue(selectId: string, value: string): boolean {
        let { success, select } = SelectHelper.tryGetSelect(selectId);
        if (!success) return false;

        let foundOpt: HTMLOptionElement = null;
        for (let opt of select.options) {
            if (opt.value === value) {
                foundOpt = opt;
                break;
            }
        }

        if (!foundOpt) return false;
        select.removeChild(foundOpt);

        let items: HTMLDivElement = select.nextSibling.nextSibling as HTMLDivElement;
        let foundItem: HTMLDivElement = null;
        for (let child of items.children) {
            if (child.textContent === foundOpt.textContent) {
                foundItem = child as HTMLDivElement;
                break;
            }
        }

        if (!foundItem) return false;
        items.removeChild(foundItem);

        return true;
    }
}