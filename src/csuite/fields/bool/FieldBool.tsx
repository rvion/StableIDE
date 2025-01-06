import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { produce } from 'immer'
import { computed } from 'mobx'

import { Field } from '../../model/Field'
import { isProbablySerialBool, registerFieldClass } from '../WidgetUI.DI'

// #region $Config
export type Field_bool_config = FieldConfig<
   {
      /**
       * default value; true or false
       * @default: false
       */
      default?: boolean

      /** (legacy ?) Label to display to the right of the widget. */
      label2?: string

      /** Text to display, drawn by the widget itself. */
      text?: string

      /**
       * The display style of the widget.
       * - `check `: Shows a simple checkbox.
       * - `button`: Shows a toggle-able button.
       *
       *  Defaults to 'check'
       */
      display?: 'check' | 'button'

      /** Whether or not to expand the widget to take up as much space as possible
       *
       *      If `display` is 'check'
       *          undefined and true will expand
       *          false will disable expansion
       *
       *      If `display` is 'button'
       *          undefined and false will not expand
       *          true will enable expansion
       */
      expand?: boolean
   },
   Field_bool_types
>

// #region $Serial
export type Field_bool_serial = FieldSerial<{
   $: 'bool'
   value?: boolean
}>

// #region $Value
export type Field_bool_value = boolean
export type Field_bool_unchecked = Field_bool_value | undefined

// #region $Types
export type Field_bool_types = {
   $Type: 'bool'
   $Config: Field_bool_config
   $Serial: Field_bool_serial
   $Value: Field_bool_value
   $Unchecked: Field_bool_unchecked
   $Field: Field_bool
   $Child: never
   $Reflect: Field_bool_types
}

// #region State
export class Field_bool extends Field<Field_bool_types> {
   // #region Static
   static readonly type: 'bool' = 'bool'
   static readonly emptySerial: Field_bool_serial = { $: 'bool' }
   static codegenValueType(config: Field_bool_config): string {
      return `boolean`
   }
   static migrateSerial(serial: object): Maybe<Field_bool_serial> {
      if (isProbablySerialBool(serial)) {
         if ('val' in serial) {
            const recoveredVal = serial.val
            if (typeof recoveredVal !== 'boolean')
               throw new Error(`Field_button: invalid legacy 'val' serial`)
            return produce(serial, (draft) => void ((draft as Field_bool_serial).value = recoveredVal))
         }
      }
   }

   // #region Ctor
   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_bool>,
      initialMountKey: string,
      serial?: Field_bool_serial,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         value: computed,
         DefaultHeaderUI: false,
         DefaultBodyUI: false,
      })
   }

   // #region Ui
   readonly DefaultHeaderUI: -1 = -1 // FC<{ field: Field_bool }> = WidgetBoolUI
   readonly DefaultBodyUI: -1 = -1 //  undefined = undefined

   // #region Serial
   protected setOwnSerial(next: Field_bool_serial): void {
      if (next.value == null) {
         const def = this.defaultValue
         if (def != null) next = produce(next, (draft) => void (draft.value = def))
      }

      this.assignNewSerial(next)
   }

   // #region Children
   // #region Value
   get value(): Field_bool_value {
      return this.value_or_fail
   }

   set value(next: Field_bool_value) {
      if (this.serial.value === next) return
      this.patchInTransaction((serial) => void (serial.value = next))
   }

   get value_or_fail(): Field_bool_value {
      const val = this.value_unchecked
      if (val == null) throw new Error('Field_bool.value_or_fail: not set')
      return val
   }

   get value_or_zero(): Field_bool_value {
      return this.serial.value ?? false
   }

   get value_unchecked(): Field_bool_unchecked {
      return this.serial.value
   }

   // #region Changes
   get isOwnSet(): boolean {
      return this.serial.value !== undefined
   }

   get hasChanges(): boolean {
      if (this.serial.value == null) return false
      if (this.serial.value === this.defaultValue) return false
      return true
   }

   get defaultValue(): boolean | undefined {
      return this.config.default
   }

   // #region Problems
   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): Problem_Ext {
      return null
   }

   // #region Nullability
   get canBeSetOnOrOff(): true {
      return true
   }

   /** set the value to true */
   setOn(): void {
      this.value = true
   }

   /** set the value to false */
   setOff(): void {
      this.value = false
   }

   // #region Setters
   /** set value to true if false, and to false if true */
   toggle(): void {
      this.value = !this.value_or_zero
   }

   // #region Mock
   randomize(): void {
      const r = Math.random()
      this.value = r > 0.5
   }
}

// DI
registerFieldClass('bool', Field_bool)
