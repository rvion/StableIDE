import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { Frame } from '../frame/Frame'

/**
 * this container is used to wrap the list of values in their dense inline form.
 * it is used inline
 */
export const SelectValueContainerUI = observer(function SelectValueContainerUI_<OPTION>(p: {
   //
   wrap?: Maybe<boolean | 'no-wrap-no-overflow-hidden'>
   children?: React.ReactNode
   valuesCount: number
}) {
   const [ref, setRef] = useState<HTMLDivElement | null>(null)
   const [isOverflowing, setIsOverflowing] = useState(false)

   function handleRef(ref: HTMLDivElement | null): void {
      setRef(ref)
      computeOverflow()
   }

   function computeOverflow(): void {
      if (!ref) return
      setIsOverflowing(ref.scrollHeight > ref.clientHeight || ref.scrollWidth > ref.clientWidth)
   }

   return (
      <div tw='w-full shrink grow overflow-hidden px-1'>
         <div
            ref={handleRef}
            tw={[
               'h-inside flex w-full flex-shrink flex-grow flex-row items-center gap-0.5',
               p.wrap === 'no-wrap-no-overflow-hidden' //
                  ? ''
                  : p.wrap === true
                    ? 'max-h-28 flex-wrap overflow-hidden'
                    : 'line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap',
            ]}
         >
            {p.children}
         </div>
         {isOverflowing && <SelectValueOverflowUI valuesCount={p.valuesCount} />}
      </div>
   )
})

export const SelectValueOverflowUI = observer(function SelectValueOverflowUI(p: { valuesCount: number }) {
   if (p.valuesCount <= 1) return null

   return (
      <Frame
         base={0}
         tw='box minw-inside h-inside absolute right-0 top-0 w-fit whitespace-nowrap px-1 text-center  shadow-md'
         description={`${p.valuesCount} valeurs`}
         style={{
            marginTop: 'calc((var(--input-height) - var(--inside-height)) / 2 - 1px)',
            marginRight: '2px',
         }}
      >
         {p.valuesCount}
      </Frame>
   )
})
