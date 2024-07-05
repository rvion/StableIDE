import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { ISchema } from '../../model/ISchema'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { computed, observable } from 'mobx'

import { Field, type KeyedField } from '../../model/Field'
import { registerWidgetClass } from '../WidgetUI.DI'

// CONFIG
export type Field_optional_config<T extends ISchema = ISchema> = FieldConfig<
    {
        startActive?: boolean
        schema: T
    },
    Field_optional_types<T>
>

// SERIAL
export type Field_optional_serial<T extends ISchema = ISchema> = FieldSerial<{
    type: 'optional'
    child?: Maybe<T['$Serial']>
    active: boolean
}>

// VALUE
export type Field_optional_value<T extends ISchema = ISchema> = Maybe<T['$Value']>

// TYPES
export type Field_optional_types<T extends ISchema = ISchema> = {
    $Type: 'optional'
    $Config: Field_optional_config<T>
    $Serial: Field_optional_serial<T>
    $Value: Field_optional_value<T>
    $Field: Field_optional<T>
}

// STATE
export class Field_optional<T extends ISchema = ISchema> extends Field<Field_optional_types<T>> {
    DefaultHeaderUI = undefined
    DefaultBodyUI = undefined

    constructor(
        //
        repo: Repository,
        root: Field | null,
        parent: Field | null,
        schema: ISchema<Field_optional<T>>,
        serial?: Field_optional_serial<T>,
    ) {
        super(repo, root, parent, schema)
        this.initSerial(serial)
        this.init({
            serial: observable,
            value: computed,
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
        })
    }

    protected setOwnSerial(serial: Maybe<Field_optional_serial<T>>) {
        this.serial.active = serial?.active ?? this.config.startActive ?? false
        this._ensureChildIsHydrated()
    }

    /**
     * as of 2024-03-14, this is only called in the constructor
     * TODO: inline ?
     */
    private _ensureChildIsHydrated() {
        const childSerial = this.serial.child
        if (this.child) {
            if (childSerial) {
                this.child.setSerial(childSerial)
                return
            }
            // else this.child.reset()
        } else {
            const schema = this.config.schema
            const prevSerial = childSerial
            if (prevSerial && schema.type === prevSerial.type) {
                this.child = schema.instanciate(this.repo, this.root, this, prevSerial)
            } else {
                this.child = schema.instanciate(this.repo, this.root, this, null)
                this.serial.child = this.child.serial
            }
        }
    }

    setActive = (value: boolean) => {
        if (this.serial.active === value) return
        this.serial.active = value
        this.applyValueUpdateEffects()

        // update child collapsed state if need be
        if (value) this.child.setCollapsed(false)
        else this.child.setCollapsed(true)
    }

    reset(): void {
        // active by default
        if (this.config.startActive) {
            if (!this.serial.active) this.setActive(true)
            if (this.child.hasChanges) this.child.reset()
            return
        }
        // unactive by default
        else {
            if (this.serial.active) this.setActive(false)
            return
        }
    }

    get hasChanges(): boolean {
        // active by default
        if (this.config.startActive) {
            if (!this.serial.active) return true
            return this.child.hasChanges
        }

        // unactive by default
        else {
            if (!this.serial.active) return false
            return true
        }
    }

    static readonly type: 'optional' = 'optional'

    get baseErrors(): Problem_Ext {
        return null
    }

    child!: T['$Field']

    get childOrThrow(): T['$Field'] {
        if (this.child == null) throw new Error('❌ optional active but child is null')
        return this.child
    }

    /** hack so optional fields do not increase nesting twice */
    get indentChildren(): number {
        return 0
    }

    get subFields(): Field[] {
        return this.serial.active ? [this.child] : []
    }

    get subFieldsWithKeys(): KeyedField[] {
        return this.serial.active ? [{ key: 'child', field: this.child }] : []
    }

    get value(): Field_optional_value<T> {
        if (!this.serial.active) return null
        return this.childOrThrow.value
    }

    set value(next: Field_optional_value<T>) {
        if (next == null) {
            this.setActive(false)
            return
        } else {
            this.setActive(true)
            this.child.value = next
        }
    }
}

// DI
registerWidgetClass('optional', Field_optional)
