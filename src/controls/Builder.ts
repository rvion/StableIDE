import type { IBuilder } from '../csuite/model/IBuilder'
import type { ISchema, SchemaDict } from '../csuite/model/ISchema'
import type { OpenRouter_Models } from '../csuite/openrouter/OpenRouter_models'
import type { NO_PROPS } from '../csuite/types/NO_PROPS'

import { makeAutoObservable } from 'mobx'

import { Field_bool, type Field_bool_config } from '../csuite/fields/bool/WidgetBool'
import { Field_button, type Field_button_config } from '../csuite/fields/button/WidgetButton'
import { Field_choices, type Field_choices_config } from '../csuite/fields/choices/WidgetChoices'
import { Field_color, type Field_color_config } from '../csuite/fields/color/WidgetColor'
import { Field_custom, type Field_custom_config } from '../csuite/fields/custom/WidgetCustom'
import { Field_enum } from '../csuite/fields/enum/WidgetEnum'
import { Field_group, type Field_group_config } from '../csuite/fields/group/WidgetGroup'
import { Field_image, type Field_image_config } from '../csuite/fields/image/WidgetImage'
import { Field_link } from '../csuite/fields/link/WidgetLink'
import { Field_list, type Field_list_config } from '../csuite/fields/list/WidgetList'
import { Field_listExt, type Field_listExt_config } from '../csuite/fields/listExt/WidgetListExt'
import { Field_markdown, Field_markdown_config } from '../csuite/fields/markdown/WidgetMarkdown'
import { Field_matrix, type Field_matrix_config } from '../csuite/fields/matrix/WidgetMatrix'
import { Field_number, type Field_number_config } from '../csuite/fields/number/WidgetNumber'
import { Field_optional, type Field_optional_config } from '../csuite/fields/optional/WidgetOptional'
import { Field_orbit, type Field_orbit_config } from '../csuite/fields/orbit/WidgetOrbit'
import { Field_seed, type Field_seed_config } from '../csuite/fields/seed/WidgetSeed'
import { Field_selectMany, type Field_selectMany_config } from '../csuite/fields/selectMany/WidgetSelectMany'
import { type BaseSelectEntry, Field_selectOne, type Field_selectOne_config } from '../csuite/fields/selectOne/WidgetSelectOne'
import { Field_shared } from '../csuite/fields/shared/WidgetShared'
import { Field_size, type Field_size_config } from '../csuite/fields/size/WidgetSize'
import { Field_spacer, type Field_spacer_config } from '../csuite/fields/spacer/WidgetSpacer'
import { Field_string, type Field_string_config } from '../csuite/fields/string/WidgetString'
import { Field } from '../csuite/model/Field'
import { Repository } from '../csuite/model/Repository'
import { openRouterInfos } from '../csuite/openrouter/OpenRouter_infos'
import { _FIX_INDENTATION } from '../csuite/utils/_FIX_INDENTATION'
import { Field_prompt, type Field_prompt_config } from '../prompt/WidgetPrompt'
import { type AutoBuilder, mkFormAutoBuilder } from './AutoBuilder'
import { EnumBuilder, EnumBuilderOpt, EnumListBuilder } from './EnumBuilder'
import { Schema } from './Schema'

declare global {
    namespace X {
        type SchemaDict = import('../csuite/model/ISchema').SchemaDict
        type Builder = import('./Builder').Builder
        type Field = import('../csuite/model/Field').Field

        type Runtime = import('../runtime/Runtime').Runtime

        // field aliases
        type Shared<T extends Field> = Field_shared<T>
        type Group<T extends SchemaDict> = Field_group<T>
        type Empty = Field_group<NO_PROPS>
        type Optional<T extends ISchema> = Field_optional<T>
        type Bool = Field_bool
        type Link<A extends ISchema, B extends ISchema> = Field_link<A, B>
        type String = Field_string
        type Prompt = Field_prompt
        type Choices<T extends SchemaDict = SchemaDict> = Field_choices<T>
        type Choice<T extends SchemaDict = SchemaDict> = Field_choices<T>
        type Number = Field_number
        type Color = Field_color
        type Enum<T> = Field_enum<T>
        type List<T extends ISchema> = Field_list<T>
        type Orbit = Field_orbit
        type ListExt<T extends ISchema> = Field_listExt<T>
        type Button<T> = Field_button<T>
        type Seed = Field_seed
        type Matrix = Field_matrix
        type Image = Field_image
        type SelectOne<T extends BaseSelectEntry> = Field_selectOne<T>
        type SelectMany<T extends BaseSelectEntry> = Field_selectMany<T>
        type SelectOne_<T extends string> = Field_selectOne<BaseSelectEntry<T>> // variant that may be shorter to read
        type SelectMany_<T extends string> = Field_selectMany<BaseSelectEntry<T>> // variant that may be shorter to read
        type Size = Field_size
        type Spacer = Field_spacer
        type Markdown = Field_markdown
        type Custom<T> = Field_custom<T>

        // schema aliases
        type XShared<T extends Field> = Schema<Field_shared<T>>
        type XGroup<T extends SchemaDict> = Schema<Field_group<T>>
        type XEmpty = Schema<Field_group<NO_PROPS>>
        type XOptional<T extends ISchema> = Schema<Field_optional<T>>
        type XBool = Schema<Field_bool>
        type XLink<A extends ISchema, B extends ISchema> = Schema<Field_link<A, B>>
        type XString = Schema<Field_string>
        type XPrompt = Schema<Field_prompt>
        type XChoices<T extends SchemaDict = SchemaDict> = Schema<Field_choices<T>>
        type XChoice<T extends SchemaDict = SchemaDict> = Schema<Field_choices<T>>
        type XNumber = Schema<Field_number>
        type XColor = Schema<Field_color>
        type XEnum<T> = Schema<Field_enum<T>>
        type XList<T extends ISchema> = Schema<Field_list<T>>
        type XOrbit = Schema<Field_orbit>
        type XListExt<T extends ISchema> = Schema<Field_listExt<T>>
        type XButton<T> = Schema<Field_button<T>>
        type XSeed = Schema<Field_seed>
        type XMatrix = Schema<Field_matrix>
        type XImage = Schema<Field_image>
        type XSelectOne<T extends BaseSelectEntry> = Schema<Field_selectOne<T>>
        type XSelectMany<T extends BaseSelectEntry> = Schema<Field_selectMany<T>>
        type XSelectOne_<T extends string> = Schema<Field_selectOne<BaseSelectEntry<T>>> // variant that may be shorter to read
        type XSelectMany_<T extends string> = Schema<Field_selectMany<BaseSelectEntry<T>>> // variant that may be shorter to read
        type XSize = Schema<Field_size>
        type XSpacer = Schema<Field_spacer>
        type XMarkdown = Schema<Field_markdown>
        type XCustom<T> = Schema<Field_custom<T>>
    }
}

/** cushy studio form builder */
export class Builder implements IBuilder {
    constructor() {
        // public model: Model<ISchema, Builder>,
        makeAutoObservable(this, {
            auto: false,
            autoField: false,
            enum: false,
            enums: false,
            enumOpt: false,
        })
    }

    time(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'time', ...config })
    }

    date(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'date', ...config })
    }

    datetime(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'datetime-local', ...config })
    }

    password(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'password', ...config })
    }

    email(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'email', ...config })
    }

    url(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'url', ...config })
    }

    string(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, config)
    }

    text(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, config)
    }

    textarea(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { textarea: true, ...config })
    }

    boolean(config: Field_bool_config = {}): X.XBool {
        return new Schema<Field_bool>(Field_bool, config)
    }

    bool(config: Field_bool_config = {}): X.XBool {
        return new Schema<Field_bool>(Field_bool, config)
    }

    size(config: Field_size_config = {}): X.XSize {
        return new Schema<Field_size>(Field_size, config)
    }

    spacer(config: Field_spacer_config = {}): X.XSpacer {
        return new Schema<Field_spacer>(Field_spacer, {
            justifyLabel: false,
            label: false,
            collapsed: false,
            border: false,
        })
    }

    orbit(config: Field_orbit_config = {}): X.XOrbit {
        return new Schema<Field_orbit>(Field_orbit, config)
    }

    seed(config: Field_seed_config = {}): X.XSeed {
        return new Schema<Field_seed>(Field_seed, config)
    }

    color(config: Field_color_config = {}): X.XColor {
        return new Schema<Field_color>(Field_color, config)
    }
    colorV2(config: Field_string_config = {}): X.XString {
        return new Schema<Field_string>(Field_string, { inputType: 'color', ...config })
    }
    matrix(config: Field_matrix_config): X.XMatrix {
        return new Schema<Field_matrix>(Field_matrix, config)
    }
    button = <K>(config: Field_button_config<K>): X.XButton<K> => {
        return new Schema<Field_button<K>>(Field_button, config)
    }
    /** variants: `header` */
    markdown(config: Field_markdown_config | string): X.XMarkdown {
        return new Schema<Field_markdown>(Field_markdown, typeof config === 'string' ? { markdown: config } : config)
    }
    /** [markdown variant]: inline=true, label=false */
    header = (config: Field_markdown_config | string): X.XMarkdown => {
        const config_: Field_markdown_config =
            typeof config === 'string'
                ? { markdown: config, inHeader: true, label: false }
                : { inHeader: true, label: false, justifyLabel: false, ...config }
        return new Schema<Field_markdown>(Field_markdown, config_)
    }
    image = (config: Field_image_config = {}): X.XImage => {
        return new Schema<Field_image>(Field_image, config)
    }
    prompt = (config: Field_prompt_config = {}): X.XPrompt => {
        return new Schema<Field_prompt>(Field_prompt, config)
    }
    int = (config: Omit<Field_number_config, 'mode'> = {}): X.XNumber => {
        return new Schema<Field_number>(Field_number, { mode: 'int', ...config })
    }
    /** [number variant] precent = mode=int, default=100, step=10, min=1, max=100, suffix='%', */
    percent = (config: Omit<Field_number_config, 'mode'> = {}): X.XNumber => {
        return new Schema<Field_number>(Field_number, {
            mode: 'int',
            default: 100,
            step: 10,
            min: 0,
            max: 100,
            suffix: '%',
            ...config,
        })
    }
    float = (config: Omit<Field_number_config, 'mode'> = {}): X.XNumber => {
        return new Schema<Field_number>(Field_number, { mode: 'float', ...config })
    }

    number = (config: Omit<Field_number_config, 'mode'> = {}): X.XNumber => {
        return new Schema<Field_number>(Field_number, { mode: 'float', ...config })
    }

    remSize = (config: Omit<Field_number_config, 'mode'> = {}): X.XNumber => {
        return this.number({ min: 1, max: 20, default: 2, step: 1, unit: 'rem', suffix: 'rem' })
    }

    custom = <T>(config: Field_custom_config<T>): X.XCustom<T> => {
        return new Schema<Field_custom<T>>(Field_custom, config)
    }

    list = <T extends ISchema>(config: Field_list_config<T>): X.XList<T> => {
        return new Schema<Field_list<T>>(Field_list, config)
    }

    listExt = <T extends ISchema>(config: Field_listExt_config<T>): X.XListExt<T> => {
        return new Schema<Field_listExt<T>>(Field_listExt, config)
    }

    timeline = <T extends ISchema>(config: Field_listExt_config<T>): X.XListExt<T> => {
        return new Schema<Field_listExt<T>>(Field_listExt, { mode: 'timeline', ...config })
    }

    regional = <T extends ISchema>(config: Field_listExt_config<T>): X.XListExt<T> => {
        return new Schema<Field_listExt<T>>(Field_listExt, { mode: 'regional', ...config })
    }

    // SELECT ONE ------------------------------------------------------------------------------------

    selectOne = <const T extends BaseSelectEntry>(config: Field_selectOne_config<T>): X.XSelectOne<T> => {
        return new Schema<Field_selectOne<T>>(Field_selectOne, config)
    }

    selectOneV2 = <T extends string>(
        p: readonly T[],
        config: Omit<Field_selectOne_config<BaseSelectEntry<T>>, 'choices'> = {},
    ): X.XSelectOne_<T> => {
        return new Schema<Field_selectOne<BaseSelectEntry<T>>>(Field_selectOne, {
            choices: p.map((id) => ({ id, label: id })),
            appearance: 'tab',
            ...config,
        })
    }

    // SELECT MANY ------------------------------------------------------------------------------------

    selectMany = <const T extends BaseSelectEntry>(config: Field_selectMany_config<T>): X.XSelectMany<T> => {
        return new Schema<Field_selectMany<T>>(Field_selectMany, config)
    }

    selectManyV2 = <T extends string>(
        p: readonly T[],
        config: Omit<Field_selectMany_config<BaseSelectEntry<T>>, 'choices'> = {},
    ): X.XSelectMany<BaseSelectEntry<T>> => {
        return new Schema<Field_selectMany<BaseSelectEntry<T>>>(Field_selectMany, {
            choices: p.map((id) => ({ id, label: id })),
            ...config,
        })
    }

    /**
     * Allow to instanciate a field early, so you can re-use it in multiple places
     * or access it's instance to dynamically change some other field schema.
     *
     * @since 2024-06-27
     * @stability unstable
     */
    with<const SCHEMA1 extends ISchema, SCHEMA2 extends ISchema>(
        /** the schema of the field you'll want to re-use the in second part */
        injected: SCHEMA1,
        children: (shared: SCHEMA1['$Field']) => SCHEMA2,
    ): X.XLink<SCHEMA1, SCHEMA2> {
        return new Schema<Field_link<SCHEMA1, SCHEMA2>>(Field_link, { share: injected, children })
    }

    linked<T extends Field>(field: T): X.XShared<T> {
        return new Schema<Field_shared<T>>(Field_shared<any /* 🔴 */>, { field })
    }

    /** see also: `fields` for a more practical api */
    group<T extends SchemaDict>(config: Field_group_config<T> = {}): X.XGroup<T> {
        return new Schema<Field_group<T>>(Field_group, config)
    }

    /** Convenience function for `group({ border: false, label: false, collapsed: false })` */
    column<T extends SchemaDict>(config: Field_group_config<T> = {}): X.XGroup<T> {
        return new Schema<Field_group<T>>(Field_group, { border: false, label: false, collapsed: false, ...config })
    }

    /** Convenience function for `group({ border: false, label: false, collapsed: false, layout:'H' })` */
    row<T extends SchemaDict>(config: Field_group_config<T> = {}): X.XGroup<T> {
        return new Schema<Field_group<T>>(Field_group, {
            border: false,
            label: false,
            collapsed: false,
            layout: 'H',
            ...config,
        })
    }
    /** simpler way to create `group` */
    fields = <T extends SchemaDict>(fields: T, config: Omit<Field_group_config<T>, 'items'> = {}): X.XGroup<T> => {
        return new Schema<Field_group<T>>(Field_group, { items: fields, ...config })
    }
    choice = <T extends { [key: string]: ISchema }>(config: Omit<Field_choices_config<T>, 'multi'>): X.XChoice<T> => {
        return new Schema<Field_choices<T>>(Field_choices, { multi: false, ...config })
    }
    choiceV2 = <T extends { [key: string]: ISchema }>(
        items: Field_choices_config<T>['items'],
        config: Omit<Field_choices_config<T>, 'multi' | 'items'> = {},
    ): X.XChoice<T> => {
        return new Schema<Field_choices<T>>(Field_choices, { multi: false, items, ...config })
    }
    choices = <T extends { [key: string]: ISchema }>(config: Omit<Field_choices_config<T>, 'multi'>): X.XChoices<T> => {
        return new Schema<Field_choices<T>>(Field_choices, { multi: true, ...config })
    }
    choicesV2 = <T extends { [key: string]: ISchema }>(
        items: Field_choices_config<T>['items'],
        config: Omit<Field_choices_config<T>, 'multi' | 'items'> = {},
    ): X.XChoices<T> => {
        return new Schema<Field_choices<T>>(Field_choices, { items, multi: true, appearance: 'tab', ...config })
    }
    empty = (config: Field_group_config<NO_PROPS> = {}): X.XEmpty => {
        return new Schema<Field_group<NO_PROPS>>(Field_group, config)
    }
    /** simple choice alternative api */
    tabs = <T extends { [key: string]: ISchema }>(
        items: Field_choices_config<T>['items'],
        config: Omit<Field_choices_config<NoInfer<T>>, 'multi' | 'items'> = {},
    ) => new Schema<Field_choices<T>>(Field_choices, { items, multi: false, ...config, appearance: 'tab' })

    // optional wrappers
    optional = <T extends ISchema>(p: Field_optional_config<T>) => new Schema<Field_optional<T>>(Field_optional, p)

    llmModel = (p: { default?: OpenRouter_Models } = {}) => {
        const choices = Object.entries(openRouterInfos).map(([id, info]) => ({ id: id as OpenRouter_Models, label: info.name }))
        const def = choices ? choices.find((c) => c.id === p.default) : undefined
        return this.selectOne({ default: def, choices })
    }

    // enum = /*<const T extends KnownEnumNames>*/ (config: Field_enum_config<any, any>) => new Field_enum(this.form, config)
    get auto(): AutoBuilder {
        const _ = mkFormAutoBuilder(this) /*<const T extends KnownEnumNames>*/
        Object.defineProperty(this, 'auto', { value: _ })
        return _
    }

    get autoField(): AutoBuilder {
        const _ = mkFormAutoBuilder(this)
        Object.defineProperty(this, 'autoField', { value: _ })
        return _
    }

    get enum(): EnumBuilder {
        const _ = new EnumBuilder(this) /*<const T extends KnownEnumNames>*/
        Object.defineProperty(this, 'enum', { value: _ })
        return _
    }

    get enums(): EnumListBuilder {
        const _ = new EnumListBuilder(this) /*<const T extends KnownEnumNames>*/
        Object.defineProperty(this, 'enums', { value: _ })
        return _
    }

    get enumOpt() {
        const _ = new EnumBuilderOpt(this)
        Object.defineProperty(this, 'enumOpt', { value: _ })
        return _
    }

    _FIX_INDENTATION = _FIX_INDENTATION

    /** (@internal); */ _cache: { count: number } = { count: 0 }
}

export const builder = new Builder()
export type CushyRepo = Repository<Builder>
export const cushyRepo: CushyRepo = new Repository<Builder>(builder)
