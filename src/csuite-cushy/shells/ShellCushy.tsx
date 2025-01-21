import type { CompiledRenderProps } from '../presenters/RenderTypes'
import type React from 'react'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { fieldActionMenu } from '../../csuite/form/fieldActionMenu'
import { WidgetLabelContainerUI } from '../../csuite/form/WidgetLabelContainerUI'
import { Frame } from '../../csuite/frame/Frame'
import { useProvenance } from '../../csuite/provenance/Provenance'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { AnimatedSizeUI } from '../../csuite/smooth-size/AnimatedSizeUI'
import { WidgetPresetsUI } from '../catalog/Presets/WidgetPresets'

const CushyShellUI = observer(function CushySHell(
   p: CompiledRenderProps & {
      // card?: boolean
      border?: boolean
      HEADER: React.React.JSX.Element
   },
) {
   const field = p.field
   const utils = p.presenter.utils
   const provenance = useProvenance()
   const isCollapsed = ((): boolean => {
      if (p.collapsible != null) return p.collapsible // UI config most important
      if (!p.field.isCollapsible) return false
      return field.isCollapsed
   })()
   if (p.field.isHidden && !p.shouldShowHiddenFields) return null

   const theme = cushy.preferences.theme.value

   let WUI: ReactNode = (
      <Frame
         className={p.className ?? undefined}
         tw={['UI-WidgetWithLabel !border-b-0 !border-l-0 !border-r-0']}
         roundness={theme.global.roundness}
         base={field.background}
         // border={p.card ? 1 : field.border}
         {...p.field.config.box}
      >
         <RevealUI
            tw='w-full'
            trigger={'rightClick'}
            relativeTo='mouse'
            hideTriggers={{
               backdropClick: true,
               escapeKey: true,
               blurAnchor: true,
               clickAnchor: true,
            }}
            content={() => <fieldActionMenu.MenuEntriesUI field={p.field} provenance={provenance} />}
         >
            {utils.renderFCOrNodeWithWrapper(p.HEADER, {}, p.Head, p)}
         </RevealUI>
         {isCollapsed
            ? null
            : utils.renderFCOrNodeWithWrapper(p.Body, p, p.ContainerForBody, {
                 className: p.classNameAroundBodyAndHeader ?? undefined,
                 border: p.border,
              })}

         {/* ERRORS  */}
         {utils.renderFCOrNode(p.Errors, { field })}
      </Frame>
   )

   WUI = <AnimatedSizeUI>{WUI}</AnimatedSizeUI>
   if (p.Decoration) WUI = utils.renderFCOrNode(p.Decoration, { children: WUI })
   return WUI
})

export const ShellCushyLeftUI = observer(function ShellCushyLeft(p: CompiledRenderProps) {
   const field = p.field
   const originalField = field /* 🔴 */
   const utils = p.presenter.utils

   return (
      <CushyShellUI // 1️⃣
         {...p}
         HEADER={
            <>
               {/* prettier-ignore */}
               <WidgetLabelContainerUI tooltip={field.config.tooltip} justify>
                        {utils.renderFCOrNode(p.Indent,      { depth: field.depth })}
                        {utils.renderFCOrNode(p.DragKnob,    { field })}
                        {utils.renderFCOrNode(p.Caret,       { field, placeholder: true })}
                        {utils.renderFCOrNode(p.Icon,        { field, className: 'mr-1' })}
                        {utils.renderFCOrNode(p.Title,       { field })}
                        {utils.renderFCOrNode(p.Presets,     { field })}
                        {utils.renderFCOrNode(p.DebugID,     { field })}
                    </WidgetLabelContainerUI>
               {utils.renderFCOrNode(p.Toogle, { field: originalField, className: 'ml-0.5' })}
            </>
         }
      />
   )
})

export const ShellCushyList1UI = observer(function ShellCushyList1(p: CompiledRenderProps) {
   const field = p.field
   const originalField = field /* 🔴 */
   const utils = p.presenter.utils

   return (
      <CushyShellUI // 1️⃣
         {...p}
         HEADER={
            <>
               {/* prettier-ignore */}
               <WidgetLabelContainerUI tooltip={field.config.tooltip} justify>
                  {utils.renderFCOrNode(p.Indent,      { depth: field.depth })}
                  {utils.renderFCOrNode(p.DragKnob,    { field })}
                  {utils.renderFCOrNode(p.Caret,       { field, placeholder: true })}
                  {utils.renderFCOrNode(p.Icon,        { field, className: 'mr-1' })}
                  {utils.renderFCOrNode(p.Toogle, { field: originalField })}
                  {utils.renderFCOrNode(p.Title,       { field })}
                  {utils.renderFCOrNode(p.DebugID,     { field })}
               </WidgetLabelContainerUI>
               {utils.renderFCOrNode(p.Presets, { field })}
            </>
         }
      />
   )
})

export const ShellCushyRightUI = observer(function ShellCushyRight(p: CompiledRenderProps) {
   const field = p.field
   const originalField = field /* 🔴 */
   const utils = p.presenter.utils

   return (
      <CushyShellUI // 2️⃣2️⃣
         {...p}
         HEADER={
            <>
               <WidgetLabelContainerUI //
                  tooltip={field.config.tooltip}
                  justify
               >
                  {utils.renderFCOrNode(p.Indent /*    */, { depth: field.depth })}
                  {utils.renderFCOrNode(p.DragKnob /*  */, { field })}
                  {utils.renderFCOrNode(p.Caret /*     */, { field, className: 'mr-auto' })}
                  {utils.renderFCOrNode(p.Presets /*   */, { field, className: 'self-start mr-2' })}
                  {/* {p.field.isCollapsible ? 'collapsible' : 'not collapsible'} */}
                  {/* {!p.field.isCollapsed && !p.field.isCollapsible && <div tw='mr-auto' />} */}
                  <div tw='mr-auto' />
                  {utils.renderFCOrNode(p.Title /*     */, { field, className: 'mr-2' })}
                  {utils.renderFCOrNode(p.DebugID /*   */, { field })}
                  {utils.renderFCOrNode(p.Icon /*      */, { field, className: 'mx-1' })}
               </WidgetLabelContainerUI>
               {utils.renderFCOrNode(p.Toogle, { field: originalField })}
            </>
         }
      />
   )
})

export const ShellCushyFluidUI = observer(function ShellCushyFluid(p: CompiledRenderProps) {
   const field = p.field
   const originalField = field /* 🔴 */
   const utils = p.presenter.utils

   return (
      <CushyShellUI // 3️⃣3️⃣3️⃣
         {...p}
         HEADER={
            <>
               <WidgetLabelContainerUI //
                  tooltip={field.config.tooltip}
                  justify={false}
               >
                  {utils.renderFCOrNode(p.Indent, /*    */ { depth: field.depth })}
                  {utils.renderFCOrNode(p.DragKnob, /*  */ { field })}
                  {utils.renderFCOrNode(p.Caret, /*     */ { field })}
                  {utils.renderFCOrNode(p.Toogle, /*    */ { field: originalField, className: 'mr-1' })}
                  {utils.renderFCOrNode(p.Icon, /*      */ { field, className: 'mr-1' })}
                  {utils.renderFCOrNode(p.Title, /* */ { field })}
                  {utils.renderFCOrNode(p.DebugID, /*   */ { field })}
                  <WidgetPresetsUI field={field} />
               </WidgetLabelContainerUI>
            </>
         }
      />
   )
})
