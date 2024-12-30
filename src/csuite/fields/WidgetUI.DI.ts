/*
🔶 2024-03-27 rvion:
| In order to make splitting forms as easy as possible
| transitively; but I'm ok with some types to be imported,
| like group, optional, shared, etc, because I expect all standalone
| build to include those.
*/

import type { BaseSchema } from '../model/BaseSchema'
import type { Field } from '../model/Field'
import type { FieldSerial_CommonProperties } from '../model/FieldSerial'
import type { Field_bool, Field_bool_serial } from './bool/FieldBool'
import type { Field_button_serial } from './button/FieldButton'
import type { Field_choices, Field_choices_serial } from './choices/FieldChoices'
import type { Field_date, Field_date_serial } from './date/FieldDate'
import type { Field_dynamic } from './dynamic/FieldDynamic'
import type { Field_group, Field_group_serial } from './group/FieldGroup'
import type { Field_image } from './image/FieldImage'
import type { Field_link, Field_link_serial } from './link/FieldLink'
import type { Field_list, Field_list_serial } from './list/FieldList'
import type { Field_number, Field_number_serial } from './number/FieldNumber'
import type { Field_optional, Field_optional_serial } from './optional/FieldOptional'
import type { Field_selectMany, Field_selectMany_serial } from './selectMany/FieldSelectMany'
import type { Field_selectOne, Field_selectOne_serial } from './selectOne/FieldSelectOne'
import type { Field_shared, Field_shared_serial } from './shared/FieldShared'
import type { Field_string, Field_string_serial } from './string/FieldString'

import { bang } from '../utils/bang'

/**
 * DI (Dependency Injection)
 * this is here to allow for hot reloading of complex widgets
 * regardless of circular dependencies.
 * 2024-03-27 update: now that we support splitting parts of
 * */
const KNOWN_FIELDS: { [widgetName: string]: Field<any> } = {}

export const getFieldClass = (fieldType: string): unknown => {
   return bang(KNOWN_FIELDS[fieldType] as any)
}

export const getFieldOptionalClass = (): typeof Field_optional => getFieldClass('optional') as any
export const getFieldLinkClass = (): typeof Field_link<any, any> => getFieldClass('link') as any
export const getFieldDynamicClass = (): typeof Field_dynamic<any> => getFieldClass('dynamic') as any
export const getFieldSharedClass = (): typeof Field_shared => getFieldClass('shared') as any
export const getFieldGroupClass = (): typeof Field_group<any> => getFieldClass('group') as any
export const getFieldStringClass = (): typeof Field_string => getFieldClass('str') as any
export const getFieldNumberClass = (): typeof Field_number => getFieldClass('number') as any
export const getFieldListClass = (): typeof Field_list<any> => getFieldClass('list') as any
export const getFieldSelectOneClass = (): typeof Field_selectOne<any, string> =>
   getFieldClass('selectOne') as any

export const registerFieldClass = <T extends { $Type: string }>(
   //
   type: T['$Type'],
   kls: { new (...args: any[]): T },
): void => {
   KNOWN_FIELDS[type] = kls as any
}

// help with DI, and help around some typescript bug not able to narrow types
// in conditional when instance of is used with a ctor stored in a dictionary
export const isFieldOptional = _checkIfIs<Field_optional>('optional')
export const isFieldLink = _checkIfIs<Field_link<any, any>>('link')
export const isFieldDynamic = _checkIfIs<Field_dynamic<any>>('dynamic')
export const isFieldShared = _checkIfIs<Field_shared>('shared')
export const isFieldGroup = _checkIfIs<Field_group<any>>('group')
export const isFieldString = _checkIfIs<Field_string>('str')
export const isFieldNumber = _checkIfIs<Field_number>('number')
export const isFieldBool = _checkIfIs<Field_bool>('bool')
export const isFieldImage = _checkIfIs<Field_image>('image')
export const isFieldList = _checkIfIs<Field_list<any>>('list')
export const isFieldSelectOne = _checkIfIs<Field_selectOne<any, any>>('selectOne')
export const isFieldSelectMany = _checkIfIs<Field_selectMany<any, any>>('selectMany')
export const isFieldChoices = _checkIfIs<Field_choices<any>>('choices', (f) => f.isMulti)
export const isFieldChoice = _checkIfIs<Field_choices<any>>('choices', (f) => f.isSingle)
export const isFieldDate = _checkIfIs<Field_date<any>>('date')

function _checkIfIs<W extends { $Type: string; $Field: Field }>(
   /** widget type to check */
   type: W['$Type'],
   predicate?: (widget: W['$Field']) => boolean,
): (widget: any) => widget is W {
   return (widget): widget is W => {
      if (widget == null) return false
      if (typeof widget !== 'object') return false
      if (widget.type !== type) return false
      if (predicate && !predicate(widget)) return false
      return true
   }
}

function _checkIfIsOptionalOf<W extends BaseSchema>(
   type: W['$Type'],
   predicate?: (widget: W['$Field']) => boolean,
): (widget: any) => widget is Field_optional<W> {
   const checkChild = _checkIfIs<W>(type, predicate)

   return (widget): widget is Field_optional<W> => {
      if (!isFieldOptional(widget)) return false
      const child = widget.child
      return checkChild(child)
   }
}

// help with DI, and help around some typescript bug not able to narrow types
// in conditional when instance of is used with a ctor stored in a dictionary
export const isProbablySerialOptional = _checkIfSerialIs<Field_optional_serial>('optional')
export const isProbablySerialLink = _checkIfSerialIs<Field_link_serial<any, any>>('link')
export const isProbablySerialShared = _checkIfSerialIs<Field_shared_serial>('shared')
export const isProbablySerialGroup = _checkIfSerialIs<Field_group_serial<any>>('group')
export const isProbablySerialString = _checkIfSerialIs<Field_string_serial>('str')
export const isProbablySerialDate = _checkIfSerialIs<Field_date_serial>('date')
export const isProbablySerialNumber = _checkIfSerialIs<Field_number_serial>('number')
export const isProbablySerialBool = _checkIfSerialIs<Field_bool_serial>('bool')
export const isProbablySerialButton = _checkIfSerialIs<Field_button_serial>('button')
export const isProbablySerialList = _checkIfSerialIs<Field_list_serial<any>>('list')
export const isProbablySerialSelectOne = _checkIfSerialIs<Field_selectOne_serial<any>>('selectOne')
export const isProbablySerialSelectMany = _checkIfSerialIs<Field_selectMany_serial<any>>('selectMany')
export const isProbablySerialChoices = _checkIfSerialIs<Field_choices_serial<any>>('choices')

export const isProbablySomeFieldSerial = (object: object): object is FieldSerial_CommonProperties => {
   if (object == null) throw new Error('❌ invariant violation')
   if (typeof object !== 'object') throw new Error('❌ invariant violation')
   return '$' in object && typeof object.$ === 'string'
}

function _checkIfSerialIs<W extends { $: string }>(
   /** widget type to check */
   type: W['$'],
): (widget: any) => widget is W {
   return (serial): serial is W => {
      if (serial == null) return false
      if (typeof serial !== 'object') return false
      if (serial.$ !== type) return false
      return true
   }
}
