import hljs from 'highlight.js/lib/core'
// import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import { useLayoutEffect, useRef } from 'react'

import { Button } from '../../csuite/button/Button'

hljs.registerLanguage('typescript', typescript)
// hljs.registerLanguage('json', json)

export const TypescriptHighlightedCodeUI = (p: {
   //
   tabIndex?: number
   className?: string
   code: string
   wrap?: boolean
}): React.JSX.Element => {
   const ref = useRef(null)
   useLayoutEffect(() => {
      const e = ref.current
      if (e == null) return
      hljs.highlightElement(e)
   }, [ref, p.code])
   return (
      <div className='relative'>
         <div className='absolute right-2 top-2'>
            <Button
               size='sm'
               tabIndex={p.tabIndex}
               icon='mdiClipboard'
               onClick={() => navigator.clipboard.writeText(p.code)}
            />
         </div>
         <code
            key={p.code}
            className={'language-typescript text-xs ' + p.className}
            style={{ whiteSpace: p.wrap ? 'pre-wrap' : 'pre' }}
            ref={ref}
         >
            {p.code}
         </code>
      </div>
   )
}

export const JSONHighlightedCodeUI = (p: { code: string }): React.JSX.Element => {
   // const ref = useRef(null)
   // useLayoutEffect(() => {
   //     const e = ref.current
   //     if (e == null) return
   //     hljs.highlightElement(e)
   // }, [ref, p.code])
   return (
      <code
         //
         key={p.code}
         className='language-json text-xs'
         style={{ whiteSpace: 'pre-wrap' }}
         // ref={ref}
      >
         {p.code}
      </code>
   )
}

// export const HTMLtHighlightedCodeUI = (p: { code: string; className?: string }) => {
//     return (
//         <code
//             className={cls('language-xml', p.className)}
//             style={{
//                 fontFamily: 'monospace',
//                 fontSize: '1rem',
//                 whiteSpace: 'pre-wrap',
//                 display: 'block',
//                 padding: '.5rem',
//             }}
//             ref={(e) => {
//                 if (e == null) return
//                 if (!(e instanceof HTMLElement)) return
//                 hljs.highlightElement(e)
//             }}
//         >
//             {p.code}
//         </code>
//     )
// }
