import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { useSizeOf } from './useSizeOf'

export type AnimatedSizeProps = {
   className?: string
   children?: ReactNode
}
/**
 * this widget allow to make size transition smooth
 * there might be better ways to do that;
 * I did that pretty naively, but it seems to be working
 */
export const AnimatedSizeUI: React.FC<AnimatedSizeProps> = observer(function AnimatedSizeUI_({
   className,
   children,
   ...rest
}) {
   const { ref: refFn, size } = useSizeOf()
   return (
      <div
         style={{ height: `${size.height}px` }}
         className={className}
         tw='smooth-resize-container animated'
         {...rest}
      >
         <div className='smooth-resize-content' ref={refFn}>
            {children}
         </div>
      </div>
   )
})
