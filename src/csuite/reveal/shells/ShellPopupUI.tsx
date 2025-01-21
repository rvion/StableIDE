import type { RevealShellProps } from './ShellProps'

import { observer } from 'mobx-react-lite'

// 👽 import { useEffect } from 'react'
import { type ModalShellSize, ModalShellUI } from '../../modal/ModalShell'
import { exhaust } from '../../utils/exhaust'
import { mergeStylesTsEfficientInNew } from '../../utils/mergeStylesTsEfficient'

export const ShellPopupXSUI = (p: RevealShellProps): React.JSX.Element => <ShellPopupUI size='xs' {...p} />
export const ShellPopupSMUI = (p: RevealShellProps): React.JSX.Element => <ShellPopupUI size='sm' {...p} />
export const ShellPopupLGUI = (p: RevealShellProps): React.JSX.Element => <ShellPopupUI size='lg' {...p} />
export const ShellPopupXLUI = (p: RevealShellProps): React.JSX.Element => <ShellPopupUI size='xl' {...p} />

export const ShellPopupUI = observer(function ShellPopupUI_(p: RevealShellProps & { size?: ModalShellSize }) {
   const reveal = p.reveal
   // 👽 useEffect(() => {
   // 👽     reveal.onMouseEnterTooltip()
   // 👽     return (): void => reveal.onMouseLeaveTooltip()
   // 👽 })

   // compute min sizes
   const minWidth: string = ((): string => {
      const size = p.size
      const maxWidth = _toSize(p.reveal.posCSS.maxWidth, `95vw`)
      if (size == null) return `min(${maxWidth}, 20rem)`
      if (size === 'xs') return `min(${maxWidth}, 20rem)`
      if (size === 'sm') return `min(${maxWidth}, 30rem)`
      if (size === 'lg') return `min(${maxWidth}, 50vw)`
      if (size === 'xl') return maxWidth
      return exhaust(size)
   })()

   // compute min sizes
   const minHeight: string = ((): string => {
      const size = p.size
      const maxHeight: string = _toSize(p.reveal.posCSS.maxWidth, `95vw`)
      if (size == null) return `min(${maxHeight}, 20rem)`
      if (size === 'xs') return `min(${maxHeight}, 20rem)`
      if (size === 'sm') return `min(${maxHeight}, 30rem)`
      if (size === 'lg') return `min(${maxHeight}, 50vw)`
      if (size === 'xl') return maxHeight
      return exhaust(size)
   })()

   return (
      <ModalShellUI //
         shellRef={p.shellRef}
         onClick={(ev) => reveal.onShellClick(ev)}
         style={mergeStylesTsEfficientInNew(p.reveal.posCSS, { minWidth, minHeight })} // 👽
         size={p.size}
         close={() => reveal.close('closeButton')}
         title={reveal.p.title}
      >
         {p.children}
      </ModalShellUI>
   )
})

function _toSize(a: Maybe<string | number>, def: string): string {
   if (a == null) return def
   if (typeof a === 'number') return `${a}px`
   return a
}
