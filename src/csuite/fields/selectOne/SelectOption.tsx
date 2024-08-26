import type { IconName } from '../../icons/icons'

export type SelectOptionID = string

export type SelectOption_<VALUE extends string> = SelectOption<VALUE, VALUE>

export type SelectOption<VALUE, KEY extends string> = {
    id: KEY
    value: VALUE
} & SelectOptionPresetation

/** SelectOptional variant with optional value */
export type SelectOptionOpt<VALUE, KEY extends string> = {
    id: KEY
    value?: VALUE // OPTIONAL
} & SelectOptionPresetation

/** SelectOptional variant with optional value */
export type SelectOptionNoVal<KEY extends string> = {
    id: KEY
} & SelectOptionPresetation

type SelectOptionPresetation = {
    // optional presentation
    disabled?: boolean
    label?: string
    labelNode?: JSX.Element
    icon?: IconName
    hue?: number
}
