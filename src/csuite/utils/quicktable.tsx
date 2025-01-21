import { observer } from 'mobx-react-lite'
import { isValidElement } from 'react'

import { Frame } from '../frame/Frame'

export const QuickTableUI = observer(function QuickTable({
   // own props
   rows,
   dense,

   // top-level 'table' patches
   ...rest
}: {
   rows: unknown[]
   dense?: boolean
} & React.HTMLAttributes<HTMLTableElement>) {
   if (rows.length === 0) return null
   const firstRow = rows[0]!
   const keys = Object.keys(firstRow)

   return (
      <table
         {...rest}
         tw={[
            //
            '[&_th]:text-left',
            dense === true ? '[&_th]:px-2' : '[&_th]:p-2',
            dense === true ? '[&_td]:px-2' : '[&_td]:p-2',
         ]}
      >
         <Frame as='thead' base={10}>
            <tr>
               {keys.map((key) => (
                  <th key={key}>{key}</th>
               ))}
            </tr>
         </Frame>
         <tbody>
            {rows.map((row: any, ix) => {
               return (
                  <Frame as='tr' key={ix} base={ix % 2 === 0 ? 5 : 0}>
                     {keys.map((key) => (
                        <td key={key}>{formatCell(row[key])}</td>
                     ))}
                  </Frame>
               )
            })}
         </tbody>
      </table>
   )
})

function formatCell(x: unknown): string | React.JSX.Element {
   if (typeof x === 'string') return x
   if (typeof x === 'number') return x.toString()
   if (isValidElement(x)) return x
   return typeof x
}
