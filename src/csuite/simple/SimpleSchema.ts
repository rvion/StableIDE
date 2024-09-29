import type { Field } from '../model/Field'
import type { FieldConstructor } from '../model/FieldConstructor'
import type { Instanciable } from '../model/Instanciable'
import type { SchemaDict } from '../model/SchemaDict'

import { makeObservable } from 'mobx'

import { BaseSchema } from '../model/BaseSchema'

export class SimpleSchema<out FIELD extends Field = Field>
    extends BaseSchema<FIELD, SimpleSchemaᐸ_ᐳ>
    implements Instanciable<FIELD>
{
    constructor(
        /** field constructor (class or function, see FieldConstructor definition)  */
        fieldConstructor: FieldConstructor<FIELD>,
        config: FIELD['$Config'],
    ) {
        super(fieldConstructor, config, (...args) => new SimpleSchema(...args) as any)
        makeObservable(this, { config: true, fieldConstructor: false })
    }
}

// INTERNAL MODULE --------------------------------------
export interface SimpleSchemaᐸ_ᐳ extends HKT<Field> {
    type: SimpleSchema<this['__1']>

    String: S.SString
    Bool: S.SBool
    Number: S.SNumber

    Date: HKSimpleDateAlias
    DatePlain: HKSimpleDatePlainAlias
    DateTimeZoned: HKSimpleDateTimeZonedAlias

    Link: HKSimpleLinkAlias
    Shared: HKSimpleSharedAlias
    List: HKSimpleListAlias
    Optional: HKSimpleOptionalAlias

    OneOf: HKSimpleOneOfAlias
    OneOf_: HKSimpleOneOf_Alias

    Many: HKSimpleManyAlias
    Many_: HKSimpleMany_Alias

    Choices: HKSimpleChoicesAlias

    Group: HKSimpleGroupAlias
    Empty: S.SEmpty

    Size: S.SSize
    Seed: S.SSeed
    Color: S.SColor
    Matrix: S.SMatrix
    Button: HKSimpleButtonAlias
    Markdown: S.SMarkdown
}

// #region link
interface HKSimpleLinkAlias extends HKT<BaseSchema, BaseSchema> {
    type: S.SLink<this['__1'], this['__2']>
}

interface HKSimpleSharedAlias extends HKT<Field> {
    type: S.SShared<this['__1']>
}
interface HKSimpleListAlias extends HKT<BaseSchema> {
    type: S.SList<this['__1']>
}

// #region optional
interface HKSimpleOptionalAlias extends HKT<BaseSchema> {
    type: S.SOptional<this['__1']>
}

// #region oneOf
interface HKSimpleOneOfAlias extends HKT<unknown, string> {
    type: S.SSelectOne<this['__1'], this['__2']>
}
interface HKSimpleOneOf_Alias extends HKT<string> {
    type: S.SSelectOne_<this['__1']>
}

// #region many
interface HKSimpleManyAlias extends HKT<unknown, string> {
    type: S.SSelectMany<this['__1'], this['__2']>
}
interface HKSimpleMany_Alias extends HKT<string> {
    type: S.SSelectMany_<this['__1']>
}

// #region choices
interface HKSimpleChoicesAlias extends HKT<SchemaDict> {
    type: S.SChoices<this['__1']>
}

// #region group
interface HKSimpleGroupAlias extends HKT<SchemaDict> {
    type: S.SGroup<this['__1']>
}

// #region dates
interface HKSimpleDateAlias extends HKT<boolean> {
    type: S.SDate<this['__1']>
}
interface HKSimpleDatePlainAlias extends HKT<boolean> {
    type: S.SDatePlain<this['__1']>
}
interface HKSimpleDateTimeZonedAlias extends HKT<boolean> {
    type: S.SDateTimeZoned<this['__1']>
}

// #region button
interface HKSimpleButtonAlias extends HKT<any> {
    type: S.SButton<this['__1']>
}
