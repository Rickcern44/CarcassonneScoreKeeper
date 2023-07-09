import {describe, expect} from "vitest";
import {GameColor} from "../../types/enums/gamecolor.enum";
import mapEnumToSelect from "../../lib/helpers/enumHelpers";
import type {SelectOption} from "../../types/selectOption.type";

describe('enum mapping tests', () => {
    it('map game color to select option', () => {
        const options: Array<SelectOption> = mapEnumToSelect(GameColor)

        expect(options[1].name).toBe("red")
        expect(options[1].value).toBe("1")
    })
})