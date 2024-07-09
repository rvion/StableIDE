import type { Builder, CovariantFC, CovariantFn } from '../csuite'
import type { Field } from '../csuite/model/Field'
import type { ISchema } from '../csuite/model/ISchema'
import type { Repository } from '../csuite/model/Repository'
import type { Requirements } from '../manager/REQUIREMENTS/Requirements'

import { createElement, type ReactNode } from 'react'

import { Field_link, type Field_link_config } from '../csuite/fields/link/WidgetLink'
import { Field_list, Field_list_config } from '../csuite/fields/list/WidgetList'
import { Field_optional } from '../csuite/fields/optional/WidgetOptional'
import { isWidgetOptional } from '../csuite/fields/WidgetUI.DI'
import { Channel, type ChannelId, Producer } from '../csuite/model/Channel'
import { BaseSchema } from '../csuite/simple/BaseSchema'
import { objectAssignTsEfficient_t_pt } from '../csuite/utils/objectAssignTsEfficient'
import { InstallRequirementsBtnUI } from '../manager/REQUIREMENTS/Panel_InstallRequirementsUI'
import { cushyRepo } from './Builder'

export class Schema<out FIELD extends Field = Field> extends BaseSchema<FIELD> implements ISchema<FIELD> {
    FieldClass_UNSAFE: any

    get type(): FIELD['$Type'] {
        return this.FieldClass_UNSAFE.type
    }
    repository: Repository<Builder> = cushyRepo
    constructor(
        FieldClass: {
            readonly type: FIELD['$Type']
            new (
                //
                repo: Repository,
                root: Field,
                parent: Field | null,
                schema: ISchema<FIELD>,
                serial?: FIELD['$Serial'],
            ): FIELD
        },
        public readonly config: FIELD['$Config'],
    ) {
        super()
        this.FieldClass_UNSAFE = FieldClass
        // makeObservable(this, {
        //     config: true,
        //     FieldClass_UNSAFE: false,
        // })
    }

    _methods: any = {}
    actions<T extends { [methodName: string]: (self: FIELD) => any }>(t: T): Schema<FIELD & T> {
        Object.assign(this._methods, t)
        return this as any
    }

    _skins: any = {}
    skins<
        T extends {
            // prettier-ignore
            [methodName: string]:
                /** simplified skin definition */
                | { [key: string]: any }
                /** full react field */
                | ((p: { field: FIELD }) => ReactNode)
        },
    >(t: T): Schema<FIELD & T /* & { skin: T } */> {
        Object.assign(this._skins, t)
        return this as any
    }

    LabelExtraUI: CovariantFC<{ field: FIELD }> = (p: { field: FIELD }) =>
        createElement(InstallRequirementsBtnUI, {
            active: isWidgetOptional(p.field) ? p.field.serial.active : true,
            requirements: this.requirements,
        })

    producers: Producer<any, FIELD['$Field']>[] = []
    publish<T>(chan: Channel<T> | ChannelId, produce: (self: FIELD['$Field']) => T): this {
        this.producers.push({ chan, produce })
        return this
    }

    subscribe<T>(chan: Channel<T> | ChannelId, effect: (arg: T, self: FIELD['$Field']) => void): this {
        return this.addReaction(
            (self) => self.consume(chan),
            (arg, self) => {
                if (arg == null) return
                effect(arg, self)
            },
        )
    }

    // Requirements (CushySpecifc)
    readonly requirements: Requirements[] = []

    addRequirements(requirements: Maybe<Requirements | Requirements[]>) {
        if (requirements == null) return this
        if (Array.isArray(requirements)) this.requirements.push(...requirements)
        else this.requirements.push(requirements)
        // this.🐌
        return this
    }

    useIn<BP extends ISchema>(
        //
        fn: CovariantFn<[field: FIELD], BP>,
    ): X.XLink<this, BP> {
        const linkConf: Field_link_config<this, BP> = { share: this, children: fn }
        return new Schema(Field_link<any, any>, linkConf)
    }

    // Make<X extends BaseField>(type: X['type'], config: X['$Config']) {
    //     return new Schema(type, config)
    // }

    /** wrap widget schema to list stuff */
    list = (config: Omit<Field_list_config<any>, 'element'> = {}): X.XList<this> =>
        new Schema<Field_list<this>>(Field_list, {
            ...config,
            element: this,
        })

    /** clone the schema, and patch the cloned config */
    withConfig(config: Partial<FIELD['$Config']>): this {
        const mergedConfig = objectAssignTsEfficient_t_pt(this.config, config)
        const cloned = new Schema<FIELD>(this.FieldClass_UNSAFE, mergedConfig)
        // 🔴 Keep producers and reactions -> could probably be part of the ctor
        cloned.producers = this.producers
        cloned.reactions = this.reactions
        return cloned as this
    }

    optional(startActive: boolean = false): X.XOptional<this> {
        return new Schema<Field_optional<this>>(Field_optional, {
            schema: this,
            startActive: startActive,
            label: this.config.label,
            // requirements: this.config.requirements,
            startCollapsed: this.config.startCollapsed,
            collapsed: this.config.collapsed,
            border: this.config.border,
        })
    }

    /** clone the schema, and patch the cloned config to make it hidden */
    hidden() {
        return this.withConfig({ hidden: true })
    }
}
