/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Field_bool } from '../fields/bool/FieldBool'
import type { Field_button } from '../fields/button/FieldButton'
import type { Field_choices } from '../fields/choices/FieldChoices'
import type { Field_color } from '../fields/color/FieldColor'
import type { Field_date } from '../fields/date/FieldDate'
import type { Field_dynamic } from '../fields/dynamic/FieldDynamic'
import type { Field_group, Field_group_types, Field_Group_withMagicFields } from '../fields/group/FieldGroup'
import type { Field_link } from '../fields/link/FieldLink'
import type { Field_list } from '../fields/list/FieldList'
import type { Field_markdown } from '../fields/markdown/FieldMarkdown'
import type { Field_matrix } from '../fields/matrix/FieldMatrix'
import type { Field_number } from '../fields/number/FieldNumber'
import type { Field_optional } from '../fields/optional/FieldOptional'
import type { Field_seed } from '../fields/seed/FieldSeed'
import type { Field_selectMany } from '../fields/selectMany/FieldSelectMany'
import type { Field_selectOne } from '../fields/selectOne/FieldSelectOne'
import type { Field_shared } from '../fields/shared/FieldShared'
import type { Field_size } from '../fields/size/FieldSize'
import type { Field_string } from '../fields/string/FieldString'
import type { BaseSchema } from '../model/BaseSchema'
import type { NO_PROPS } from '../types/NO_PROPS'
import type { SimpleSchema } from './SimpleSchema'
import type { Temporal } from '@js-temporal/polyfill'

declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace S {
      //  ====== core ==============================================================
      type SchemaDict = import('../model/SchemaDict').SchemaDict
      type Builder = import('./SimpleBuilder').SimpleBuilder
      type Field = import('../model/Field').Field

      //  ====== field aliases ======================================================
      type Shared<T extends Field> = Field_shared<T>
      //
      type Group<T extends SchemaDict> = Field_group<Field_group_types<T>>
      type List<T extends BaseSchema> = Field_list<T>
      type Link<A extends BaseSchema, B extends BaseSchema> = Field_link<A, B>
      type Choices<T extends SchemaDict = SchemaDict> = Field_choices<T>
      type Optional<T extends BaseSchema> = Field_optional<T>
      //

      type SelectOne<T, K extends string> = Field_selectOne<T, K>
      type SelectMany<T, K extends string> = Field_selectMany<T, K>
      type SelectOne_<T extends string> = Field_selectOne<T, T>
      type SelectMany_<T extends string> = Field_selectMany<T, T>
      //
      type Empty = Field_group<Field_group_types<NO_PROPS>>
      type Bool = Field_bool
      type String = Field_string
      type Number = Field_number
      type Color = Field_color
      type Seed = Field_seed
      type Matrix = Field_matrix
      type Size = Field_size
      //
      type Button<T> = Field_button<T>
      type Markdown = Field_markdown

      //  ====== schema aliases ======================================================
      type SShared<T extends Field> = SimpleSchema<Field_shared<T>>
      //
      type SGroup<T extends SchemaDict> = SimpleSchema<Field_Group_withMagicFields<Field_group_types<T>>>
      type SList<T extends BaseSchema> = SimpleSchema<Field_list<T>>
      type SDynamic<T extends BaseSchema> = SimpleSchema<Field_dynamic<T>>
      type SLink<A extends BaseSchema, B extends BaseSchema> = SimpleSchema<Field_link<A, B>>
      type SChoices<T extends SchemaDict = SchemaDict> = SimpleSchema<Field_choices<T>>
      type SOptional<T extends BaseSchema> = SimpleSchema<Field_optional<T>>
      type SSelectOne<T, ID extends string = string> = SimpleSchema<Field_selectOne<T, ID>>
      type SSelectMany<T, ID extends string = string> = SimpleSchema<Field_selectMany<T, ID>>

      type SSelectOne_<T extends string> = SimpleSchema<Field_selectOne<T, T>> // variant that may be shorter to read
      type SSelectMany_<T extends string> = SimpleSchema<Field_selectMany<T, T>> // variant that may be shorter to read
      //
      type SEmpty = SimpleSchema<Field_group<Field_group_types<NO_PROPS>>>
      type SBool = SimpleSchema<Field_bool>
      type SString = SimpleSchema<Field_string>

      type SDatePlain = SimpleSchema<Field_date<Temporal.PlainDate>>
      type SDateTimeZoned = SimpleSchema<Field_date<Temporal.ZonedDateTime>>
      type SDate = SimpleSchema<Field_date<Date>>

      type SNumber = SimpleSchema<Field_number>
      type SColor = SimpleSchema<Field_color>
      type SSeed = SimpleSchema<Field_seed>
      type SMatrix = SimpleSchema<Field_matrix>
      type SSize = SimpleSchema<Field_size>
      //
      type SButton<T> = SimpleSchema<Field_button<T>>
      type SMarkdown = SimpleSchema<Field_markdown>
   }
}
