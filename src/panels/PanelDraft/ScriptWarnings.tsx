import type { LibraryFile } from '../../cards/LibraryFile'

import { observer } from 'mobx-react-lite'

import { objectEntries } from '../../csuite/utils/getEntries.utils'

export const ScriptWarningsUI = observer(function ScriptWarningsUI_({
   file,
   ...rest
}: {
   file: LibraryFile
}) {
   const warningEntries = objectEntries(file.strategyStatus)
   return (
      <div tw='_MD'>
         {/* warnings */}
         {warningEntries.length ? (
            <UY.Message.Error title='Loading Strategies'>
               <ul {...rest}>
                  {warningEntries.map(([k, v]) => (
                     <li key={k}>
                        {k}: {JSON.stringify(v)}
                     </li>
                  ))}
               </ul>
            </UY.Message.Error>
         ) : null}
         {/* errors */}
         {file.errors.length > 0 ? (
            <UY.Message.Error title='Script Errors'>
               <ul>
                  {file.errors.map((v, i) => (
                     <li key={i}>
                        ❌ {v.title}
                        <br />
                        <pre>{v.body}</pre>{' '}
                     </li>
                  ))}
               </ul>
            </UY.Message.Error>
         ) : null}
      </div>
   )
})
