import type { FieldSerial } from '../../FieldSerial'
import type { IBlueprint } from '../../IBlueprint'
import type { Model } from '../../Model'
import type { Problem_Ext } from '../../Validation'
import type { WidgetConfig } from '../../WidgetConfig'

import { observable } from 'mobx'
import { nanoid } from 'nanoid'

import { BaseField } from '../../BaseField'
import { registerWidgetClass } from '../WidgetUI.DI'
import { WidgetSpacerUI } from './WidgetSpacerUI'

/**
 * Bool Config
 * @property {string} label2 - test
 */
export type Widget_spacer_config = WidgetConfig<{}, Widget_spacer_types>

// SERIAL
export type Widget_spacer_serial = FieldSerial<{ type: 'spacer' }>

// SERIAL FROM VALUE
export const Widget_spacer_fromValue = (val: Widget_spacer_value): Widget_spacer_serial => ({
    type: 'spacer',
})

// VALUE
export type Widget_spacer_value = boolean

// TYPES
export type Widget_spacer_types = {
    $Type: 'spacer'
    $Config: Widget_spacer_config
    $Serial: Widget_spacer_serial
    $Value: Widget_spacer_value
    $Field: Widget_spacer
}

// STATE
export class Widget_spacer extends BaseField<Widget_spacer_types> {
    DefaultHeaderUI = WidgetSpacerUI
    DefaultBodyUI = undefined
    get baseErrors(): Problem_Ext {
        return null
    }
    readonly id: string

    readonly type: 'spacer' = 'spacer'
    serial: Widget_spacer_serial

    hasChanges = false
    reset = () => {}

    constructor(
        //
        public readonly form: Model,
        public readonly parent: BaseField | null,
        public readonly spec: IBlueprint<Widget_spacer>,
        serial?: Widget_spacer_serial,
    ) {
        super()
        this.id = serial?.id ?? nanoid()
        this.serial = serial ?? {
            id: this.id,
            type: 'spacer',
            collapsed: false,
        }

        this.init({
            serial: observable,
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
        })
    }

    get value() {
        return false
    }
    setValue(val: boolean) {}
    set value(val) {}
}

// DI
registerWidgetClass('spacer', Widget_spacer)
