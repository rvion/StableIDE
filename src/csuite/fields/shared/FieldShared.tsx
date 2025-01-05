import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { Field } from '../../model/Field'
import { registerFieldClass } from '../WidgetUI.DI'

// #region CONFIG TYPE
export type Field_shared_config<F extends Field> = FieldConfig<
   //
   { field: F },
   Field_shared_types<F>
>

// #region SERIAL TYPE
export type Field_shared_serial = FieldSerial<{
   $: 'shared'
   // NO VALUE HERE; otherwise, we would store the data twice
}>

// #region VALUE TYPE
export type Field_shared_value<F extends Field = Field> = F['$Value']
export type Field_shared_unchecked<F extends Field = Field> = F['$Unchecked']

// #region $FieldTypes
export type Field_shared_types<F extends Field = Field> = {
   $Type: 'shared'
   $Config: Field_shared_config<F>
   $Serial: Field_shared_serial
   $Value: Field_shared_value<F>
   $Unchecked: Field_shared_unchecked<F>
   $Field: Field_shared<F>
   $Child: F
   $Reflect: Field_shared_types<F>
}

// #region STATE
export class Field_shared<F extends Field = Field> extends Field<Field_shared_types<F>> {
   // #region TYPE
   static readonly type: 'shared' = 'shared'
   static readonly emptySerial: Field_shared_serial = { $: 'shared' }
   static codegenValueType(config: Field_shared_config<any>): string {
      return config.field.schema.codegenValueType()
   }
   static migrateSerial(): undefined {}

   // #region CTOR
   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_shared<F>>,
      initialMountKey: string,
      serial?: Field_shared_serial,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         DefaultHeaderUI: false,
         DefaultBodyUI: false,
      })
   }

   // #region UI
   DefaultHeaderUI: -1 = -1
   DefaultBodyUI: -1 = -1

   protected setOwnSerial(_next: Field_shared_serial): void {}

   get isOwnSet(): boolean {
      return this.shared.isSet
   }

   get hasChanges(): boolean {
      return this.shared.hasChanges
   }

   get actualWidgetToDisplay(): Field {
      return this.shared.actualWidgetToDisplay
   }

   get shared(): F {
      return this.config.field
   }

   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): Problem_Ext {
      return this.shared.ownTypeSpecificProblems
   }

   get value(): Field_shared_value<F> {
      return this.shared.value
   }

   set value(val: Field_shared_value<F>) {
      this.shared.value = val
   }

   get value_or_fail(): Field_shared_value<F> {
      return this.shared.value_or_fail
   }

   get value_or_zero(): Field_shared_value<F> {
      return this.shared.value_or_zero
   }

   get value_unchecked(): Field_shared_unchecked<F> {
      return this.shared.value_unchecked
   }
}

// DI
registerFieldClass('shared', Field_shared)
