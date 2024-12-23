import type { ComfyUnionValue } from '../comfyui/comfyui-types'
import type { Field_board } from '../csuite/fields/board/Field_board'
import type { Field_bool } from '../csuite/fields/bool/FieldBool'
import type { Field_button } from '../csuite/fields/button/FieldButton'
import type { Field_choices } from '../csuite/fields/choices/FieldChoices'
import type { Field_color } from '../csuite/fields/color/FieldColor'
import type { Field_custom } from '../csuite/fields/custom/FieldCustom'
import type { Field_date } from '../csuite/fields/date/FieldDate'
import type { Field_dynamic } from '../csuite/fields/dynamic/FieldDynamic'
import type { Field_enum } from '../csuite/fields/enum/FieldEnum'
import type { Field_group, Field_group_types, FieldGroup } from '../csuite/fields/group/FieldGroup'
import type { Field_image } from '../csuite/fields/image/FieldImage'
import type { Field_link } from '../csuite/fields/link/FieldLink'
import type { Field_list } from '../csuite/fields/list/FieldList'
import type { Field_markdown } from '../csuite/fields/markdown/FieldMarkdown'
import type { Field_matrix } from '../csuite/fields/matrix/FieldMatrix'
import type { Field_number } from '../csuite/fields/number/FieldNumber'
import type { Field_optional } from '../csuite/fields/optional/FieldOptional'
import type { Field_orbit } from '../csuite/fields/orbit/FieldOrbit'
import type { Field_seed } from '../csuite/fields/seed/FieldSeed'
import type { Field_selectMany } from '../csuite/fields/selectMany/FieldSelectMany'
import type { Field_selectOne } from '../csuite/fields/selectOne/FieldSelectOne'
import type { SelectKey } from '../csuite/fields/selectOne/SelectOneKey'
import type { Field_shared } from '../csuite/fields/shared/FieldShared'
import type { Field_size } from '../csuite/fields/size/FieldSize'
import type { Field_string } from '../csuite/fields/string/FieldString'
import type { SimpleSchema } from '../csuite/simple/SimpleSchema'
import type { NO_PROPS } from '../csuite/types/NO_PROPS'
import type { Field_prompt } from '../prompt/FieldPrompt'
import type { CushySchema } from './CushySchema'
import type { Temporal } from '@js-temporal/polyfill'

// TODO:
// alias should only be $Type &
// {Field:..., Schema:...}
//  => would make EVERYTHING so much simpler

declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace X {
      // #region core types
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type SchemaDict = import('../csuite/model/SchemaDict').SchemaDict
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type Builder = import('./CushyBuilder').CushySchemaBuilder
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type Field<K extends FieldTypes = FieldTypes> = import('../csuite/model/Field').Field<K>
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type FieldTypes = import('../csuite/model/$FieldTypes').FieldTypes
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type BaseSchema<TYPES extends FieldTypes = FieldTypes> = import('../csuite/model/BaseSchema').BaseSchema<TYPES>
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type Runtime = import('../runtime/Runtime').Runtime

      // #region core types

      // field aliases
      type Shared<T extends Field> = Field_shared<T>
      type Group<T extends SchemaDict> = FieldGroup<Field_group_types<T>>
      type Empty = Field_group<Field_group_types<NO_PROPS>>
      type Optional<T extends BaseSchema> = Field_optional<T>
      type Bool = Field_bool
      type Link<A extends BaseSchema, B extends BaseSchema> = Field_link<A, B>
      type String = Field_string
      type Prompt = Field_prompt
      type Choices<T extends SchemaDict = SchemaDict> = Field_choices<T>
      type Choice<T extends SchemaDict = SchemaDict> = Field_choices<T>
      type Number = Field_number
      type Color = Field_color
      type Enum<ENUM_NAME extends keyof Comfy.Slots> = Field_enum<ENUM_NAME>
      type List<T extends BaseSchema> = Field_list<T>
      type Orbit = Field_orbit
      // type ListExt<T extends BaseSchema> = Field_listExt<T>
      type Button<T> = Field_button<T>
      type Seed = Field_seed
      type Matrix = Field_matrix
      type Image = Field_image
      type SelectOne<T, KEY extends string> = Field_selectOne<T, KEY>
      type SelectMany<T, KEY extends string> = Field_selectMany<T, KEY>
      type SelectOne_<T extends string> = Field_selectOne<T, T> // variant that may be shorter to read
      type SelectMany_<T extends string> = Field_selectMany<T, T> // variant that may be shorter to read
      type Size = Field_size
      type Markdown = Field_markdown
      type Custom<T> = Field_custom<T>

      // schema aliases
      type XShared<T extends Field> = CushySchema<Field_shared<T>>
      type XGroup<T extends SchemaDict> = CushySchema<FieldGroup<Field_group_types<T>>>
      type XGroup_<T extends SchemaDict> = CushySchema<Field_group<Field_group_types<T>>>
      type XEmpty = CushySchema<Field_group<Field_group_types<NO_PROPS>>>
      type XOptional<T extends BaseSchema> = CushySchema<Field_optional<T>>
      type XBool = CushySchema<Field_bool>
      type XLink<A extends BaseSchema, B extends BaseSchema> = CushySchema<Field_link<A, B>>
      type XString = CushySchema<Field_string>
      type XChoices<T extends SchemaDict = SchemaDict> = CushySchema<Field_choices<T>>
      type XChoice<T extends SchemaDict = SchemaDict> = CushySchema<Field_choices<T>>
      type XNumber = CushySchema<Field_number>
      type XColor = CushySchema<Field_color>
      type XList<T extends BaseSchema> = CushySchema<Field_list<T>>
      type XDynamic<T extends BaseSchema> = CushySchema<Field_dynamic<T>>
      type XBoard<T extends BaseSchema> = SimpleSchema<Field_board<T>>
      type XButton<T> = CushySchema<Field_button<T>>
      type XSeed = CushySchema<Field_seed>
      type XMatrix = CushySchema<Field_matrix>

      // dates
      type XDatePlain = CushySchema<Field_date<Temporal.PlainDate>>
      type XDateTimeZoned = CushySchema<Field_date<Temporal.ZonedDateTime>>
      type XDate = CushySchema<Field_date<Date>>

      // selects
      type XSelectOne<T, ID extends SelectKey> = CushySchema<Field_selectOne<T, ID>>
      type XSelectMany<T, ID extends SelectKey> = CushySchema<Field_selectMany<T, ID>>
      type XSelectOne_<T extends SelectKey> = CushySchema<Field_selectOne<T, T>> // variant that may be shorter to read
      type XSelectMany_<T extends SelectKey> = CushySchema<Field_selectMany<T, T>> // variant that may be shorter to read

      type XSize = CushySchema<Field_size>
      type XMarkdown = CushySchema<Field_markdown>

      type XPrompt = CushySchema<Field_prompt>
      type XEnum<ENUM_NAME extends keyof Comfy.Slots> = CushySchema<Field_enum<Comfy.Slots[ENUM_NAME]>>
      type XEnumOf<O extends ComfyUnionValue> = CushySchema<Field_enum<O>>
      type XOrbit = CushySchema<Field_orbit>
      type XImage = CushySchema<Field_image>
      type XCustom<T> = CushySchema<Field_custom<T>>
   }
}
