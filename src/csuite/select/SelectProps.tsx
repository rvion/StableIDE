import type { FrameProps } from '../frame/Frame'
import type { IconName } from '../icons/icons'
import type { InputStringProps } from '../input-string/InputStringUI'
import type { RevealPlacement } from '../reveal/RevealPlacement'
import type { RevealProps } from '../reveal/RevealProps'
import type { SelectOptionProps } from './SelectOptionUI'
import type { SelectPopupProps } from './SelectPopupUI'
import type { AutoCompleteSelectState, SelectValueSlots } from './SelectState'
import type React from 'react'

// 🔶 should probably use symbols
export type SelectValueLooks =
   | '🔶DEFAULT🔶' // convenient when we only want to customize one 'where' case
   | 'TODO_ColoredBadgeWithCloseKnob'
   | 'TODO_ColoredBadge'
   | 'TODO_Badge'
   | 'TODO_BadgeWithCloseKnob'

export type SelectProps<OPTION> = {
   label?: string
   startIcon?: IconName

   placement?: RevealPlacement
   /**
    * if true, select is virtualized
    * @default true
    */
   virtualized?: boolean | number

   slotPlaceholderWhenNoResults?: React.ReactNode

   /** callback when a new option is selected */
   onOptionToggled: null | ((next: OPTION, self: AutoCompleteSelectState<OPTION>) => void)

   /**
    * @deprecated
    * use `onOptionToggled` instead
    * this is just an alias for `onOptionToggled`
    * this function has been added back since 2 people struggled to find the `onOptionToggled` name
    */
   onChange?: (next: OPTION, self: AutoCompleteSelectState<OPTION>) => void

   /**
    * list of all choices
    * 👉 If the list of options is generated from the query directly,
    *    you should also set `disableLocalFiltering: true`, to avoid
    *    filtering the options twice.
    */
   options?: (query: string) => OPTION[]
   createOption?: {
      label?: string
      isActive?: boolean
      action: () => Promise<OPTION | null>
   }

   /** set this to true if your choices */
   disableLocalFiltering?: boolean

   /** if provided, is used to compare options with selected values */
   equalityCheck?: (a: OPTION, b: OPTION) => boolean

   // --------------------------------------------
   /** used to search/filter & for UI if no getLabelUI provided */
   getLabelText: (t: OPTION) => string

   /** if provided, is used to display the options in the popover */
   OptionLabelUI?: (
      t: OPTION,
      where: SelectValueSlots,
      selectState: AutoCompleteSelectState<OPTION>,
   ) => React.ReactNode | SelectValueLooks

   hideOptionCheckbox?: boolean

   /** if not provided, autoKey will be used instead */
   getKey?: (t: OPTION) => string

   /** the selected value / list of values if multiple values provided */
   value?: () => (OPTION | OPTION[]) | undefined

   /** if true, this widget is considered a multi-select */
   multiple?: boolean

   /** prevents popup from opening, not well thought out, probably does not belongs here */
   readonly?: boolean

   hasErrors?: boolean

   /** text to show when no value yet nor filter query */
   placeholder?: string
   disabled?: boolean

   onCleared?: Maybe<() => void>

   /** if true, popup-input options won't have a close icon */
   uncloseableOptions?: boolean

   hideValue?: boolean
   // className?: string // use revealProps.anchorProps.className instead
   // style?: React.CSSProperties // use revealProps.anchorProps.style instead

   /**
    * wride doc
    * @since 2024-10-17
    */
   showSelectAllNone?: boolean

   /**
    * Implement the selection of ALL values, when the user did not type any search filter
    * @since 2024-10-17
    */
   onSelectAll?: (filterText: string) => void

   /**
    * @default: false if multi-select, true if single select
    */
   closeOnPick?: boolean

   /**
    * @default: false
    * (previous default before 2024-02-29: false if multi-select, true if single select)
    */
   resetQueryOnPick?: boolean

   /** hooks required to plug search query from/into some other system */
   getSearchQuery?: () => string
   setSearchQuery?: (val: string) => void

   /**
    * since 2024-06-12
    * @default false
    */
   wrap?:
      | boolean //
      | 'no-wrap-no-overflow-hidden' // in cells, we don't want to wrap, but overflow hidden is handled by the cell container, we want the select to overflow.

   // 🧚‍♀️ onAnchorFocus?: (ev: React.FocusEvent<HTMLElement>) => void
   // 🧚‍♀️ onAnchorBlur?: (ev: React.FocusEvent<HTMLElement>) => void
   // 🧚‍♀️ onAnchorKeyDown?: (ev: React.KeyboardEvent<HTMLElement>) => void
   revealProps?: Partial<RevealProps>
   popupWrapperProps?: React.HTMLAttributes<HTMLDivElement>
   textInputProps?: InputStringProps

   // customization slots
   slotTextInputUI?: React.FC<{ select: AutoCompleteSelectState<OPTION> }>
   slotPopupUI?: React.FC<SelectPopupProps<OPTION>>
   slotAnchorContentUI?: React.FC<{ select: AutoCompleteSelectState<OPTION> }>
   slotDisplayValueUI?: React.FC<{ select: AutoCompleteSelectState<OPTION> }>
   SlotDisplayValueInPopupUI?: React.FC<{ select: AutoCompleteSelectState<OPTION> }>
   slotResultsListUI?: React.FC<{ select: AutoCompleteSelectState<OPTION> }>
   slotOptionUI?: React.FC<SelectOptionProps<OPTION>>

   tooltip?: string | React.ReactNode
   frameProps?: FrameProps
}
