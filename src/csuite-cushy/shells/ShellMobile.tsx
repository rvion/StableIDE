import type { CompiledRenderProps } from '../presenters/RenderTypes'

import { observer } from 'mobx-react-lite'

import { WidgetHeaderContainerUI } from '../../csuite/form/WidgetHeaderContainerUI'
import { Frame } from '../../csuite/frame/Frame'
import { AnimatedSizeUI } from '../../csuite/smooth-size/AnimatedSizeUI'
import { _isFC, renderFCOrNode, renderFCOrNodeWithWrapper } from '../../csuite/utils/renderFCOrNode'

export const ShellMobileUI = observer(function ShellMobile(p: CompiledRenderProps) {
   const { field } = p
   if (p.field.isHidden && !p.shouldShowHiddenFields) return null

   const WUI = (
      <Frame
         className={p.className ?? undefined}
         tw={['UI-WidgetWithLabel !border-b-0 !border-l-0 !border-r-0']}
         base={field.background}
         border={field.border}
         {...p.field.config.box}
      >
         {/* HEADER --------------------------------------------------------------------------------- */}
         <WidgetHeaderContainerUI field={field}>
            {_isFC(p.Indent) ? <p.Indent tw='pr-2' depth={field.depth} /> : p.Indent}
            <div tw='flex-1'>
               {/* prettier-ignore */}
               <div tw='flex flex-1'>
                  {renderFCOrNode(p.DragKnob, { field })}
                  {renderFCOrNode(p.Caret,    { placeholder: false, field })}
                  {renderFCOrNode(p.Icon,     { field, className: 'mr-1' })}
                  {renderFCOrNode(p.Title,    { field })}
                  {renderFCOrNode(p.DebugID,  { field })}
                  {renderFCOrNode(p.Presets,  { field })}
               </div>
               <div tw='flex flex-1'>
                  {_isFC(p.Toogle) ? <p.Toogle field={field} /> : p.Toogle}
                  {renderFCOrNodeWithWrapper(p.Header, p, p.ContainerForHeader, {
                     className: p.classNameAroundBodyAndHeader ?? undefined,
                     field,
                  })}
               </div>
            </div>
         </WidgetHeaderContainerUI>

         {/* BODY  */}
         {renderFCOrNodeWithWrapper(p.Body, p, p.ContainerForBody, {
            className: p.classNameAroundBodyAndHeader ?? undefined,
         })}

         {/* ERRORS  */}
         {renderFCOrNode(p.Errors, { field })}
      </Frame>
   )

   if (field.animateResize && p.Body != null) return <AnimatedSizeUI>{WUI}</AnimatedSizeUI>
   return WUI
})
