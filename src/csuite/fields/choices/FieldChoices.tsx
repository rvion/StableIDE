import type { IconName } from '../../icons/icons'
import type { BaseSchema } from '../../model/BaseSchema'
import type { KeyedField, VALUE_MODE } from '../../model/Field'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Instanciable } from '../../model/Instanciable'
import type { Repository } from '../../model/Repository'
import type { SchemaDict } from '../../model/SchemaDict'
import type { Problem_Ext } from '../../model/Validation'
import type { ProplessFC } from '../../types/ReactUtils'
import type { CovariantFn } from '../../variance/BivariantHack'
import type { CovariantFC } from '../../variance/CovariantFC'
import type { TabPositionConfig } from './TabPositionConfig'

import { produce } from 'immer'

import { Field } from '../../model/Field'
import { capitalize } from '../../utils/capitalize'
import { makeLabelFromPrimitiveValue } from '../../utils/makeLabelFromFieldName'
import { isProbablySerialChoices, registerFieldClass } from '../WidgetUI.DI'
import { WidgetChoices_BodyUI } from './WidgetChoices_BodyUI'
import { WidgetChoices_HeaderButtonsUI } from './WidgetChoices_HeaderButtonsUI'
import { WidgetChoices_HeaderSelectUI } from './WidgetChoices_HeaderSelectUI'
import { WidgetChoices_HeaderUI } from './WidgetChoices_HeaderUI'

type ActiveBranchesByName<T> = { [key in keyof T]?: true }
// type ActiveBranchesByNameDefault<T> = { [key in keyof T]?: true }
// type ActiveBranchesByNameDefault<T> = { [key in keyof T]?: boolean }

// #region CONFIG TYPE
export type Field_choices_config<T extends SchemaDict = SchemaDict> = FieldConfig<
   {
      /** schema for  all possible branches */
      items: T

      /**
       * true  => 0, 1 or more values can be selected
       * false => one and only one value can be selected (not 0, not 2)
       */
      multi: boolean

      /**
       * either a branch name if only one branch is active,
       * or a Dict<boolean> if multiple
       * // | boolean 🔴 TODO: support boolean default for "ALL ON", or "ALL OFF"
       */
      default?: ActiveBranchesByName<T> | keyof T
      // TODO: add defaultExhaustive so we can easilly force ourselved to handle all cases.

      // UI stuff----------------------
      /** placeholder to display in widget that support placeholders */
      placeholder?: string

      /** preffered widget to use for value selection */
      appearance?: 'select' | 'tab' | 'tab2'

      /** if the widget use tabs, where to place tabs */
      tabPosition?: TabPositionConfig

      /** UI stuff */
      expand?: boolean
   },
   Field_choices_types<T>
>

// #region SERIAL TYPE
export type Field_choices_serial<T extends SchemaDict = SchemaDict> = FieldSerial<{
   $: 'choices'

   /**
    * boolean dict (Record<BranchName, boolean>) of active branches
    * 👉 canonical form: only keep true properties.
    */
   branches?: ActiveBranchesByName<T>

   /** every children serial, including disabled ones */
   values?: { [k in keyof T]?: T[k]['$Serial'] }
}>

// #region VALUE TYPE
export type Field_choices_value<T extends SchemaDict = SchemaDict> = {
   [k in keyof T]?: T[k]['$Value']
}

export type Field_choices_unchecked<T extends SchemaDict = SchemaDict> = {
   [k in keyof T]?: T[k]['$Unchecked']
}

// #region $TypeString
export type Field_choices_types<T extends SchemaDict = SchemaDict> = {
   $Type: 'choices'
   $Config: Field_choices_config<T>
   $Serial: Field_choices_serial<T>
   $Value: Field_choices_value<T>
   $Unchecked: Field_choices_unchecked<T>
   $Field: Field_choices<T>
   $Child: T[keyof T]
   $Reflect: Field_choices_types<T>
}

export type MAGICCHOICES<T extends { [key: string]: { $Field: any } }> = {
   [K in keyof T as Capitalize<K & string>]?: T[K]['$Field']
}

export type FieldChoices<T extends SchemaDict> = Field_choices<T> & MAGICCHOICES<T>

// #region STATE
export class Field_choices<T extends SchemaDict = SchemaDict> extends Field<Field_choices_types<T>> {
   // #region TYPE
   static readonly type: 'choices' = 'choices'
   static readonly emptySerial: Field_choices_serial = { $: 'choices' }
   static codegenValueType(config: Field_choices_config<any>): string {
      return [
         `{`,
         (Object.entries(config.items) as [string, BaseSchema][])
            .map(([k, v]) => `${k}?: Maybe<${v.codegenValueType()}>`)
            .join('; '),
         `}`,
      ].join(' ')
   }
   static migrateSerial<T extends SchemaDict>(serial: object): Maybe<Field_choices_serial<T>> {
      if (isProbablySerialChoices(serial)) {
         if ('values_' in serial) {
            const legacyValues = serial.values_ as Field_choices_serial<T>['values'] // 🔴 very unchecked cast, much danger
            const { $, values_, ...rest } = serial
            const next: Field_choices_serial<T> = {
               $: 'choices',
               values: legacyValues,
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
      schema: BaseSchema<Field_choices<T>>,
      initialMountKey: string,
      serial?: Field_choices_serial<T>,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      for (const [fName, fSchema] of this._fieldSchemas) {
         Object.defineProperty(this, capitalize(fName), {
            get: () => this.activeBranchesDict[fName],
            configurable: true,
         })
      }

      this.init(serial, {
         // UI
         // DefaultHeaderUI: false,
         // DefaultBodyUI: false,
         // values
         value_or_fail: false,
         value_or_zero: false,
         value_unchecked: false,
      })
   }

   // #region UI
   // UITab: ProplessFC = () => <WidgetChoices_HeaderButtonsUI field={this} />
   // UISelect: ProplessFC = () => <WidgetChoices_HeaderSelectUI field={this} />
   // UIChildren: ProplessFC = () => <WidgetChoices_BodyUI field={this} justify={false} />
   // DefaultHeaderUI = WidgetChoices_HeaderUI
   // DefaultBodyUI = WidgetChoices_BodyUI

   // #region MISC
   readonly expand: boolean = this.config.expand ?? false

   /**
    * true if the choice widget multiple values (0+)
    */
   get isMulti(): boolean {
      return this.config.multi
   }

   /**
    * true if the choice widget accept ONE and only ONE value
    * (not 0, not 2+)
    */
   get isSingle(): boolean {
      return !this.config.multi
   }

   /**
    * dictionary of enabled children branches
    * TODO: rename
    */
   activeBranchesDict: { [k in keyof T]?: T[k]['$Field'] } = {}
   get activeBranchesList(): T[keyof T]['$Field'][] {
      return Object.values(this.activeBranchesDict)
   }

   // /** alias for enabledBranches */
   // get branches(): { [k in keyof T]?: T[k]['$Field'] } {
   //     return this.activeBranchesDict
   // }

   /**
    * very handy to mimmic fieldGropu api a bit,
    * since choiceS are equivalent to partial object
    */
   get fields(): { [k in keyof T]?: T[k]['$Field'] } {
      return this.activeBranchesDict
   }

   get firstPossibleChoice(): (keyof T & string) | undefined {
      return this.allPossibleChoices[0]
   }

   get allPossibleChoices(): (keyof T & string)[] {
      return Object.keys(this.config.items)
   }

   get isCollapsible(): boolean {
      if (this.isMulti) return false
      // 🔶 may be wrong, but it really annoys me right now
      if (this.activeBranchNames.length === 0) return false
      return super.isCollapsible
   }

   match<RESULT>(cases: {
      [K in keyof T]?: CovariantFn<[field: T[K]['$Field']], RESULT>
   }): Maybe<RESULT> {
      for (const branch of this.activeBranchesList) {
         if (branch && branch.mountKey in cases) {
            return cases[branch.mountKey]!(branch)
         }
      }
   }

   matchAll<RESULT>(cases: {
      [K in keyof T]?: CovariantFn<[field: T[K]['$Field']], RESULT>
   }): RESULT[] {
      const OUT: RESULT[] = []
      for (const branch of this.activeBranchesList) {
         if (branch && branch.mountKey in cases) {
            OUT.push(cases[branch.mountKey]!(branch))
         }
      }
      return OUT
   }

   get choicesWithLabels(): { key: keyof T & string; label: string; icon?: IconName }[] {
      return this.allPossibleChoices.map((key) => {
         const schema = this.getSchemaForBranch(key)
         return {
            key,
            // note:
            // if child.config.label === false => makeLabelFromFieldName(key)
            // if child.config.label === '' => makeLabelFromFieldName(key)
            label:
               typeof schema.config.label === 'string' && schema.config.label.length > 0
                  ? schema.config.label
                  : makeLabelFromPrimitiveValue(key),
            icon: schema.config.icon,
         }
      })
   }

   /** array of all active branch keys */
   get activeBranchNames(): (keyof T & string)[] {
      const branches = this.serial.branches
      if (branches == null) return []
      return Object.keys(branches).filter((x) => branches[x])
   }

   get firstActiveBranchName(): (keyof T & string) | undefined {
      return this.activeBranchNames[0]
   }

   get firstActiveBranchField(): T[keyof T]['$Field'] | undefined {
      if (this.firstActiveBranchName == null) return undefined
      return this.activeBranchesDict[this.firstActiveBranchName]
   }

   /**
    * @since 2024-09-11
    */
   private isValidBranchName(branchName: string): branchName is keyof T & string {
      if (this.allPossibleChoices.includes(branchName)) return true
      return false
   }

   /**
    * return all branches that should be active by default.
    * more practical/consise/efficient that relying on isBranchActiveByDefault
    * @since 2024-09-11
    */
   private get branchesActiveByDefault(): (keyof T & string)[] {
      const def = this.config.default
      if (def == null) return []
      if (typeof def === 'string') {
         if (this.isValidBranchName(def)) return [def]
         return []
      }
      return Object.keys(def).filter((k) => this.isValidBranchName(k))
   }

   isBranchActiveByDefault(branchName: keyof T & string): boolean {
      const def = this.config.default
      if (def == null) return false
      if (typeof def === 'string') return branchName === def
      return Boolean((def as ActiveBranchesByName<T>)[branchName])

      // 💬 2024-09-11 rvion:
      // | we used to pick the first available branch in single mode
      // | this is now handled at the builder level with `choice` and `choice_`
      // | variants.
      // |
      // | ```
      // | if (def == null) {
      // |     if (this.isMulti) return false
      // |     return this.allPossibleChoices[0] === branchName
      // | }
      // | ```
   }

   // #region Utilities
   private getActiveBranchNamesFromBooleanRecord = (record?: ActiveBranchesByName<T>): (keyof T)[] => {
      if (record == null) return []
      return Object.entries(record)
         .filter(([k, active]) => active && this.allPossibleChoices.includes(k))
         .map(([k]) => k)
   }

   // #region VALIDATION

   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): Problem_Ext {
      const OUT: Problem_Ext[] = []
      const config = this.config
      const serial = this.serial
      if (this.isSingle) {
         const activeBranchesNames = this.getActiveBranchNamesFromBooleanRecord(serial.branches)

         // 1. more than one active branch, while in single mode
         if (activeBranchesNames.length > 1) {
            OUT.push('Only One choices allowed but has multiple active branches')
         }

         // 💬 2024-09-11 rvion:
         // | no longer needed, handled by the `isOwnSet` getter
         // |
         // | ```
         // | // 2. no branch selected
         // | if (activeBranches.length > 1) {
         // |     OUT.push('Only One choices allowed but has multiple active branches')
         // | }
         // | ```
      }
      return OUT
   }

   get hasChanges(): boolean {
      for (const branchName of this.allPossibleChoices) {
         const shouldBeActive = this.isBranchActiveByDefault(branchName)
         const child = this.activeBranchesDict[branchName]
         if (child && !shouldBeActive) return true
         if (!child && shouldBeActive) return true
         if (child && shouldBeActive && child.hasChanges) return true
      }
      return false
   }

   get isOwnSet(): boolean {
      if (this.serial.values == null) return false
      if (this.serial.branches == null) return false
      return true
      // if (this.subFields.some((f) => !f.isSet)) return false
      // return true
      // // 💬 2024-09-02 rvion:
      // // | seems to be the correct way to go with for optional stuff
      // // | that can be both without default and without value.
      // if (this.isMulti) return true

      // //
      // const hasAtLeastOneActiveBranch = Object.values(this.serial.branches).some((active) => active)
      // if (!hasAtLeastOneActiveBranch) return false
      // return this.subFields.every((f) => f.isSet)
   }

   // #region CHILDREN

   /**
    * as of 2024-09-11, choices eagerly dispose de-activated branches,
    * so it's active children fields are just the activated one
    */
   get childrenAll(): this['$Child']['$Field'][] {
      return Object.values(this.activeBranchesDict)
   }

   get childrenActive(): Field[] {
      return Object.values(this.activeBranchesDict)
   }

   get subFieldsWithKeys(): KeyedField[] {
      return Object.entries(this.activeBranchesDict).map(([key, field]) => ({ key, field }))
   }

   _acknowledgeCount: number = 0
   _acknowledgeNewChildSerial(mountKey: keyof T & string, childSerial: any): boolean {
      this._acknowledgeCount++
      return this.patchSerial((draft) => {
         draft.values ??= {}
         draft.values[mountKey] = childSerial
      })
   }

   protected checkConfigValidity(): Problem_Ext[] {
      // INVARIANT CHECKING -----------------------------------------------------------------------------
      const OUT: Problem_Ext[] = []
      const config = this.config

      // 1. legacy config.items format
      if (typeof config.items === 'function') {
         OUT.push('❌ ChoicesWidget "items" property should now be an object, not a function')
      }

      // 2. more than 1 default, while in single mode
      if (
         this.isSingle &&
         typeof config.default === 'object' &&
         this.getActiveBranchNamesFromBooleanRecord(config.default).length > 1
      ) {
         OUT.push('❌ ChoicesWidget is single but default sets multiple branches')
      }
      return OUT
   }

   /**
    * technically, we can't always guarantee the config schema dict only contains schema for branches
    * since we allow to pass already instantiated fields instead of schema (in this case, those are wrapped)
    * as Schema as shared (SimpleSchema<Field_shared<....>>)
    */
   private getSchemaForBranch(branchName: keyof T & string): Instanciable {
      let schema = this.config.items[branchName]
      if (typeof schema === 'function') schema = (schema as any)() // 💊 temporary backward compat
      if (schema == null) throw new Error(`❌ Branch "${branchName}" has no initializer function`)
      return schema
   }

   /** just here to normalize fieldSchema definitions, since it used to be a lambda */
   private get _fieldSchemas(): [keyof T & string, BaseSchema<any>][] {
      const itemsDef = this.config.items
      const fieldSchemas: SchemaDict =
         typeof itemsDef === 'function' //
            ? ((itemsDef as any)() ?? {}) // <-- LEGACY SUPPORT
            : (itemsDef ?? {})
      return Object.entries(fieldSchemas) as [keyof T & string, BaseSchema<any>][]
   }

   // #region setOwnSerial
   protected setOwnSerial(next: this['$Serial']): void {
      this.checkConfigValidity() // 🔴 bof -> à appeler ailleurs

      // Normalization:
      // Only setting values is supported since 2024-09-11
      if (next.values != null && next.branches == null) {
         const branchNames: (keyof T & string)[] = Object.keys(next.values)
         next = produce(next, (draft: this['$Serial']) => {
            draft.branches ??= {}
            for (const branchName of branchNames) {
               draft.branches[branchName] = true
            }
         })
      }

      this.assignNewSerial(next)

      // if field is not set, and field has default => apply default
      if (next.branches == null) {
         // make sure we have branches set even if no values, when default
         if (this.config.default != null) {
            this.patchSerial((draft) => {
               draft.branches = {}
               draft.values = {}
            })
         }

         // then activate default brances (possibly none)
         const branchesActiveByDefault = this.branchesActiveByDefault
         for (const branch of branchesActiveByDefault) {
            // allocate holes in the serial + set branch active...
            this.patchSerial((draft) => {
               draft.values ??= {}
               draft.branches ??= {}
               draft.branches[branch] = true
            })
            // ...and reconcile
            this.RECONCILE({
               mountKey: branch,
               correctChildSchema: this.getSchemaForBranch(branch),
               existingChild: this.activeBranchesDict[branch],
               targetChildSerial: null,
               attach: (child) => {
                  this.activeBranchesDict[branch] = child
               },
            })
         }
         return
      }

      // otherwise, simply hydate
      for (const branch of this.allPossibleChoices) {
         const branchSerial = next.values?.[branch]
         const schema = this.getSchemaForBranch(branch)
         const isActive = Boolean(next.branches?.[branch])
         if (isActive) {
            // set the active branch as active...
            this.patchSerial((draft) => {
               draft.values ??= {}
               draft.branches ??= {}
               draft.branches[branch] = true
            })
            // and reconcile
            this.RECONCILE({
               mountKey: branch,
               correctChildSchema: schema,
               existingChild: this.activeBranchesDict[branch],
               targetChildSerial: branchSerial,
               attach: (child) => {
                  this.activeBranchesDict[branch] = child
               },
            })
         } else {
            // remove children
            const prevChild = this.activeBranchesDict[branch]
            if (prevChild) {
               prevChild.disposeTree()
               delete this.activeBranchesDict[branch]
            }
         }
      }
   }

   // #region VALUE

   /** results, but only for active branches */
   get value(): Field_choices_value<T> {
      return this.value_or_fail
   }

   set value(val: Field_choices_value<T>) {
      this.runInTransaction(() => {
         for (const branch of this.allPossibleChoices) {
            this._setBranchValue(branch, val[branch])
         }
      })
   }

   value_or_fail: Field_choices_value<T> = new Proxy({} as any, this.makeValueProxy('fail'))
   value_or_zero: Field_choices_value<T> = new Proxy({} as any, this.makeValueProxy('zero'))
   value_unchecked: Field_choices_unchecked<T> = new Proxy({} as any, this.makeValueProxy('unchecked'))

   private makeValueProxy(mode: VALUE_MODE): ProxyHandler<any> {
      return {
         ownKeys: (_target): string[] => {
            return this.activeBranchNames
         },
         set: (_target, prop, value): boolean => {
            if (typeof prop !== 'string') return false
            const branchName = prop
            const subWidget: Maybe<Field> = this.activeBranchesDict[branchName]
            // case when branch currently DISABLED
            if (subWidget == null) {
               const field = this.enableBranch(branchName)
               if (field == null) return false
               field.value = value
               return true
            }
            // case when branch currently ENABLED
            else {
               subWidget.value = value
               return true
            }
         },
         get: (_target, prop): any => {
            if (typeof prop !== 'string') return
            const branchName = prop
            const subWidget: Maybe<Field> = this.activeBranchesDict[branchName]
            if (subWidget == null) return
            return subWidget.getValue(mode)
         },
         getOwnPropertyDescriptor: (_target, prop): PropertyDescriptor | undefined => {
            if (typeof prop !== 'string') return
            const branchName = prop
            const subWidget: Maybe<Field> = this.activeBranchesDict[branchName]
            if (subWidget == null) return
            return {
               enumerable: true,
               configurable: true,
               get(): any {
                  return subWidget.getValue(mode)
               },
            }
         },
      }
   }

   // #region METHODS
   disableBranch(branch: keyof T & string): void {
      // ensure branch to disable is enabled
      if (!this.activeBranchesDict[branch]) {
         return // console.info(`❌ Branch "${branch}" not enabled`)
      }
      this.runInTransaction(() => {
         // remove children
         const prevChild = this.activeBranchesDict[branch]
         if (prevChild) prevChild.disposeTree()
         delete this.activeBranchesDict[branch]

         // WE NEED TO KEEP THIS ONE UNLESS WE WANT TO DISCARD THE DRAFT
         // we could make this opt-in via a config flag and persist in memory only via enableBranch
         // delete this.serial.values_[branch]

         this.patchSerial((draft) => {
            draft.branches ??= {}
            delete draft.branches[branch] // = false
         })
      })
   }

   enableBranch<K extends keyof T & string>(branchName: K): Maybe<T[K]['$Field']> {
      // ensure branch to enable is disabled
      if (this.isBranchEnabled(branchName)) {
         return void console.info(`❌ Branch "${branchName}" already enabled`)
      }

      this.runInTransaction(() => {
         if (this.isSingle) {
            for (const key in this.activeBranchesDict) {
               this.disableBranch(key)
            }
         }

         const schema = this.getSchemaForBranch(branchName)
         this.RECONCILE({
            mountKey: branchName,
            correctChildSchema: schema,
            existingChild: this.activeBranchesDict[branchName],
            targetChildSerial: this.serial.values?.[branchName],
            attach: (child) => {
               this.activeBranchesDict[branchName] = child
            },
         })

         // set the active branch as active
         this.patchSerial((draft) => {
            draft.branches ??= {}
            draft.branches[branchName] = true
         })
      })

      return this.activeBranchesDict[branchName]
   }

   toggleBranch(branch: keyof T & string): void {
      // 💬 2024-03-15 rvion: no need to bumpValue in this function;
      // | it's handled by enableBranch and disableBranch themselves.
      if (this.isBranchEnabled(branch)) {
         if (this.isMulti) this.disableBranch(branch)
      } else {
         this.enableBranch(branch)
      }
   }

   isBranchDisabled(branch: keyof T & string): boolean {
      return !this.isBranchEnabled(branch)
   }

   isBranchEnabled(branch: keyof T & string): boolean {
      if (this.serial.branches == null) return false
      return Boolean(this.serial.branches[branch])
   }

   /**
    * this method:
    *
    *  - DOES not change the active branch / nor toogle the branch
    *    It ONLY sets the branch value, but the branch remains either enabled or disabled
    *    according ot its previous state
    *
    *  - returns `true` if actually changed something, false otherwise
    *    (return type needed because this method is used in the value proxy)
    *
    */
   private _setBranchValue(
      //
      branch: keyof T & string,

      /**
       * pass null or undefined to disable the branch
       *
       * 🙈 < YES, you could have a choices<optional<int>>
       *      and you could want to disable the optional instead.
       *      but same goes for optional<optional<int>>
       *      or optional<optional<optional<int>>>.
       *
       *      Let's just say that passing null disable the highest
       *      level field that can be disabled.
       */
      value?: Maybe<T[keyof T]['$Value']>,
   ): boolean {
      // case 1. branch should be DISABLED
      if (value == null) {
         // disable branch
         if (this.isBranchEnabled(branch)) {
            this.disableBranch(branch)
            return true
         } else {
            return false
         }
      }

      // case 2. branch should be ENABLED
      else {
         // 2.1. enable branch if disabled
         if (this.isBranchDisabled(branch)) this.enableBranch(branch)

         // 2.2 then patch branch value to given value
         this.activeBranchesDict[branch]!.value = value!
         return true
      }
   }
}

// DI
registerFieldClass('choices', Field_choices)
