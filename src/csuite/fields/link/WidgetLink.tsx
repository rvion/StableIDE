import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { ISchema } from '../../model/ISchema'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'
import type { CovariantFn } from '../../variance/BivariantHack'

import { runInAction } from 'mobx'

import { Field, type KeyedField } from '../../model/Field'
import { registerWidgetClass } from '../WidgetUI.DI'

// CONFIG
export type Field_link_config<
    //
    A extends ISchema,
    B extends ISchema,
> = FieldConfig<
    {
        // injected
        share: A

        // into
        children: CovariantFn<[child: A['$Field']], B>
    },
    Field_link_types<A, B>
>

// SERIAL
export type Field_link_serial<A extends ISchema, B extends ISchema> = FieldSerial<{
    type: 'link'
    a?: A['$Serial']
    b?: B['$Serial']
}>

// VALUE
export type Field_link_value<
    /** A value is NOT used; it may be part of B */
    A extends ISchema,
    B extends ISchema,
> = B['$Value']

// TYPES
export type Field_link_types<A extends ISchema, B extends ISchema> = {
    $Type: 'link'
    $Config: Field_link_config<A, B>
    $Serial: Field_link_serial<A, B>
    $Value: Field_link_value<A, B>
    $Field: Field_link<A, B>
}

// STATE
export class Field_link<A extends ISchema, B extends ISchema> //
    extends Field<Field_link_types<A, B>>
{
    static readonly type: 'link' = 'link'

    /** the dict of all child widgets */
    aField!: A['$Field']
    bField!: B['$Field']

    constructor(
        //
        repo: Repository,
        root: Field | null,
        parent: Field | null,
        schema: ISchema<Field_link<A, B>>,
        serial?: Field_link_serial<A, B>,
    ) {
        super(repo, root, parent, schema)
        this.init(serial, {})
    }

    protected setOwnSerial(serial: Maybe<Field_link_serial<A, B>>) {
        let aField: A['$Field'] = this.aField
        this.RECONCILE({
            existingChild: this.aField,
            correctChildSchema: this.config.share,
            targetChildSerial: serial?.a,
            attach: (child) => {
                this.aField = child
                this.serial.a = child.serial
            },
        })

        this.RECONCILE({
            existingChild: this.bField,
            correctChildSchema: this.config.children(aField),
            targetChildSerial: serial?.b,
            attach: (child) => {
                this.bField = child
                this.serial.b = child.serial
            },
        })
    }

    DefaultHeaderUI = () => <>🟢</>

    DefaultBodyUI = () => this.bField.renderWithLabel()

    get ownProblems(): Problem_Ext {
        return this.bField.hasErrors
    }

    get hasChanges(): boolean {
        return this.bField.hasChanges
    }

    reset(): void {
        this.bField.reset()
    }

    get indentChildren(): number {
        return 0
    }

    get summary(): string {
        return this.bField.summary
    }

    get subFields(): [A['$Field'], B['$Field']] {
        return [this.aField, this.bField]
    }

    get subFieldsWithKeys(): KeyedField[] {
        return [
            { key: 'a', field: this.aField },
            { key: 'b', field: this.bField },
        ]
    }

    get value() {
        return this.bField.value
    }

    set value(val: Field_link_value<A, B>) {
        this.MUTAUTO(() => {
            this.bField.value = val
        })
    }
}

// DI
registerWidgetClass('link', Field_link)
