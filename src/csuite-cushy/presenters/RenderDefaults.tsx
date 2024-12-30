import type { Field } from '../../csuite/model/Field'
import type { FCOrNode } from '../../csuite/utils/renderFCOrNode'
import type { DisplaySlots } from './RenderSlots'
import type { DisplaySlotFn } from './RenderTypes'

import { ShellLinkUI } from '../../csuite/fields/link/WidgetLink'
import { ShellOptionalUI } from '../../csuite/fields/optional/WidgetOptional'
import { ShellSharedUI } from '../../csuite/fields/shared/WidgetSharedUI'
import { isFieldLink, isFieldOptional, isFieldShared } from '../../csuite/fields/WidgetUI.DI'
import { WidgetBodyContainerUI } from '../../csuite/form/WidgetBodyContainerUI'
import { WidgetHeaderContainerUI } from '../../csuite/form/WidgetHeaderContainerUI'
import { WidgetLabelCaretUI } from '../../csuite/form/WidgetLabelCaretUI'
import { WidgetLabelIconUI } from '../../csuite/form/WidgetLabelIconUI'
import { WidgetMenuUI } from '../../csuite/form/WidgetMenu'
import { WidgetSingleLineSummaryUI } from '../../csuite/form/WidgetSingleLineSummaryUI'
import { WidgetToggleUI } from '../../csuite/form/WidgetToggleUI'
import { WidgetUndoChangesButtonUI } from '../../csuite/form/WidgetUndoChangesButtonUI'
import { WidgetDebugIDUI } from '../catalog/Debug/WidgetDebugIDUI'
import { WidgetErrorsUI } from '../catalog/Errors/WidgetErrorsUI'
import { WidgetPresetsUI } from '../catalog/Presets/WidgetPresets'
import { DefaultWidgetTitleUI } from '../catalog/Title/WidgetLabelTextUI'
import { CushyHeadUI } from '../shells/CushyHead'
import { ShellCushyLeftUI } from '../shells/ShellCushy'
import { renderDefaultKey } from './RenderDefaultsKey'

const defaultPresenterRule: DisplaySlotFn<Field> = (ui) => {
   const field = ui.field
   const slots: DisplaySlots<Field> = {
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
      // debug stuff
      /* 🟣 */ DebugID: WidgetDebugIDUI,

      // only for the lolz
      /* 🟥 */ EasterEgg: (): JSX.Element => <>🥚</>,
   }
   const apply = (overrides: Partial<DisplaySlots<Field>>): void => void Object.assign(slots, overrides)
   slots.DebugID = null

   // shared
   if (isFieldShared(field)) slots.Shell = ShellSharedUI as any
   else if (isFieldLink(field)) slots.Shell = ShellLinkUI as any
   else if (isFieldOptional(field)) slots.Shell = ShellOptionalUI as any
   else {
      slots.Header = field.DefaultHeaderUI
      slots.Body = field.DefaultBodyUI
      slots.Extra = field.schema.LabelExtraUI as FCOrNode<{ field: Field }>

      if (field.depth === 1) {
         // if (field.isOfType('group', 'list', 'choices')) {
         //    slots.Decoration = (p): JSX.Element => <catalog.Decorations.Card field={field} {...p} />
         //    // slots.Title = catalog.Title.h3
         // }
      } else if (field.depth === 2) {
         if (field.isOfType('group', 'list', 'choices')) apply({ Title: UY.Title.h4 })
         if (!field.isOfType('optional', 'link', 'list', 'shared')) apply({ Shell: UY.Shell.Right })
      }

      // hide group head in choices
      if (field.parent?.type === 'choices' && field.type === 'group') {
         apply({ Head: false })
      }
   }

   ui.set(slots)
   ui.set('$@group', {
      Indent: false,
      Body: (f) => <UY.group.Default field={f.field as any /* 🔴 */} className='gap-1' />,
   })
   ui.set('$.{@group|@list|@choices}', {
      Decoration: (p) => <UY.Decorations.Card field={field} {...p} />,
   })
   ui.set('$.@link.{@group|@list|@choices}', {
      Decoration: (p) => <UY.Decorations.Card field={field} {...p} />,
   })
   ui.set('$.{@group|@list|@choices}.@link', {
      Decoration: (p) => <UY.Decorations.Card field={field} {...p} />,
   })
   ui.set('$', { collapsible: false })
   ui.set('@string', { Header: UY.string.input, Body: null })
   ui.set('@number', { Header: UY.number.input, Body: null })
   ui.set('$.{@group|@list|@choices}>', {
      Decoration: (p) => {
         if (field.type == 'choices') {
            return p.children
            // return field.defaultBody ? field.defaultBody() : <></>
         }
         return <UY.Decorations.Pad {...p} />
      },
   })

   ui.set('@image', {
      Header: false,
      Head: false,
      Decoration: (p) => {
         if (field.type == 'choices') {
            return p.children
            // return field.defaultBody ? field.defaultBody() : <></>
         }
         return <UY.Decorations.Pad {...p} />
      },
   })

   // ui.set('@number', { Header: UY.number.simple, Body: null })
   // ui.set('$.{@group|@list|@choices}.', { Indent: false })
   // ui.set('$.@link.{@group|@list|@choices}.', { Indent: false })
   // ui.set('$.{@group|@list|@choices}.@link.', { Indent: false })
   // return slots
}

// #region P.setup
// export const configureDefaultFieldPresenterComponents = (
//    /** so you don't have to polute the rest of your code */
//    overrides: Partial<WidgetSlots>,
// ): void => {
//    Object.assign(defaultPresenterSlots, overrides)
// }
;(window as any).defaultRenderRules = defaultPresenterRule
renderDefaultKey.version++
if (import.meta.hot) {
   import.meta.hot.accept()
}
