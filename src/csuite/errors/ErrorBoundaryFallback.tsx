import { Button } from '../button/Button'
import { JsonViewUI } from '../json/JsonViewUI'

export const ErrorBoundaryFallback = (p: {
   // 🔴 pretty unsafe
   error: any
   resetErrorBoundary: (...args: any[]) => void
}): React.JSX.Element => {
   return (
      <div role='alert'>
         <p tw='flex items-center gap-2'>
            <Button //
               icon='mdiRefresh'
               onClick={() => p.resetErrorBoundary()}
               // size='sm'
               look='error'
               square
            />
            Something went wrong:
         </p>
         <pre style={{ color: 'red' }}>{p.error?.message}</pre>

         {p.error.extraJSON && <JsonViewUI value={p.error.extraJSON}></JsonViewUI>}
         {p.error?.stack && typeof p.error.stack === 'string' && (
            <pre tw='text-sm'>
               {p.error.stack.split('\n').map((line: string, i: number) => (
                  <div key={i}>{line}</div>
               ))}
            </pre>
         )}
      </div>
   )
}
