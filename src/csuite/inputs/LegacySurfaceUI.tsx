import type { ReactNode } from 'react'

/** LEGACY component, need to be removed */

export const LegacySurfaceUI = (p: {
   //
   header?: ReactNode
   className?: string
   children: ReactNode
}): React.JSX.Element => {
   const { header, children, ...rest } = p
   return (
      <div
         // style={{ border: '1px solid #404040' }}
         // tw='border-base-content input-bordered rounded-btn border border-opacity-25 bg-opacity-50 p-2'
         {...rest}
      >
         {header}
         {p.children}
      </div>
   )
}
