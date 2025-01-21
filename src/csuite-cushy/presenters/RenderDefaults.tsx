import type { Field_group } from '../../csuite/fields/group/FieldGroup'
import type { Field } from '../../csuite/model/Field'
import type { DisplaySlots } from './RenderSlots'
import type { DisplaySlotsExt, FieldUIConfCtx } from './RenderTypes'
import type { RuleEntry } from './RenderXXX'

import { WidgetChoices_BodyUI } from '../../csuite/fields/choices/WidgetChoices_BodyUI'
import { WidgetChoices_HeaderUI } from '../../csuite/fields/choices/WidgetChoices_HeaderUI'
import { WidgetColorUI } from '../../csuite/fields/color/WidgetColorUI'
import { WidgetGroup_BlockUI } from '../../csuite/fields/group/WidgetGroup_BlockUI'
import { WidgetGroup_LineUI } from '../../csuite/fields/group/WidgetGroup_Header'
import { WidgetSelectImageUI } from '../../csuite/fields/image/WidgetImageUI'
import { ShellLinkUI } from '../../csuite/fields/link/WidgetLink'
import { ShellOptionalUI } from '../../csuite/fields/optional/WidgetOptional'
import { WidgetSelectOneUI } from '../../csuite/fields/selectOne/WidgetSelectOneUI'
import { ShellSharedUI } from '../../csuite/fields/shared/WidgetSharedUI'
import { WidgetBodyContainerUI } from '../../csuite/form/WidgetBodyContainerUI'
import { WidgetHeaderContainerUI } from '../../csuite/form/WidgetHeaderContainerUI'
import { WidgetLabelCaretUI } from '../../csuite/form/WidgetLabelCaretUI'
import { WidgetLabelIconUI } from '../../csuite/form/WidgetLabelIconUI'
import { WidgetMenuUI } from '../../csuite/form/WidgetMenu'
import { WidgetSingleLineSummaryUI } from '../../csuite/form/WidgetSingleLineSummaryUI'
import { WidgetToggleUI } from '../../csuite/form/WidgetToggleUI'
import { WidgetUndoChangesButtonUI } from '../../csuite/form/WidgetUndoChangesButtonUI'
import { FieldSelector } from '../../csuite/selector/selector'
import { WidgetDebugIDUI } from '../catalog/Debug/WidgetDebugIDUI'
import { WidgetErrorsUI } from '../catalog/Errors/WidgetErrorsUI'
import { WidgetPresetsUI } from '../catalog/Presets/WidgetPresets'
import { DefaultWidgetTitleUI } from '../catalog/Title/WidgetLabelTextUI'
import { CushyHeadUI } from '../shells/CushyHead'
import { ShellCushyLeftUI } from '../shells/ShellCushy'
import { renderDefaultKey } from './RenderDefaultsKey'

const baseslots: DisplaySlots<Field> = {
   /* ✅ */ Shell: ShellCushyLeftUI,

   // heavilly suggested to include in your presenter unless you know what you do
   /* ✅ */ Head: CushyHeadUI, // will be injected by the field
   /* ✅ */ Header: undefined, // will be injected by the field
   /* ✅ */ Body: undefined, // will be injected by the field
   /* ✅ */ Extra: undefined,

   /* 🟢 */ Errors: WidgetErrorsUI,
   /* 🟢 */ Title: DefaultWidgetTitleUI,

   /* 🟢 */ DragKnob: undefined,
   /* 🟢 */ UpDownBtn: undefined,
   /* 🟢 */ DeleteBtn: undefined,

   // bonus features
   /* 🟡 */ Indent: undefined, // WidgetIndentUI,
   /* 🟡 */ UndoBtn: WidgetUndoChangesButtonUI,
   /* 🟡 */ Toogle: WidgetToggleUI,
   /* 🟡 */ Caret: WidgetLabelCaretUI,
   /* 🟡 */ Icon: WidgetLabelIconUI,
   /* 🟡 */ Presets: WidgetPresetsUI,
   /* 🟡 */ MenuBtn: WidgetMenuUI,

   // suggested containers
   /* 🟠 */ ContainerForHeader: WidgetHeaderContainerUI,
   /* 🟠 */ ContainerForBody: WidgetBodyContainerUI,
   /* 🟠 */ ContainerForSummary: WidgetSingleLineSummaryUI,

   classNameAroundBodyAndHeader: null,
   classNameAroundBody: null,
   classNameAroundHeader: null,
   className: null,
   shouldShowHiddenFields: false,
   shouldAnimateResize: true,

   // stuff you probably don't want to include
   // misc debug stuff
   /* 🟣 */ DebugID: null, // WidgetDebugIDUI,

   // only for the lolz
   /* 🟥 */ EasterEgg: (): React.JSX.Element => <>🥚</>,
}

export const defaultRulesV2: RuleEntry[] = []
function setRule<T extends Field>(selector: string, slots: DisplaySlotsExt<T>, priority = 10): void {
   defaultRulesV2.push({ addedBy: null, selector: FieldSelector.from(selector), uiconf: slots, priority })
}

setRule('', baseslots)

setRule<any>('@shared', { Shell: ShellSharedUI })
setRule<any>('@link', { Shell: ShellLinkUI })
setRule<any>('@optional', { Shell: ShellOptionalUI })

setRule('@str', { Header: UY.string.input, Body: null })
setRule<any>('@number', { Header: UY.number.input, Body: null })
setRule<any>('@size', { Header: UY.size.line, Body: UY.size.block })

setRule<any>('@selectOne', { Header: WidgetSelectOneUI /* UY.selectOne.Select */ })
setRule<any>('@image', { Body: WidgetSelectImageUI /* UY.selectOne.Select */ })
setRule<any>('@group', { Header: WidgetGroup_LineUI, Body: WidgetGroup_BlockUI })
setRule<any>('@choices', { Header: WidgetChoices_HeaderUI, Body: WidgetChoices_BodyUI })
setRule<any>('@color', { Header: WidgetColorUI, Body: null })
setRule<any>('@bool', { Header: UY.boolean.default, Body: null })

setRule(
   '',
   ({ field }) => {
      console.log(`[🔴🦊] evaluationg for ${field.path}`)
      if (field.depth === 1) {
         if (field.isOfType('group', 'list', 'choices')) {
            return { Decoration: (p): React.JSX.Element => <UY.Decorations.Card field={field} {...p} /> }
            // slots.Title = catalog.Title.h3
         }
      } else if (field.depth === 2) {
         if (field.isOfType('group', 'list', 'choices')) return { Title: UY.Title.h4 }
         if (!field.isOfType('optional', 'link', 'list', 'shared')) return { Shell: UY.Shell.Right }
      }
   },
   100,
)

const defaultPresenterRule = (ui: FieldUIConfCtx): void => {
   ui.set(baseslots)

   ui.set<any>('@shared', { Shell: ShellSharedUI })
   ui.set<any>('@link', { Shell: ShellLinkUI })
   ui.set<any>('@optional', { Shell: ShellOptionalUI })

   ui.set('@str', { Header: UY.string.input, Body: null })
   ui.set<any>('@number', { Header: UY.number.input, Body: null })
   ui.set<any>('@bool', { Header: UY.boolean.default, Body: null })
   ui.set<any>('@size', { Header: UY.size.line, Body: UY.size.block })

   ui.set<any>('@selectOne', { Header: WidgetSelectOneUI /* UY.selectOne.Select */ })
   ui.set<any>('@image', { Body: WidgetSelectImageUI /* UY.selectOne.Select */ })
   ui.set<any>('@group', { Header: WidgetGroup_LineUI, Body: WidgetGroup_BlockUI })

   // {
   //    slots.Header = field.DefaultHeaderUI
   //    slots.Body = field.DefaultBodyUI
   //    slots.Extra = field.schema.LabelExtraUI as FCOrNode<{ field: Field }>

   //    if (field.depth === 1) {
   //       // if (field.isOfType('group', 'list', 'choices')) {
   //       //    slots.Decoration = (p): React.JSX.Element => <catalog.Decorations.Card field={field} {...p} />
   //       //    // slots.Title = catalog.Title.h3
   //       // }
   //    } else if (field.depth === 2) {
   //       if (field.isOfType('group', 'list', 'choices')) apply({ Title: UY.Title.h4 })
   //       if (!field.isOfType('optional', 'link', 'list', 'shared')) apply({ Shell: UY.Shell.Right })
   //    }
   ui.set(
      '',
      ({ field }) => {
         console.log(`[🔴🦊] evaluationg for ${field.path}`)
         if (field.depth === 1) {
            if (field.isOfType('group', 'list', 'choices')) {
               return { Decoration: (p): React.JSX.Element => <UY.Decorations.Card field={field} {...p} /> }
               // slots.Title = catalog.Title.h3
            }
         } else if (field.depth === 2) {
            if (field.isOfType('group', 'list', 'choices')) return { Title: UY.Title.h4 }
            if (!field.isOfType('optional', 'link', 'list', 'shared')) return { Shell: UY.Shell.Right }
         }
      },
      100,
   )

   //    // hide group head in choices
   //    if (field.parent?.type === 'choices' && field.type === 'group') {
   //       apply({ Head: false })
   //    }
   // }

   ui.set('$', { collapsible: false })
   ui.set<Field_group>('$@group', {
      Indent: false,
      Body: (f) => <UY.group.Default field={f.field as any /* 🔴 */} className='gap-1' />,
   })
   // ui.set('$.{@group|@list|@choices}', { Decoration: (p) => <UY.Decorations.Card field={field} {...p} /> })
   // ui.set('$.@link.{@group|@list|@choices}', {
   //    Decoration: (p) => <UY.Decorations.Card field={field} {...p} />,
   // })
   // ui.set('$.{@group|@list|@choices}.@link', {
   //    Decoration: (p) => <UY.Decorations.Card field={field} {...p} />,
   // })

   // ui.set('@image', {
   //    Header: false,
   //    Head: false,
   //    Decoration: (p) => {
   //       if (field.type == 'choices') {
   //          return p.children
   //       }
   //       return <UY.Decorations.Pad {...p} />
   //    },
   // })
}

;(window as any).defaultRenderRules = defaultPresenterRule
renderDefaultKey.version++
if (import.meta.hot) {
   import.meta.hot.accept()
}

// ui.set('$.{@group|@list|@choices}>', {
//    Decoration: (p) => {
//       if (field.type == 'choices') {
//          return p.children
//       }
//       return <UY.Decorations.Pad {...p} />
//    },
// })
// ui.set('@number', { Header: UY.number.simple, Body: null })
// ui.set('$.{@group|@list|@choices}.', { Indent: false })
// ui.set('$.@link.{@group|@list|@choices}.', { Indent: false })
// ui.set('$.{@group|@list|@choices}.@link.', { Indent: false })
// return slots
// #region P.setup
// export const configureDefaultFieldPresenterComponents = (
//    /** so you don't have to polute the rest of your code */
//    overrides: Partial<WidgetSlots>,
// ): void => {
//    Object.assign(defaultPresenterSlots, overrides)
// }
