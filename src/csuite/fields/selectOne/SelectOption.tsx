import type { IconName } from '../../icons/icons'
import type { SelectKey } from './SelectOneKey'

export type SelectOptionID = string

export type SelectOption_<VALUE extends string> = SelectOption<VALUE, VALUE>

export type SelectOption<VALUE, KEY extends SelectKey> = {
   id: KEY
   value: VALUE
} & SelectOptionPresentation

/** SelectOptional variant with optional value */
export type SelectOptionOpt<VALUE, KEY extends SelectKey> = {
   id: KEY
   value?: VALUE // OPTIONAL
} & SelectOptionPresentation

/** SelectOptional variant with optional value */
export type SelectOptionNoVal<KEY extends SelectKey> = {
   id: KEY
} & SelectOptionPresentation

type SelectOptionPresentation = {
   // optional presentation
   disabled?: boolean
   label?: string
   labelNode?: React.JSX.Element
   icon?: IconName
   hue?: number
}
