import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { ISchema } from '../../model/ISchema'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'
import type { FC } from 'react'

import { runInAction } from 'mobx'

import { Field } from '../../model/Field'
import { registerWidgetClass } from '../WidgetUI.DI'
import { WidgetCustom_HeaderUI } from './WidgetCustomUI'

export type CustomWidgetProps<T> = { field: Field_custom<T>; extra: import('./WidgetCustomUI').UIKit }

// CONFIG
export type Field_custom_config<T> = FieldConfig<
    {
        defaultValue: () => T
        subTree?: () => ISchema
        Component: FC<CustomWidgetProps<T>>
    },
    Field_custom_types<T>
>

// SERIAL
export type Field_custom_serial<T> = FieldSerial<{
    type: 'custom'
    value: T
}>

// VALUE
export type Field_custom_value<T> = T

// TYPES
export type Field_custom_types<T> = {
    $Type: 'custom'
    $Config: Field_custom_config<T>
    $Serial: Field_custom_serial<T>
    $Value: Field_custom_value<T>
    $Field: Field_custom<T>
}

// STATE
export class Field_custom<T> extends Field<Field_custom_types<T>> {
    DefaultHeaderUI = WidgetCustom_HeaderUI
    DefaultBodyUI = undefined

    static readonly type: 'custom' = 'custom'

    get baseErrors(): Problem_Ext {
        return null
    }

    get Component(): Field_custom_config<T>['Component'] {
        return this.config.Component
    }

    get defaultValue(): T {
        return this.config.defaultValue()
    }

    get hasChanges(): boolean {
        return this.value !== this.defaultValue
    }

    reset(): void {
        this.value = this.config.defaultValue()
    }

    constructor(
        //
        repo: Repository,
        root: Field | null,
        parent: Field | null,
        schema: ISchema<Field_custom<T>>,
        serial?: Field_custom_serial<T>,
    ) {
        super(repo, root, parent, schema)
        this.setSerial(serial, false)
        this.init({
            Component: false,
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
        })
    }

    protected setOwnSerial(serial: Maybe<Field_custom_serial<T>>): void {
        this.serial.value = serial?.value ?? this.defaultValue
    }

    /** never mutate this field manually, only access to .state */
    get value(): Field_custom_value<T> {
        return this.serial.value ?? this.defaultValue
    }

    set value(next: Field_custom_value<T>) {
        if (this.serial.value === next) return
        runInAction(() => {
            this.serial.value = next
            this.applyValueUpdateEffects()
        })
    }
}

registerWidgetClass('custom', Field_custom)
