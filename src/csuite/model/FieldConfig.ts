import type { Box } from '../box/Box'
import type { IconName } from '../icons/icons'
import type { TintExt } from '../kolor/Tint'
import type { CovariantFn, CovariantFn1 } from '../variance/BivariantHack'
import type { CovariantFC } from '../variance/CovariantFC'
import type { FieldTypes } from './$FieldTypes'
import type { BaseSchema } from './BaseSchema'
import type { Field, FieldCtorProps } from './Field'
import type { FieldOptions } from './FieldOptions'
import type { KlassToUse } from './KlassToUse'
import type { FieldReaction } from './pubsub/FieldReaction'
import type { Producer } from './pubsub/Producer'
import type { Problem_Ext } from './Validation'

export type FieldConfig<X, T extends FieldTypes> = X & FieldConfig_CommonProperties<T>

export interface FieldConfig_CommonProperties<out T extends FieldTypes> {
   // TODO: rename to `ui`
   uiui?: RENDERER.UIConf<T['$Field']>
   /**
    * @since 2024-05-20
    * @stability beta
    * Icon name from the icon library.
    *   - "mdi..." for Material design icons - 7000+ icons https://pictogrammers.com/library/mdi/)
    *   - "cdi..." for Cushy design icons - 1+ custom icon by the cushy team
    *   - "ldi..." for Locomotive design icons
    */
   icon?: IconName
   // ❌ warning: 2024-06-14 rvion: using this expression with an union here will
   // ❌ CHOKE typescript typechecking performances.
   // ❌ | icon?: IconName | CovariantFn<T['$Field'], IconName> // IconName

   /**
    * @since 2024-05-19
    * @stability beta
    * Appearance box props
    */
   box?: Box

   // --------------------------------
   /**
    * override the default header renderer
    * (passing `null` to restore the default renderer)
    */
   header?: null | CovariantFC<{ field: T['$Field']; readonly?: boolean }>

   /**
    * override the default body renderer
    * (passing `null` to restore the default renderer)
    */
   body?: null | CovariantFC<{ field: T['$Field'] }>

   /**
    * override the default string renderer
    * (passing `null` to restore the default renderer)
    */
   toSummary?: null | CovariantFn<[field: T['$Field']], string>

   // --------------------------------

   /**
    * This function will be executed before every widget instanciation.
    * if the version is not the samed as store in the serial
    *
    * @since 2024-05-14
    * @stability beta
    */
   beforeInit?: CovariantFn<[serial: unknown /* T['$Serial'] */], T['$Serial']>
   version?: string

   /**
    * @since 2024-05-14
    * @stability beta
    * This function will be executed either on every widget instanciation.
    */
   onInit?: CovariantFn1<T['$Field'], void>

   /** will be called when value changed */
   onValueChange?: CovariantFn<[field: T['$Field']], void>

   /** will be called when serial changed */
   onSerialChange?: CovariantFn<[self: T['$Field']], void>

   /**
    * will be called before disposing the tree
    * @since 2024-07-11
    * @status NOT IMPLEMENTED
    * @experimental
    */
   onDispose?: CovariantFn1<T['$Field'], void>

   /** allow to set custom actions on your widgets */
   presets?: WidgetMenuAction<T>[]

   /** custom type checking;
    * valid:
    *  - true,
    *  - [],
    * invalid:
    *  - false,
    *  - ["errMsg", ...]
    *  - "errMsg"
    * */
   check?: CovariantFn<[val: T['$Field']], Problem_Ext>

   /**
    * The label to display.
    * If none provided, the parent key is going to be converted as label.
    * - use false to disable
    * - use "" for an emtpy string label
    */
   label?: string | false

   /** The layout direction, H for 'horizontal' or V for 'vertical' */
   layout?: 'H' | 'V'

   /** Description of what the field is or does. (An ending period will be added automatically) */
   description?: string

   /**
    * Will be injected around the widget;
    * Allow you to customize look and feel a bit without having
    * to use custom widgets
    * */
   className?: string

   /**
    * [DEBUG FEATURE] show the ID right after the label
    * may be usefull when debugging dynamic widgets referencing themselves.
    */
   showID?: boolean

   /**
    * override the default `collapsed` status
    * only taken into account when widget is collapsible
    */
   startCollapsed?: boolean

   /** if false, the widget will always be expanded */
   collapsed?: false

   /** if provided, override the default logic to decide if the widget need to be bordered */
   border?: TintExt

   /** frame background used in the widget with label */
   background?: TintExt

   /** if provided, override the default logic to decide if the widget need to be bordered */
   justifyLabel?: boolean

   /** if provided, widget will be hidden */
   hidden?: boolean

   /** unused internally, here so you can add whatever you want inside */
   custom?: unknown

   // EXTENSION SYSMEM ------------------------------------------------------
   // csuite models have 3 main ways to be extends:
   //    1. custom sub-class via `classToUse`
   //    2. custom sub-class or something else via `builderToUse`
   //    3. manually adding properties via `customFieldProperties`

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.useClass(...) method instead
    *
    * @since 2024-08-14
    * @stability beta
    */
   classToUse?: KlassToUse<T['$Field'], any>
   // classToUse?: CovariantFn1<new (...args: any[]) => T['$Field'], new (...args: any[]) => any>

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.useBuilder(...) method instead
    *
    * @since 2024-08-14
    * @stability beta
    */
   builderToUse?: CovariantFn<FieldCtorProps<any>, any>

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.extend(...) method instead
    *
    * Mixin system for the field.
    */
   customFieldProperties?: FieldExtension<any>[]

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.extendSchema (...) method instead
    * (mixin system for the schema)
    *
    * 💬 2024-08-30 rvion: was probably a bad idea
    * @depreacted
    */
   customSchemaProperties?: SchemaExtension<any>[]

   // PUB-SUB SYSMEM ------------------------------------------------------

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.publish(...) method instead
    *                          ^^^^^^^^^^^^
    * @since 2024-05-01
    * @stability beta
    */
   producers?: Producer<any, T['$Field']>[]

   /**
    * @internal
    * you probably DON'T want to specify this manually.
    * you can use the <schema>.addReaction(...) method instead
    *                          ^^^^^^^^^^^^^^^^
    */
   reactions?: FieldReaction<T>[]

   /**
    * 2024-08-08 domi: not really used / thought through
    * mostly placeholders
    */
   required?: boolean
   readonly?: boolean

   // TODO 🔴 remove that
   saveChanges?: (field: Field) => Promise<void>

   // TODO 🔴 remove that
   cancelChanges?: (field: Field) => Promise<void>

   instanciationOption?: FieldOptions
}

export interface WidgetMenuAction<out T extends FieldTypes> {
   /** https://pictogrammers.com/library/mdi/ */
   label: string
   icon?: IconName
   apply(field: T['$Field']): void
}

export type SchemaExtension<T extends BaseSchema<any>> = (schema: T) => object
export type FieldExtension<T extends Field> = (field: T) => object
