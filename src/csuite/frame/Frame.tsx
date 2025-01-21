import type { BoxUIProps } from '../box/BoxUIProps'
import type { IconName } from '../icons/icons'
import type { RevealPlacement } from '../reveal/RevealPlacement'
import type { ComputedColors } from './FrameColors'
import type { FrameSize } from './FrameSize'
import type { FrameAppearance } from './FrameTemplates'
import type { SimpleBoxShadow } from './SimpleBoxShadow'
import type { SimpleDropShadow } from './SimpleDropShadow'
import type { AriaRole, ForwardedRef, MouseEvent } from 'react'

import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'

import { normalizeBox } from '../box/BoxNormalized'
import { CurrentStyleCtx } from '../box/CurrentStyleCtx'
import { type ClickAndSlideConf, usePressLogic } from '../button/usePressLogic'
import { IkonOf } from '../icons/iconHelpers'
import { registerComponentAsClonableWhenInsideReveal } from '../reveal/RevealCloneWhitelist'
import { compileOrRetrieveClassName } from '../tinyCSS/quickClass'
import { getDOMElementDepth } from '../utils/getDOMElementDepth'
import { objectAssignTsEfficient_t_t } from '../utils/objectAssignTsEfficient'
import { computeColors } from './FrameColors'
import { frameMode } from './frameMode'
import { tooltipStuff } from './tooltip'

export type FrameProps = {
   ref?: ForwardedRef<HTMLDivElement>
   //
   as?: string

   /** by default, frames are flex, if you want them to be block, use `block` property, or change the display property manually */
   block?: boolean

   container?: boolean | string | React.HTMLAttributes<HTMLDivElement>

   tooltip?: string
   tooltipPlacement?: RevealPlacement

   /** should be moved to Box props soon */
   boxShadow?: SimpleBoxShadow
   dropShadow?: SimpleDropShadow

   // quick layout ----------------------------------------------------
   /** quick layout feature to add `flex flex-row` */
   row?: boolean
   /** quick layout feature to add `flex flex-row items-center` */
   line?: boolean
   linegap?: boolean
   wrap?: boolean
   /** quick layout feature to add `flex flex-col` */
   col?: boolean

   // hovering --------------------------------------------------------

   /** allow to pretend the frame is hovered */
   hovered?: (reallyHovered: boolean) => boolean | undefined

   // logic --------------------------------------------------
   /** TODO: */
   triggerOnPress?: ClickAndSlideConf
   // STATES MODIFIERS ------------------------------------------------
   active?: Maybe<boolean>
   loading?: boolean
   disabled?: boolean

   // FITT size -------------------------------------------------------
   // /** when true flex=1 */
   expand?: boolean

   /** border-radius */
   roundness?: number | string

   /** HIGH LEVEL THEME-DEFINED BOX STYLES */
   look?: FrameAppearance
   // ICON ------------------------------------------------------------
   icon?: Maybe<IconName>
   iconSize?: string

   suffixIcon?: Maybe<IconName>
   noColorStuff?: boolean

   /** Makes children of the Frame "!rounded-none !border-none", grouping them together visually */
   align?: boolean
   role?: AriaRole
} & BoxUIProps &
   /** Sizing and aspect ratio vocabulary */
   FrameSize

// ------------------------------------------------------------------
export const Frame = observer(function Frame_(p: FrameProps) {
   // PROPS --------------------------------------------

   // prettier-ignore
   const {
            ref,
            as,                                                 // html

            align, active, disabled,                            // built-in state & style modifiers
            icon, iconSize, suffixIcon, loading,                // addons
            expand, square, size,                               // size

            look,                                               // style: 1/4: frame templates
            base, hover, border, text, textShadow, shadow,      // style: 2/4: frame overrides
            roundness,
            boxShadow, dropShadow,                              // style: 3/4: css
            style, className,                                   // style: 4/4: css, className

            container, row, line, col, wrap,                    // layout

            hovered: hovered__,                                 // state
            onMouseDown, onMouseEnter, onClick, triggerOnPress, // interactions
            tooltip, tooltipPlacement,

            noColorStuff: noColorStuff__,
            // remaining properties
            ...rest
        } = p

   const enableTriggerOnPress = true // (bird_d): Assuming this is for triggering onMouseDown on various components?

   // TEMPLATE -------------------------------------------
   // const theme = useTheme().value
   const prevCtx = useContext(CurrentStyleCtx)
   const box = normalizeBox(p)
   const [hovered_, setHovered] = useState(false)
   const hovered = hovered__ ? hovered__(hovered_) : hovered_
   const noColorStuff = p.noColorStuff ?? prevCtx.noColorStuff

   // 👉 2024-06-12 rvion: we should probably be able to
   // | stop here by checking against a hash of those props
   // | + prevCtx + box + look + disabled + hovered + active + boxShadow
   // 👉 2024-07-22 rvion: done
   const { variables, nextDir, KBase, nextext }: ComputedColors = noColorStuff // 🔴
      ? { variables: {}, nextDir: prevCtx.dir ?? 1, KBase: prevCtx.base, nextext: prevCtx.text }
      : computeColors(prevCtx, box, look, disabled, hovered, active, boxShadow, dropShadow, roundness)

   // ===================================================================
   const _onMouseOver = (ev: MouseEvent): void => {
      // console.log(`[🤠] hover`, ev.currentTarget)
      if (p.hover != null) setHovered(true)
      if (tooltip != null) {
         const elem = ev.currentTarget
         const depth = getDOMElementDepth(elem)
         runInAction(() => {
            tooltipStuff.tooltips.set(depth, {
               depth,
               ref: elem,
               text: tooltip ?? 'test',
               placement: tooltipPlacement ?? 'auto',
            })
         })
      }
   }

   const _onMouseOut = (ev: MouseEvent): void => {
      if (p.hover != null) setHovered(false)
      if (tooltip != null) {
         const elem = ev.currentTarget
         const depth = getDOMElementDepth(elem)
         const prev = tooltipStuff.tooltips.get(depth)
         if (prev?.ref === ev.currentTarget) {
            runInAction(() => {
               tooltipStuff.tooltips.delete(depth)
            })
         }
      }
   }

   // for typescript perf reason, let's not care about the `as` prop
   // and just pretend it's always a div. it will mostly always be.

   const Elem: 'div' = (as ?? 'div') as 'div'
   // ===================================================================
   return (
      <Elem //
         ref={ref}
         // 📋 tooltip is now handled by csuite directly
         // | no need to rely on the browser's default tooltip
         // | // title={tooltip}

         onMouseOver={_onMouseOver}
         onMouseOut={_onMouseOut}
         // special-case: if it's a button, let's add type=button to disable form submission
         {...(as === 'button' ? { type: 'button' } : {})}
         // special-case: if it's an image, let's make it lazy; should be the default
         {...(as === 'image' ? { loading: 'lazy' } : {})}
         tw={[
            'box',
            noColorStuff === true
               ? undefined
               : frameMode === 'CLASSNAME'
                 ? compileOrRetrieveClassName(variables)
                 : undefined,
            // 'flex',
            size && `box-${size}`,
            square && `box-square`,
            loading && 'relative',
            expand && 'w-full',
            // layout
            p.line && 'flex flex-row items-center gap-x-1',
            // p.linegap && 'flex flex-row items-center gap-x-2',
            p.row && 'flex flex-row',
            p.col && 'flex flex-col',
            p.wrap && 'flex-wrap',
            p.align && [
               // Clip children to fix border issues and make the children styled correctly
               'flex !gap-0 overflow-clip [&>*]:!rounded-none [&>*]:!border-0',
               // Add borders/"dividers" where needed (Right/Bottom of every child except last)
               p.col
                  ? 'flex-col [&>*:not(:last-child)]:!border-b'
                  : 'h-input flex-row [&>*:not(:last-child)]:!border-r',
               // '[&>*:not(:last-child)]:!mr-[1px]',
            ],
            // Fixes scrolling when used as a container
            p.container && 'overflow-clip',
            className,
         ]}
         // style={{ position: 'relative' }}
         style={
            noColorStuff === true
               ? style
               : frameMode === 'CLASSNAME' //
                 ? style
                 : objectAssignTsEfficient_t_t(style, variables)
         }
         {...rest}
         {...(triggerOnPress != null && enableTriggerOnPress
            ? usePressLogic({ onMouseDown, onMouseEnter, onClick }, triggerOnPress)
            : { onMouseDown, onMouseEnter, onClick })}
      >
         <CurrentStyleCtx.Provider
            value={{
               dir: nextDir,
               base: KBase,
               text: nextext,
               noColorStuff: noColorStuff,
            }}
         >
            {icon && <IkonOf tw='pointer-events-none flex-none' name={icon} size={iconSize} />}
            {container != null ? (
               <div
                  tw={
                     typeof container === 'string'
                        ? container
                        : typeof container === 'boolean'
                          ? [
                               //
                               'flex h-full w-full flex-1 flex-col overflow-auto',
                               // TODO(bird_d): Use csuite theming for these
                               'gap-1 p-2',
                            ]
                          : undefined
                     //   ? 'flex flex-col gap-1 p-2 '
                  }
                  {...(typeof container === 'object' ? container : undefined)}
               >
                  {p.children}
               </div>
            ) : (
               p.children
            )}
            {suffixIcon && <IkonOf tw='pointer-events-none' name={suffixIcon} size={iconSize} />}
            {loading && (
               <div tw='loading loading-spinner loading-sm absolute self-center justify-self-center' />
            )}
         </CurrentStyleCtx.Provider>
      </Elem>
   )
})

Frame.displayName = 'Frame'
// @ts-ignore
Frame.name = 'Frame'

registerComponentAsClonableWhenInsideReveal(Frame)
