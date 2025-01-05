import type { PartialOmit } from '../../../types/Misc'
import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { SelectValueLooks } from '../../select/SelectProps'
import type { SelectValueSlots } from '../../select/SelectState'
import type { TabPositionConfig } from '../choices/TabPositionConfig'
import type { CanThrow } from './CanCrash'
import type { SelectKey } from './SelectOneKey'
import type { SelectOption } from './SelectOption'

import { stableStringify } from '../../hashUtils/hash'
import { Field } from '../../model/Field'
import { isProbablySerialSelectOne, registerFieldClass } from '../WidgetUI.DI'
import { WidgetSelectOne_CellUI } from './WidgetSelectOne_CellUI'
import { WidgetSelectOneUI } from './WidgetSelectOneUI'

export type SelectOneSkin = 'select' | 'tab' | 'roll'

// 💬 2024-08-.. domi:
// | 🔴 what about dynamic list?
// | it was complicated to add/remove status without more migration mechanism according to globi
//
// 💬 2024-08-21 rvion:
// | it shouldn't be complicated; I've done it a few times, it wasn't that hard.

export type Field_selectOne_config_simplified<VALUE, KEY extends SelectKey> = PartialOmit<
   Field_selectOne_config<VALUE, KEY>,
   'choices' | 'getIdFromValue' | 'getOptionFromId' | 'getValueFromId'
>

export type Field_selectOne_config_simplified_<KEY extends SelectKey> = PartialOmit<
   Field_selectOne_config_<KEY>,
   'choices' | 'getIdFromValue' | 'getOptionFromId' | 'getValueFromId'
>

// #region CONFIG
export type Field_selectOne_config_<KEY extends SelectKey> = Field_selectOne_config<KEY, KEY>
export type Field_selectOne_config<
   //
   VALUE,
   KEY extends SelectKey,
> = FieldConfig<
   {
      /** 🔶 the *ID* of the option selected by default */
      default?: KEY

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
      choices?: KEY[] | ((self: Field_selectOne<VALUE, KEY>) => KEY[])
      values?: VALUE[] | ((field: Field_selectOne<VALUE, KEY>) => VALUE[])
      options?:
         | SelectOption<VALUE, KEY>[]
         | ((field: Field_selectOne<VALUE, KEY>) => SelectOption<VALUE, KEY>[])
      createOption?: {
         label?: string
         isActive?: boolean
         action: () => Promise<Maybe<SelectOption<VALUE, KEY>>>
      }

      getIdFromValue: (t: VALUE) => KEY
      getValueFromId: (id: KEY, self: Field_selectOne<NoInfer<VALUE>, KEY>) => VALUE | undefined
      getOptionFromId: (t: KEY, self: Field_selectOne<NoInfer<VALUE>, KEY>) => Maybe<SelectOption<VALUE, KEY>>
      /** set this to true if your choices are dynamically generated from the query directly, to disable local filtering */
      disableLocalFiltering?: boolean
      /**
       * will be removed soon; in the meantime, you must know that:
       * - it will be passed to `OptionLabelUI` in src/csuite/fields/selectOne/WidgetSelectOne_SelectUI.tsx
       * - it will be used in `DisplayOptionUI` in src/csuite/select/SelectState.tsx
       * - if unset, `DefaultDisplayOption` in src/csuite/select/SelectState.tsx
       * - you may want to use `SelectDefaultOptionUI` if you want to build a similarly themed component
       * - you can just change the text label if otherise...
       *
       * ... and yes, this is crappy.
       *
       * */
      OptionLabelUI?: (
         //
         t: Maybe<SelectOption<VALUE, KEY>>,
         where: SelectValueSlots,
      ) => React.ReactNode | SelectValueLooks
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
   Field_selectOne_types<VALUE, KEY>
>

// #region SERIAL
export type Field_selectOne_serial<KEY extends SelectKey> = FieldSerial<{
   $: 'selectOne'
   query?: string
   val?: KEY

   // 💬 2024-08-21 rvion:
   // | cache for the selected option when value is no longer there
   // | allow to keep displaying the option in most cases.
   // |
   // |> selected?: string
   // |> selectedLabel?: string
   // |> selectedIcon?: string

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

// #region VALUE
export type Field_selectOne_value<VALUE extends any> = VALUE
export type Field_selectOne_unchecked<VALUE extends any> = Field_selectOne_value<VALUE> | undefined

// #region TYPES
export type Field_selectOne_types<
   //
   VALUE extends any,
   KEY extends SelectKey,
> = {
   $Type: 'selectOne'
   $Config: Field_selectOne_config<VALUE, KEY>
   $Serial: Field_selectOne_serial<KEY>
   $Value: VALUE
   $Unchecked: Field_selectOne_unchecked<VALUE>
   $Field: Field_selectOne<VALUE, KEY>
   $Child: never
   $Reflect: Field_selectOne_types<VALUE, KEY>
}

// #region STATE
export type Field_selectOne_<
   //
   VALUE extends SelectKey,
> = Field_selectOne<VALUE, VALUE>

export class Field_selectOne<
   //
   VALUE extends any,
   KEY extends SelectKey,
> extends Field<Field_selectOne_types<VALUE, KEY>> {
   // #region TYPE
   static readonly type: 'selectOne' = 'selectOne'
   static readonly emptySerial: Field_selectOne_serial<any> = { $: 'selectOne' }
   static codegenValueType(config: Field_selectOne_config<any, any>): string {
      return `any /* selectOne */`
   }
   static migrateSerial<KEY extends SelectKey>(serial: object): Maybe<Field_selectOne_serial<KEY>> {
      if (isProbablySerialSelectOne(serial)) {
         const { $, val, ...rest } = serial
         // 2024-08-02: support previous serial format which stored SelectOption<VALUE>.
         const legacyValue: object[] | undefined = val
         if (
            typeof legacyValue === 'object' && //
            legacyValue != null &&
            'id' in legacyValue
         ) {
            const next: Field_selectOne_serial<KEY> = {
               $: 'selectOne',
               val: legacyValue.id === '❌' ? undefined : (legacyValue.id as KEY),
               ...rest,
            }
            return next
         }
      }
   }

   // #region CTOR
   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_selectOne<VALUE, KEY>>,
      initialMountKey: string,
      serial?: Field_selectOne_serial<KEY>,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         DefaultHeaderUI: false,
         DefaultBodyUI: false,
         DefaultCellUI: false,
      })
   }

   // 📌 UI ---------------------------------------------------------------------|
   DefaultHeaderUI: -1 = -1
   DefaultBodyUI: -1 = -1

   // #region PROBLEMS

   get ownConfigSpecificProblems(): Maybe<string[]> {
      if (Array.isArray(this.config.choices)) {
         if (this.config.choices.length === 0) return ['no choices availble from the config']
      }
      // const invalidDefaults = this.defaultKeys?.filter((key) => !this.possibleKeys.includes(key))
      return null
   }

   get shouldValidateThatValueIsAmongstKeys(): boolean {
      if (Array.isArray(this.config.choices)) return true
      return false
   }

   get ownTypeSpecificProblems(): Maybe<string[]> {
      // when field is not set, no specific error yet; FieldNotSet error will already
      // be thrown elsewhere
      if (this.serial.val == null) return null

      const errors: string[] = []
      if (this.shouldValidateThatValueIsAmongstKeys) {
         const selected = this.possibleKeys.find((c) => c === this.selectedId)
         if (selected === undefined && !this.config.disableLocalFiltering)
            errors.push(`selected value (id: ${this.selectedId}) not in choices`)
      }

      if (errors.length > 0) return errors
      return
   }

   // 📌 CHANGES ----------------------------------------------------------------|
   get isOwnSet(): boolean {
      return this.serial.val !== undefined
   }

   get hasChanges(): boolean {
      return this.serial.val !== this.defaultKey
   }

   reset(): void {
      this.selectedId = this.defaultKey
   }

   get query(): string {
      return this.serial.query ?? ''
   }

   set query(next: string) {
      this.patchInTransaction((draft) => void (draft.query = next))
   }

   /**
    * list of all possible keys
    * 🔶 warning: if config.choices is a function, will execute the method
    */
   get possibleKeys(): KEY[] {
      if (this.config.choices != null) {
         const _choices = this.config.choices
         if (typeof _choices === 'function') {
            // 🔴 if (!this.root.ready) return []
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

   //  💬 2024-09-?? ???:
   // | 🔴 make sure that those are triggered lazily by SelectUI:
   // | we don't want to fetch all users if the select popup has not been opened yet
   //

   // 💬 2024-09-16 rvion:
   // | Do we always want to have some "unset" value injected here ?
   get options(): SelectOption<VALUE, KEY>[] {
      if (this.config.options != null) {
         const _options = this.config.options
         if (typeof _options === 'function') return _options(this)
         return _options
      }

      if (this.config.choices != null && this.getOptionFromId != null) {
         return this.possibleKeys.map(this.getOptionFromId).filter((x) => x != null) as SelectOption<
            VALUE,
            KEY
         >[]
      }

      if (this.config.values != null && this.getValueFromId != null && this.getOptionFromId != null) {
         return this.values
            .map((v) => this.getOptionFromId(this.config.getIdFromValue(v)))
            .filter((x) => x != null)
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
         const _choices = this.possibleKeys
         return _choices.map(this.getValueFromId).filter((x) => x != null)
      }

      throw new Error('no way to get values. Provide values or options or choices + getValueFromId')
   }

   // 📌 MOCK ------------------------------------------------------------|
   /** randomly pick one of the options */
   randomize(): void {
      const choices = this.possibleKeys
      if (choices.length === 0) return
      const idx = Math.floor(Math.random() * choices.length)
      this.selectedId = choices[idx]!
   }

   // #region CHILDREN

   // 📌 SERIAL -----------------------------------------------------------------|
   protected setOwnSerial(next: Field_selectOne_serial<KEY>): void {
      this.assignNewSerial(next)

      if (
         this.serial.val === undefined && //
         this.defaultKey !== undefined
      ) {
         this.patchSerial((draft) => void (draft.val = this.defaultKey))
      }
   }

   /** return true if the value is equal to the given id */
   is(value: VALUE): boolean {
      return this.config.getIdFromValue(value) === this.selectedId
   }

   // #region VALUE
   /**
    * First key for the list of possibleKeys
    * returns undefined if the list is empty
    */
   get firstPossibleKey(): KEY | undefined {
      return this.possibleKeys[0]
   }

   /**
    * true when config.default has been set,
    * even when set to null or undefined
    *
    * 🔴 TODO: add test
    */
   get hasDefaultKey(): boolean {
      return 'default' in this.config
   }

   /** proxy to this.config.default */
   get defaultKey(): KEY | undefined {
      return this.config.default
   }

   // #region VALUE
   get value(): CanThrow<VALUE> {
      return this.value_or_fail
   }

   set value(next: Field_selectOne_value<VALUE>) {
      this.selectedId = this.config.getIdFromValue(next)
   }

   /** different from reset; doesn't take default into account */
   unset(): void {
      this.patchInTransaction((draft) => void (draft.val = undefined))
   }

   get value_or_fail(): CanThrow<VALUE> {
      return this._getValueOrThrow(this.selectedId)
   }

   /** zero value may not exists */
   get value_or_zero(): CanThrow<VALUE> {
      return this._getValueOrThrow(this.selectedId ?? this.firstPossibleKey)
   }

   get value_unchecked(): Field_selectOne_unchecked<VALUE> {
      if (this.selectedId === undefined) return undefined
      const value = this.getValueFromId(this.selectedId)
      if (value === undefined) return undefined
      return value
   }

   private _getValueOrThrow(key: KEY | undefined): CanThrow<VALUE> {
      if (key === undefined)
         throw new Error(`Field_selectOne._getValueOrThrow (${this.pathExt}): no key available`)
      const value = this.getValueFromId(key)
      if (value === undefined)
         throw new Error(`Field_selectOne._getValueOrThrow (${this.pathExt}): value not found for first key`)
      return value as VALUE
   }

   // #region SELECTED OPTION
   get selectedOption_unchecked(): SelectOption<VALUE, KEY> | undefined {
      const key = this.selectedId
      if (key === undefined) return

      const opt = this.getOptionFromId(key)
      if (opt == null) return

      return opt
   }

   get selectedOption(): SelectOption<VALUE, KEY> {
      const key = this.selectedId
      if (key == null) throw new Error('Field_selectOne.selectedOption: no value selected')

      const opt = this.getOptionFromId(key)
      if (opt == null) throw new Error('Field_selectOne.selectedOption: no option found for key')

      return opt
   }

   get selectedId(): KEY | undefined {
      return this.serial.val // || this.default // 🔴 idk, probably bad to have default here
   }

   set selectedId(nextId: KEY | undefined) {
      if (this.serial.val === nextId) return

      this.runInTransaction(() => {
         this.patchSerial((draft) => void (draft.val = nextId))

         // 💬 2024-07-08 rvion:
         // | when setting a value with equal id, we may be actually changing the SelectOption
         // | (cached name could be different, etc.)
         // | since it's a bit complicated, let's not care today. if this cause a bug, let's improve
         // | that later

         // ⏸️ const nextHasSameID = this.value.id === next.id
         // ⏸️ if (!nextHasSameID) this.applyValueUpdateEffects()
         // ⏸️ else this.applySerialUpdateEffects()
      })
   }

   // 💬 2024-09-03 rvion:
   // | defaultValue should NEVER be usefull anymore
   // | when setOwnSerial is called with a defaultKey,
   // | the serial should already have the key set, and the default getValue(key)
   // | will properly retrieve the value
   //
   // ❌ get defaultValue(): VALUE | undefined {
   // ❌     if (!this.hasDefaultKey) return undefined
   // ❌     // 💬 2024-09-03 rvion:
   // ❌     // | technically, some select could allow null as KEY,
   // ❌     // | so testing against (== null) is just wrong.
   // ❌     // | that's why we use this.hasDefaultKey instead, then assume
   // ❌     // | that the defaultKey has type KEY, even if it's null in the
   // ❌     // | live below         VVVVVVVVVVVVVVVVVVVVVV
   // ❌     const defaultKey: KEY = this.defaultKey as KEY
   // ❌     const value = this.getValueFromId(defaultKey)
   // ❌     return value ?? undefined
   // ❌ }

   // set value(next: Field_selectOne_value<VALUE>) {
   //     // 🔴 can we do without this?
   // }

   /**
    * 💬 2024-09-03 domi:
    * | problem: getting the value via getOptionFromId
    * | sometimes goes through options or choices (and their side effects),
    * | when we probably just want to go from serial to value.
    * | especially in back-end when we likely don't need label or icon.
    * | In most cases (all for now), value is the id, so we can just get value from serial.
    * | see also "extra"
    */
   getValueFromId = (id: KEY): VALUE | undefined => {
      return this.config.getValueFromId(id, this)
   }

   // 💬 2024-08-21 rvion: (for @domi)
   // | I dislike this `getOptionFromId`.
   // | it is redundant / slow / sometimes unnecessary
   // | I'd rather just add the missing mapper for icon, and we would have everything.
   getOptionFromId = (id: KEY): Maybe<SelectOption<VALUE, KEY>> => this.config.getOptionFromId(id, this)

   // 🔶 do not compare queries
   get isDirtyFromSnapshot_UNSAFE(): boolean {
      const { snapshot, ...currentSerial } = this.serial
      if (snapshot == null) return false
      return stableStringify(snapshot.val) !== stableStringify(currentSerial.val)
   }
}

// DI
registerFieldClass('selectOne', Field_selectOne)
