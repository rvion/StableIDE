import type { Routine } from './Routine'

import { observer } from 'mobx-react-lite'
import { type CSSProperties, type ReactNode, useRef } from 'react'

import { ModalShellUI } from '../../csuite/modal/ModalShell'
import { computePlacement } from '../../csuite/reveal/RevealPlacement'

export const ActivityContainerUI = observer(function ActivityContainerUI_(p: {
   routine: Routine
   uid?: string
   ix?: number
   children: ReactNode
   stop: () => void
}) {
   const shellRef = useRef<HTMLDivElement>(null)
   const routine = p.routine
   const backdropzIndex = 1000 + 100 * (p.ix ?? 1)
   const activityZIndex = backdropzIndex + 1
   const activity = p.routine.activity
   let pos: CSSProperties | undefined = undefined
   if (activity.event) {
      const target = activity.event.target
      if (target instanceof HTMLElement) {
         pos = computePlacement(
            //
            activity.placement ?? 'screen',
            target.getBoundingClientRect(),
            shellRef.current?.getBoundingClientRect() ?? null,
         )
      }
   }
   return (
      <div // whole screen
         ref={shellRef}
         tabIndex={-1}
         className='$activity-root'
         tw='pointer-events-auto absolute inset-0 h-full w-full'
         onAuxClick={(ev) => {
            activity.onAuxClick?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onClick={(ev) => {
            activity.onClick?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onMouseDown={(ev) => {
            activity.onMouseDown?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onMouseEnter={(ev) => {
            activity.onMouseEnter?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onMouseUp={(ev) => {
            activity.onMouseUp?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onMouseMove={(ev) => {
            activity.onMouseMove?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onMouseLeave={(ev) => {
            activity.onMouseLeave?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
         onKeyUp={(ev) => {
            // 💬 2024-06-22 rvion:
            // | I'm OK with escape being a built-in feature
            // | safeguard for escape key
            // | so no custom activity can lock the UI
            const shouldStopOnEscapeKey = activity.stopOnEscapeKey ?? true
            if (shouldStopOnEscapeKey && ev.key === 'Escape') {
               console.log('Escape key pressed')
               p.stop?.()
            }

            activity.onKeyUp?.(ev, routine)
            activity.onEvent?.(ev, routine)
         }}
      >
         <div tw='relative h-full w-full'>
            {activity.backdrop ? (
               <div // backdrop
                  className='$activity-backdrop'
                  tw='absolute inset-0 bg-[#000000db]'
                  style={{ zIndex: backdropzIndex }}
               >
                  <div style={{ zIndex: -1 }} tw='absolute inset-0'></div>
               </div>
            ) : null}

            {/* <div // debug info
               tw='absolute left-10 top-10 [z-index:99999]'
            >
               activity "{activity.title}"
            </div> */}

            <div // activity area
               // 1. when an activity is POPED, we NEED to focus it
               // so events are captured by the activity
               tabIndex={-1}
               autoFocus
               // 2. the activity area may not cover the whole screen;
               // we may want to cap the activity to a subset of the screen
               tw='absolute inset-0'
               style={{ zIndex: activityZIndex, ...pos }}
               className='$activity-focus flex justify-center'
               onMouseDown={(ev) => {
                  if (!activity.stopOnBackdropClick) return
                  console.log('activity backref clicked')
                  if (ev.target === ev.currentTarget) p.stop() // ❌  => routine.stop()
               }}
            >
               {activity.shell === 'popup-lg' ? (
                  <ModalShellUI tw='m-8 h-fit w-fit max-w-lg' close={() => p.stop()} title={activity.title}>
                     {p.children}
                  </ModalShellUI>
               ) : activity.shell === 'popup-sm' ? (
                  <ModalShellUI tw='m-8 h-fit w-fit max-w-sm' close={() => p.stop()} title={activity.title}>
                     {p.children}
                  </ModalShellUI>
               ) : activity.shell === 'popup-full' ? (
                  <ModalShellUI tw='m-8' close={() => p.stop()} title={activity.title}>
                     {p.children}
                  </ModalShellUI>
               ) : (
                  p.children
               )}
            </div>
         </div>
      </div>
   )
})
