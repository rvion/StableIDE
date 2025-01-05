import type { BodyContainerProps } from '../../csuite/form/WidgetBodyContainerUI'
import type { WidgetHeaderContainerProps } from '../../csuite/form/WidgetHeaderContainerUI'
import type { WidgetLabelCaretProps } from '../../csuite/form/WidgetLabelCaretUI'
import type { WidgetLabelIconProps } from '../../csuite/form/WidgetLabelIconUI'
import type { WidgetMenuProps } from '../../csuite/form/WidgetMenu'
import type { WidgetSingleLineSummaryProps } from '../../csuite/form/WidgetSingleLineSummaryUI'
import type { WidgetToggleProps } from '../../csuite/form/WidgetToggleUI'
import type { Field } from '../../csuite/model/Field'
import type { NO_PROPS } from '../../csuite/types/NO_PROPS'
import type { FCOrNode } from '../../csuite/utils/renderFCOrNode'
import type { CovariantFn1 } from '../../csuite/variance/BivariantHack'
import type { QuickFormContent } from '../catalog/group/QuickForm'
import type { WidgetIndentProps } from '../catalog/Indent/WidgetIndentUI'
import type { WidgetPresetsProps } from '../catalog/Presets/WidgetPresets'
import type { WidgetTitleProps } from '../catalog/Title/WidgetLabelTextUI'
import type { CushyHeadProps } from '../shells/CushyHead'
import type { CompiledRenderProps, DisplaySlotExt } from './RenderTypes'
import type { FC, ReactNode } from 'react'

// #region Slots
/**
 * component slots available in your Presenter
 * list of all components used in the built-in FieldPresenter
 * from very prioritary to very optional
 * ✅ really recommended
 * 🟢 recommanded
 * 🟡 optional
 * 🟠 very optional
 * 🟣 not recommended
 * 🟥 really not recommended
 *
 * ⭕️ entrypoint; needs to be handled by the presenter
 * Mayby<FC> means:
 *
 *    undefined => don't change anything; keep previous slot value
 *    FC        => use this component for the slot, passing props it expects (that's why most of the FC only accept very few params)
 *    null      => disable the slot; i.e. slot should not be displayed/used
 *    ReactNode => use this react node direclty
 */

export interface DisplaySlots<out FIELD extends Field = Field> {
   layout?: CovariantFn1<FIELD, QuickFormContent[]>

   // 0.
   Decoration?: FCOrNode<{ children: ReactNode }>

   // 1. Shell
   // can also be used an escape hatch for 100% custom UI
   /* ⭕️ */ Shell?: FCOrNode<CompiledRenderProps<FIELD>>
   /* ⭕️ */ ShellName?: keyof CATALOG.widgets['Shell']

   // 2. Direct Slots for this field only
   // heavilly suggested to include in your presenter unless you know what you do
   /* ✅ */ Head?: FCOrNode<CushyHeadProps>
   /* ✅ */ Header?: FCOrNode<{ field: FIELD }>
   /* ✅ */ Body?: FCOrNode<{ field: FIELD }>
   /* ✅ */ Extra?: FCOrNode<{ field: FIELD }>

   // stuff you want to include, possilby in some revealable way
   // based on field.hasError.
   /* 🟢 */ Errors?: FCOrNode<{ field: FIELD }>
   /* 🟢 */ Title?: FCOrNode<WidgetTitleProps>

   /* 🟢 */ DragKnob?: FCOrNode<{ field: FIELD }>
   /* 🟢 */ UpDownBtn?: FCOrNode<{ field: FIELD }>
   /* 🟢 */ DeleteBtn?: FCOrNode<{ field: FIELD }>

   // bonus features
   /* 🟡 */ Indent?: FCOrNode<WidgetIndentProps>
   /* 🟡 */ UndoBtn?: FCOrNode<{ field: FIELD }>
   /* 🟡 */ Toogle?: FCOrNode<WidgetToggleProps>
   /* 🟡 */ Caret?: FCOrNode<WidgetLabelCaretProps>
   /* 🟡 */ Icon?: FCOrNode<WidgetLabelIconProps>
   /* 🟡 */ Presets?: FCOrNode<WidgetPresetsProps>
   /* 🟡 */ MenuBtn?: FCOrNode<WidgetMenuProps>

   // suggested containers
   /* 🟠 */ ContainerForHeader?: Maybe<FC<WidgetHeaderContainerProps>>
   /* 🟠 */ ContainerForBody?: Maybe<FC<BodyContainerProps>>
   /* 🟠 */ ContainerForSummary?: Maybe<FC<WidgetSingleLineSummaryProps>>

   // ---------------------------------------------------------
   // 3. various other params, mostly to tweak looks
   classNameAroundBodyAndHeader?: Maybe<string>
   classNameAroundBody?: Maybe<string>
   classNameAroundHeader?: Maybe<string>
   className?: Maybe<string>
   shouldShowHiddenFields?: Maybe<boolean>
   shouldAnimateResize?: Maybe<boolean>
   collapsible?: boolean

   // ---------------------------------------------------------
   // 4. Slots for shell
   // stuff you probably don't want to include
   // debug stuff
   /* 🟣 */ DebugID?: Maybe<FC<{ field: Field }>>

   // only for the lolz
   /* 🟥 */ EasterEgg?: Maybe<FC<{ field: Field }>>
}
