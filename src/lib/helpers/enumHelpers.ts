import type {SelectOption} from "../../types/selectOption.type";
import {GameColor} from "../../types/enums/gamecolor.enum";

const mapEnumToSelect = (enumValue: any) : Array<SelectOption> => {
    const options: Array<SelectOption> = [];

    const defaultOption: SelectOption = {value: "0", name: "Please Select A Color"}
    options.push(defaultOption)

    for(const [key, value] of Object.entries(GameColor)){
        const option: SelectOption = {value: key, name: value.toString()}
        options.push(option)
    }

    return options;

}

export default mapEnumToSelect