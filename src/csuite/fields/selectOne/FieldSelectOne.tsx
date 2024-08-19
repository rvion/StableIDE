import type { IconName } from '../../icons/icons'
import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { SelectValueLooks } from '../../select/SelectProps'
import type { TabPositionConfig } from '../choices/TabPositionConfig'
import type { SelectValueSlots } from 'src/cushy-forms/main'

import { Field } from '../../model/Field'
import { registerFieldClass } from '../WidgetUI.DI'
import { WidgetSelectOne_CellUI } from './WidgetSelectOne_CellUI'
import { WidgetSelectOneUI } from './WidgetSelectOneUI'
import { stableStringify } from 'src/cushy-forms/src/csuite/hashUtils/hash'

export type SELECT_ID = string
export type SelectOption<VALUE, Id extends SELECT_ID = SELECT_ID> = {
    // 🔴 todo: require 2nd type arg to see bad usages + add extend Id type in FieldSelectOne_config
    id: Id
    value: VALUE
    label?: string
    icon?: IconName
    hue?: number
}

// 🔴 this is temp and does not belong here
export type SelectOption_NO_VALUE<VALUE, Id extends SELECT_ID = SELECT_ID> = {
    id: Id
    value?: VALUE
    label?: string
    labelNode?: JSX.Element
    icon?: IconName
    hue?: number
}

export type SelectOneSkin = 'select' | 'tab' | 'roll'

// 🔴 what about dynamic list? it was complicated to add/remove status without more migration mechanism according to globi

// CONFIG
export type Field_selectOne_config<VALUE> = FieldConfig<
    {
        /**
         * 🔶 the *ID* of the option selected by default
         */
        default?: SELECT_ID
        /**
         * list of all choices
         * 👉 you can use a lambda if you want the option to to dynamic
         *    the lambda will receive the widget instance as argument, from
         *    which you can access variosu stuff like
         *      - `self.serial.query`: the current filtering text
         *      - `self.form`: the form instance
         *      - `self.form.root`: the root of the widget
         *      - `self.parent...`: natigate the widget tree
         *      - `self.useKontext('...')`: any named dynamic chanel for cross-widget communication
         * 👉 If the list of options is generated from the query directly,
         *    you should also set `disableLocalFiltering: true`, to avoid
         *    filtering the options twice.
         */
        choices?: SELECT_ID[] | ((self: Field_selectOne<VALUE>) => SELECT_ID[])
        values?: VALUE[] | ((field: Field_selectOne<VALUE>) => VALUE[])
        options?: SelectOption<VALUE>[] | ((field: Field_selectOne<VALUE>) => SelectOption<VALUE>[])
        getIdFromValue: (t: VALUE) => SELECT_ID
        getValueFromId: (id: SELECT_ID) => Maybe<VALUE>
        getOptionFromId: (
            t: SELECT_ID,
            self:
                | Field_selectOne<NoInfer<VALUE>>
                // 🔴 2024-08-02 domi: bad.
                // Exceptionally, we need self to consume some channel.
                // And exceptionally (autoColumn) we need to use this function from schema without instanciating the field.
                // not sure what to do.
                | 'FIELD_NOT_INSTANCIATED',
        ) => Maybe<SelectOption<VALUE>>
        /** set this to true if your choices are dynamically generated from the query directly, to disable local filtering */
        disableLocalFiltering?: boolean
        OptionLabelUI?: (t: Maybe<SelectOption<VALUE>>, where: SelectValueSlots) => React.ReactNode | SelectValueLooks
        SlotAnchorContentUI?: React.FC<{}>
        appearance?: SelectOneSkin

        /**
         * @since 2024-06-24
         * allow to wrap the list of values if they take more than 1 SLH (standard line height)
         */
        wrap?: boolean

        /**
         * @since 2024-06-24
         * @deprecated use global csuite config instead
         */
        tabPosition?: TabPositionConfig
        placeholder?: string

        /**
         * @deprecated: NOT IMPLEMENTED YET
         * see notes in FieldSelectOne_NullabilityHelper.tsx
         */
        nullable?: boolean
    },
    Field_selectOne_types<VALUE>
>

// SERIAL FROM VALUE
// 🔴 this is not possible anymore, we need the config.getIdFromValue to get the id.
// not sure if important
// export const Field_selectOne_fromValue = <T extends any>(
//     val: Field_selectOne_value<T>,
// ): Field_selectOne_serial => ({ $: 'selectOne', val })

// SERIAL
export type Field_selectOne_serial = FieldSerial<{
    $: 'selectOne'
    query?: string
    val?: Maybe<SELECT_ID>

    /**
     * @deprecated: NOT IMPLEMENTED YET
     * 🤔🔴 important stuff to store with the value to rehydrate it without needing to re-query/instanciate stuff...
     * 1. some kind of "value is more complicated than just a string, need to store more"
     * 2. some kind of cache.
     * - nice thing is, there's an unique write entry point in set value.
     * - should we put the option in extra? it probably covers most use-cases.
     *     - that was the previous implementation (serial.val was SelectOption<string>), with the pros and cons.
     *     - except it may be clearer now that it's more of a nice-to-have cache than a core mechanism.
     * - could be passed to getIdFromValue, getOptionFromId, getValueFromId... who could decide to use the cache to quicken things when needed/available?
     *     - but how do we know if the cache should be used? some contexts we do not need accuracy or don't have access to the whole initial data:
     *          - fetching validated data from storage in back-end to do some batch processing
     *          - display temporary inacurate label in front-end before fetching the real one
     * => at the start, I was considering this to reduce the chance that value is not null when coming from the stored serial => which is ok when value is id!
     * => so probably not needed for now
     */
    extra?: any
}>

// VALUE
export type Field_selectOne_value<VALUE extends any> = VALUE

// TYPES
export type Field_selectOne_types<VALUE extends any> = {
    $Type: 'selectOne'
    $Config: Field_selectOne_config<VALUE>
    $Serial: Field_selectOne_serial
    $Value: Maybe<Field_selectOne_value<VALUE>>
    $Field: Field_selectOne<VALUE>
}

// STATE

const FAILOVER_VALUE: SelectOption<any> = Object.freeze({ id: '❌', label: '❌', value: '❌' })

export class Field_selectOne<VALUE extends any> //
    extends Field<Field_selectOne_types<VALUE>>
{
    static readonly type: 'selectOne' = 'selectOne'
    DefaultHeaderUI = WidgetSelectOneUI
    DefaultBodyUI = undefined
    DefaultCellUI = WidgetSelectOne_CellUI

    get ownProblems(): Maybe<string> {
        if (this.serial.val == null && this.schema.config.required) return 'no value selected'
        const selected = this.choices.find((c) => c === this.selectedId)
        if (selected == null && !this.config.disableLocalFiltering)
            return `selected value (id: ${this.selectedId}) not in choices`
        return
    }

    get hasChanges(): boolean {
        return this.serial.val !== this.default
    }

    reset(): void {
        this.selectedId = this.default
    }

    get choices(): SELECT_ID[] {
        if (this.config.choices != null) {
            const _choices = this.config.choices
            if (typeof _choices === 'function') {
                if (!this.root.ready) return []
                return _choices(this)
            }
            return _choices
        }

        if (this.config.options != null) {
            const _options = this.options
            return _options.map((o) => o.id)
        }

        if (this.config.values != null && this.config.getIdFromValue != null) {
            const _values = this.values
            return _values.map(this.config.getIdFromValue)
        }

        // 🔶 maybe do all these config checks in the constructor?
        throw new Error('no way to get choices. Provide choices or options or values + getIdFromValue')
    }

    // 🔴 make sure that those are triggered lazily by SelectUI:
    // we don't want to fetch all users if the select popup has not been opened yet
    get options(): SelectOption<VALUE>[] {
        if (this.config.options != null) {
            const _options = this.config.options
            if (typeof _options === 'function') {
                if (!this.root.ready) return []
                return _options(this)
            }
            return _options
        }

        if (this.config.choices != null && this.getOptionFromId != null) {
            return this.choices.map(this.getOptionFromId).filter((x) => x != null) as SelectOption<VALUE>[]
        }

        if (this.config.values != null && this.getValueFromId != null && this.getOptionFromId != null) {
            return this.values.map((v) => this.getOptionFromId(this.config.getIdFromValue(v))).filter((x) => x != null)
        }

        throw new Error( 'no way to get options. Provide options or choices + getOptionFromId or values + getIdFromValue + getOptionFromId', ) // prettier-ignore
    }

    private get values(): VALUE[] {
        if (this.config.values != null) {
            const _values = this.config.values
            if (typeof _values === 'function') {
                if (!this.root.ready) return []
                return _values(this)
            }
            return _values
        }

        if (this.config.options != null) {
            const _options = this.options
            return _options.map((o) => o.value)
        }

        if (this.config.choices != null && this.config.getValueFromId != null) {
            const _choices = this.choices
            return _choices.map(this.config.getValueFromId).filter((x) => x != null)
        }

        throw new Error('no way to get values. Provide values or options or choices + getValueFromId')
    }

    constructor(
        repo: Repository,
        root: Field | null,
        parent: Field | null,
        schema: BaseSchema<Field_selectOne<VALUE>>,
        serial?: Field_selectOne_serial,
    ) {
        super(repo, root, parent, schema)
        this.init(serial, {
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
            DefaultCellUI: false,
        })
    }

    get default(): Maybe<SELECT_ID> {
        return this.config.default ?? null
    }

    protected setOwnSerial(serial: Maybe<Field_selectOne_serial>): void {
        // 2024-08-02: support previous serial format which stored SelectOption<VALUE>.
        let prevVal = serial?.val
        if (serial != null && typeof serial.val === 'object' && serial.val != null && 'id' in serial.val) {
            if ((serial.val as any).id != '❌') prevVal = (serial.val as unknown as { id: string }).id
            else prevVal = null
        }
        this.serial.val = prevVal ?? this.default

        this.serial.query = serial?.query
    }

    /** return true if the value is equal to the given id */
    is(val: VALUE): boolean {
        return this.config.getIdFromValue(val) === this.selectedId
    }

    get value(): Maybe<Field_selectOne_value<VALUE>> {
        if (this.selectedId == null) return null
        return this.getValueFromId(this.selectedId)
    }

    get selectedOption(): Maybe<SelectOption<VALUE>> {
        if (this.selectedId == null) return null
        return this.getOptionFromId(this.selectedId)
    }

    set value(next: Maybe<Field_selectOne_value<VALUE>>) {
        const nextId = next == null ? null : this.config.getIdFromValue(next)
        this.selectedId = nextId
    }

    get selectedId(): Maybe<SELECT_ID> {
        return this.serial.val // || this.default // 🔴 idk, probably bad to have default here
    }

    set selectedId(nextId: Maybe<SELECT_ID>) {
        if (this.serial.val === nextId) return

        this.runInValueTransaction(() => {
            this.serial.val = nextId

            // 2024-07-08 rvion:
            // | when setting a value with equal id, we may be actually changing the SelectOption
            // | (cached name could be different, etc.)
            // | since it's a bit complicated, let's not care today. if this cause a bug, let's improve
            // | that later

            // ⏸️ const nextHasSameID = this.value.id === next.id
            // ⏸️ if (!nextHasSameID) this.applyValueUpdateEffects()
            // ⏸️ else this.applySerialUpdateEffects()
        })
    }

    // set value(next: Field_selectOne_value<VALUE>) {
    //     // 🔴 can we do without this?
    // }

    renderAsCell(this: Field_selectOne<VALUE>, p?: { reveal?: boolean }): JSX.Element {
        return <this.DefaultCellUI field={this} opts={p} {...p} />
    }

    /**
     * 2024-08-02 domi: problem: getting the value via getOptionFromId
     * sometimes goes through options or choices (and their side effects),
     * when we probably just want to go from serial to value.
     * especially in back-end when we likely don't need label or icon.
     * In most cases (all for now), value is the id, so we can just get value from serial.
     *
     * see also "extra"
     */
    getValueFromId = (id: SELECT_ID): Maybe<VALUE> => this.config.getValueFromId(id)
    getOptionFromId = (id: SELECT_ID): Maybe<SelectOption<VALUE>> => this.config.getOptionFromId(id, this)

    // 🔶 do not compare queries
    get isDirtyFromSnapshot_UNSAFE(): boolean {
        const { snapshot, ...currentSerial } = this.serial
        if (snapshot == null) return false
        return stableStringify(snapshot.val) !== stableStringify(currentSerial.val)
    }
}

// DI
registerFieldClass('selectOne', Field_selectOne)
