import type { RevealCloseEvent } from './RevealCloseEvent'
import type { RevealPlacement } from './RevealPlacement'
import type { RevealPresetName } from './RevealPresets'
import type { RevealState } from './RevealState'
import type { RevealStateLazy } from './RevealStateLazy'
import type { RevealContentProps, RevealShellProps } from './shells/ShellProps'
import type React from 'react'
import type { FC } from 'react'

// prettier-ignore
export type KnownShells =
    | 'none'
    | 'popover'
    | 'popup'
    | 'popup-xs'
    | 'popup-sm'
    | 'popup-lg'
    | 'popup-xl'

export type RevealPreset = {
   show: RevealShowTriggers
   hide: RevealHideTriggers
}

export type RevealShowTriggersExt = RevealShowTriggers | RevealShowTrigger
export type RevealShowTriggers = {
   [key in RevealShowTrigger]?:
      | boolean
      | ((reveal: RevealState, Reveal: typeof RevealState) => boolean | undefined)
}
export type RevealShowTrigger =
   | 'anchorFocus'
   | 'anchorClick'
   | 'anchorDoubleClick'
   | 'anchorHover'
   | 'anchorRightClick'
   | 'keyboardEnterOrLetterWhenAnchorFocused'

// ❓ |  () => ...
// ❓ |  { chick: ..., hover: ..., focus: ... }

export type RevealHideTriggers = { [key in RevealHideTrigger]?: boolean }
export type RevealHideTrigger =
   | 'mouseOutside' //
   | 'escapeKey'
   | 'blurAnchor'
   | 'clickAnchor'
   | 'backdropClick' // via shell backdrop
   | 'shellClick' // via shell (not backdrop)
   | 'tabKey'
   | 'none'
// | 'blurTooltip' // not sure we need this one

export type RevealHideReason =
   | 'leftClickAnchor' //
   | 'rightClickAnchor' //
   | 'backdropClick'
   | 'shellClick' // via shell (not backdrop)
   | 'mouseOutside'
   | 'tabKey'
   | 'shiftTabKey'
   | 'escapeKey'
   | 'pickOption'
   | 'blurAnchor'
   | 'closeButton' // ex: in modals
   | 'an-other-reveal-opened' // another reveal appearing caused the closure
   | 'programmatic'
   | 'unknown'
   | 'RevealUI-is-unmounted'

export type RevealOpenReason =
   | 'doubleClickAnchor' //
   | 'leftClickAnchor' //
   | 'rightClickAnchor' //
   | 'tabKey'
   | 'shiftTabKey'
   | 'programmatically-via-open-function'
   | 'unknown'
   | 'child-is-opening-so-as-parent-I-must-open-too'
   | 'mouse-enter-anchor-(no-parent-open)'
   | 'mouse-enter-anchor-(with-parent-open)'
   | 'focus-anchor'
   | 'KeyboardEnterOrLetterWhenAnchorFocused'
   | 'default-visible'

export type RevealProps = {
   ref?: React.Ref<RevealStateLazy>

   /** used to identify reveal when src/csuite/reveal/DEBUG_REVEAL.tsx set to true */
   debugName?: string

   /** so you can check if the reveal is part of the same semantic group */
   revealGroup?: string

   /** @since 2024-07-23 */
   relativeTo?: `#${string}` | 'mouse' | 'anchor'

   // placement
   placement?: RevealPlacement

   /**
    * @deprecated
    * unused for now, backword compatibility with rsuite
    */
   enterable?: boolean

   // components / slots -------------------------------------------------------------
   /** @since 2024-07-23 */
   shell?: FC<RevealShellProps> | KnownShells
   content: FC<RevealContentProps> // | null
   children?: React.ReactNode //, React.ReactNode]
   title?: React.ReactNode // only for popup

   // callbacks if we need to add side effects after reveal/hide
   onAnchorKeyDown?: (ev: React.KeyboardEvent) => void
   onRevealed?: (rst: RevealState) => void
   onBeforeHide?: (ev: RevealCloseEvent) => void
   onHidden?: (reason: RevealHideReason) => void

   // SHOW triggers ------------------------------------------------------------------
   /** preset that comes with a bunch show and hide triggers */
   trigger?: RevealPresetName | RevealPresetName[]

   hideTriggers?: RevealHideTriggers
   showTriggers?: RevealShowTriggers

   // delays ------------------------------------------------------------------
   hideDelay?: number /** only for hover */
   showDelay?: number /** only for hover */

   // ... ------------------------------------------------------------------
   defaultVisible?: boolean

   // look and feel ------------------------------------------------------------------
   shellClassName?: string
   className?: string
   style?: React.CSSProperties

   // avoid extra div ------------------------------------------------------------------
   UNSAFE_cloned?: boolean

   sharedAnchorRef?: React.RefObject<HTMLDivElement>

   // #region backdrop stuff
   backdropColor?: string
   hasBackdrop?: boolean
   showBackdrop?: boolean

   /**
    * when we have nested Reveals but they actually are independent
    */
   useSeparateTower?: boolean

   /**
    * Advanced feature:
    * if you need to open modal programmatically, outside of
    * a react component, the RevealUI won't be able to retrieve
    * it's parent tower from the react context. in that case, you'll need
    * to pass that.
    *
    */
   parentRevealState?: RevealStateLazy

   // 🔴 actually the child may not accept DovProps...
   anchorProps?: React.HTMLAttributes<HTMLDivElement>
}
