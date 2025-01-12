import type { FieldTypes } from '../../csuite/model/$FieldTypes'
import type { Field } from '../../csuite/model/Field'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { InputBoolCheckboxUI } from '../../csuite/checkbox/InputBoolCheckboxUI'
import { InputBoolUI } from '../../csuite/checkbox/InputBoolUI'
import { WidgetChoices_HeaderButtonsUI } from '../../csuite/fields/choices/WidgetChoices_HeaderButtonsUI'
import { WidgetChoices_HeaderSelectUI } from '../../csuite/fields/choices/WidgetChoices_HeaderSelectUI'
import { WidgetChoices_HeaderTabBarUI } from '../../csuite/fields/choices/WidgetChoices_HeaderTabBarUI'
import { WidgetGroup_BlockUI } from '../../csuite/fields/group/WidgetGroup_BlockUI'
import { WidgetGroup_LineUI } from '../../csuite/fields/group/WidgetGroup_Header'
import { WidgetGroup_InlineUI } from '../../csuite/fields/group/WidgetGroup_InlineUI'
import { WidgetGroup_TabUI } from '../../csuite/fields/group/WidgetGroup_TabUI'
import { BlenderListUI } from '../../csuite/fields/list/BlenderListUI'
import { WidgetNumberSimpleUI } from '../../csuite/fields/number/WidgetNumberSimpleUI'
import { WidgetNumberUI } from '../../csuite/fields/number/WidgetNumberUI'
import { WidgetString_MarkdownUI } from '../../csuite/fields/string/WidgetString_Markdown'
import { WidgetString_SmallInput } from '../../csuite/fields/string/WidgetString_SmallInput'
import { WidgetString_summary } from '../../csuite/fields/string/WidgetString_summary'
import { WidgetString_TextareaInput } from '../../csuite/fields/string/WidgetString_TextareaInput'
import { Frame, type FrameProps } from '../../csuite/frame/Frame'
import { IkonOf } from '../../csuite/icons/iconHelpers'
import { InputNumberUI } from '../../csuite/input-number/InputNumberUI'
import { MessageErrorUI } from '../../csuite/messages/MessageErrorUI'
import { MessageInfoUI } from '../../csuite/messages/MessageInfoUI'
import { MessageWarningUI } from '../../csuite/messages/MessageWarningUI'
import { ResizableFrame } from '../../csuite/resizableFrame/resizableFrameUI'
import { useDropZone } from '../../widgets/galleries/dndGeneric'
import { WidgetCardUI } from '../catalog/Decorations/WidgetCardUI'
import { WidgetPadUI } from '../catalog/Decorations/WidgetPadUI'
import { QuickForm } from '../catalog/group/QuickForm'
import { WidgetIndentNoLinesUI } from '../catalog/Indent/IndentNoLine'
import { WidgetIndentUI } from '../catalog/Indent/WidgetIndentUI'
import { H1Title, H2Title, H3Title, H4Title } from '../catalog/Title/H123Title'
import { DefaultWidgetTitleUI } from '../catalog/Title/WidgetLabelTextUI'
import {
   ShellCushyFluidUI,
   ShellCushyLeftUI,
   ShellCushyList1UI,
   ShellCushyRightUI,
} from '../shells/ShellCushy'
import { ShellInlineUI } from '../shells/ShellInline'
import { ShellMobileUI } from '../shells/ShellMobile'
import { ShellNoop } from '../shells/ShellNoop'
import { ShellSimpleUI } from '../shells/ShellSimple'

type Prop<T> = keyof T

const test = observer(
   ({
      field,
      config,
   }: {
      field: Field
      config?: { [K in keyof (typeof field)['$Config']]: (typeof field)['$Config'][K] }
   }): JSX.Element => {
      const conf = (field['$Config'] = { ...field['$Config'], ...config })

      switch (field.type) {
         case 'bool':
            return <UY.boolean.default toggleGroup='' {...conf} />
         default:
            return <>{field.type}</>
      }
      return <>{field.type}</>
   },
)

export type WidgetsCatalog = typeof widgetsCatalog /* {
   Misc: {
      Frame: FC<FrameProps>
      Button: FC<ButtonProps>
      Checkbox: FC<BoolButtonProps>
   }
   Decorations: {
      Card: FC<WidgetCardProps>
   }
   // shells
   Shell: {
      Noop: FC<CompiledRenderProps>
      Simple: FC<CompiledRenderProps>
      Mobile: FC<CompiledRenderProps>
      Left: FC<CompiledRenderProps>
      Right: FC<CompiledRenderProps>
      FluidUI: FC<CompiledRenderProps>
      Inline: FC<CompiledRenderProps>
      //
      List1: FC<CompiledRenderProps>
   }

   Title: {
      h1: FC<WidgetTitleProps>
      h2: FC<WidgetTitleProps>
      h3: FC<WidgetTitleProps>
      h4: FC<WidgetTitleProps>
      default: FC<WidgetTitleProps>
   }

   Indent: {
      indentWithLiness: FC<WidgetIndentProps>
      indentNoLiness: FC<WidgetIndentProps>
   }

   // quick form system
   QuickForm: (p: QuickFormProps) => JSX.Element

   // fields
   number: {
      def: FC<{ field: Field_number }>
   }

   choices: {
      TabbedInline: FC<{ field: Field_choices<any> }>
      Buttons: FC<{ field: Field_choices<any> }>
      SelectHeaderUI: FC<{ field: Field_choices<any> }>
   }

   string: {
      input: FC<{ field: Field_string }>
      summary: FC<{ field: Field_string }>
      textarea: FC<{ field: Field_string }>
   }

   list: {
      BlenderLike: typeof BlenderListUI
   }
   // optional:{
   //    toggleButton: FC<{ field: Field_string }>
   // }
   group: {
      Tabbed: typeof WidgetGroup_TabUI
      controls: typeof WidgetGroup_LineUI
      group: typeof WidgetGroup_BlockUI
      inline: typeof WidgetGroup_InlineUI
   }
} */

export const widgetsCatalog /* WidgetsCatalog */ = {
   // #region global stuff
   Decorations: {
      Card: WidgetCardUI,
      Pad: WidgetPadUI,
   },
   IkonOf: IkonOf,
   Message: {
      Error: MessageErrorUI,
      Info: MessageInfoUI,
      Warning: MessageWarningUI,
   },
   QuickForm: QuickForm,
   Shell: {
      Default: ShellCushyLeftUI,
      Simple: ShellSimpleUI,
      Mobile: ShellMobileUI,
      Noop: ShellNoop,
      Left: ShellCushyLeftUI,
      Right: ShellCushyRightUI,
      FluidUI: ShellCushyFluidUI,
      Inline: ShellInlineUI,
      //
      List1: ShellCushyList1UI,
   },
   // #region Utils
   Layout: {
      Col: observer(function ColumnUI_(p: FrameProps) {
         const theme = cushy.preferences.theme.value

         return (
            <Frame
               col
               border={p.align ? true : undefined}
               roundness={p.align ? theme.global.roundness : undefined}
               dropShadow={p.align ? theme.global.shadow : undefined}
               expand={p.expand ?? true}
               {...p}
            />
         )
      }),
      Row: observer(function ColumnUI_(p: FrameProps) {
         const theme = cushy.preferences.theme.value
         return (
            <Frame
               row
               border={p.align ? true : undefined}
               roundness={p.align ? theme.global.roundness : undefined}
               dropShadow={p.align ? theme.global.shadow : undefined}
               expand={p.expand ?? true}
               {...p}
            />
         )
      }),
   },

   Misc: {
      Frame: Frame,
      Button: Button,
      Checkbox: InputBoolCheckboxUI,
      ResizableFrame: ResizableFrame,
   },
   // #region Form components
   Title: {
      h1: H1Title,
      h2: H2Title,
      h3: H3Title,
      h4: H4Title,
      default: DefaultWidgetTitleUI,
   },
   Indent: {
      indentWithLiness: WidgetIndentNoLinesUI,
      indentNoLiness: WidgetIndentUI,
   },
   // #region fields
   number: {
      def: WidgetNumberUI,
      /** inline WidgetNumber */
      input: WidgetNumberUI,
      simple: WidgetNumberSimpleUI,
   },
   boolean: {
      default: InputBoolUI,
   },
   choices: {
      TabbedInline: WidgetChoices_HeaderTabBarUI,
      Buttons: WidgetChoices_HeaderButtonsUI,
      SelectHeaderUI: WidgetChoices_HeaderSelectUI,
   },
   string: {
      input: WidgetString_SmallInput,
      summary: WidgetString_summary,
      textarea: WidgetString_TextareaInput,
      markdown: WidgetString_MarkdownUI,
   },
   list: {
      BlenderLike: BlenderListUI,
   },
   group: {
      Tabbed: WidgetGroup_TabUI,
      controls: WidgetGroup_LineUI,
      Default: WidgetGroup_BlockUI,
      inline: WidgetGroup_InlineUI,
   },
   Prop: test,
   DropZone: useDropZone,
}

// make globally available
;(window as any).UY = widgetsCatalog
if (import.meta.hot) {
   import.meta.hot.accept()
   ;(window as any).UY = widgetsCatalog
}
