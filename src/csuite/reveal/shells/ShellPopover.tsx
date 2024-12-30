import type { RevealShellProps } from './ShellProps'

import { observer } from 'mobx-react-lite'

import { Frame } from '../../frame/Frame'

export const ShellPopoverUI = observer(function ShellPopoverUI_(p: RevealShellProps) {
   const reveal = p.reveal
   const locked = reveal._lock
   return (
      <Frame
         // make sure the shell intercept focus events
         // when  see _ShellForFocusEvents
         ref={p.shellRef}
         tabIndex={0}
         shadow
         className={reveal.p.shellClassName}
         tw={[
            //
            '_RevealUI pointer-events-auto ',
            false && '!bg-green-400 p-5', // 🔶 debug
            // when we click inside the popup, anchor is blurred but we don't want to close via onAnchorBlur
            // we need some class to check that we're indeed focusing on a child of the popup
            '_ShellForFocusEvents',
         ]}
         roundness={cushy.preferences.theme.value.global.roundness}
         border={
            locked ? { hue: 0, contrast: 0.2, chromaBlend: 500 } : cushy.preferences.theme.value.global.border
         }
         dropShadow={cushy.preferences.theme.value.global.shadow}
         // onContextMenu={uist.open}
         onClick={(ev) => reveal.onShellClick(ev)}
         onMouseEnter={(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => reveal.onMouseEnterTooltip(ev)}
         onMouseLeave={(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => reveal.onMouseLeaveTooltip(ev)}
         style={{
            borderStyle: locked ? 'dashed' : 'inherit',
            ...reveal.posCSS,
         }}
      >
         {reveal.p.title != null && (
            <div tw='px-2'>
               <div tw='py-0.5'>{reveal.p.title}</div>
               <Frame tw='w-full rounded' base={{ contrast: 0.2 }} style={{ height: '1px' }}></Frame>
            </div>
         )}

         {p.children}
         {locked ? (
            <Frame // LOCK
               icon='mdiLock'
               text={{ contrast: 0.3 }}
               tw='flex items-center justify-center gap-1 text-sm italic'
            >
               shift+right-click to unlock
            </Frame>
         ) : null}
      </Frame>
   )
})
