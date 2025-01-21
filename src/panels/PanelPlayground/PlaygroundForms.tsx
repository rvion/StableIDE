import { observer } from 'mobx-react-lite'

import { simpleFactory } from '../../csuite'
import { ErrorBoundaryUI } from '../../csuite/errors/ErrorBoundaryUI'
import { Frame } from '../../csuite/frame/Frame'

//

/** Freely modify this as you like, then pick the "Scratch Pad" option in the top left. Do not commit changes made to this. */
export const PlaygroundForms = observer(function PlaygroundImportFromComfy_(p: {}) {
   const field = simpleFactory.use((b) =>
      b
         .fields({
            a: b.percent({ suffix: '% of banana' }),
            b: b.string({}).useMixin((self) => ({
               UIWithFancyBorder: (): React.JSX.Element => (
                  <Frame //
                     border={30}
                     tw='p-2'
                     children={self.UI({ Shell: UY.Shell.HeaderOnly })}
                  />
               ),
               UIWithSuperFancyBorder: (): React.JSX.Element => (
                  <Frame border={30} tw='p-8' children={<self.UI Shell={UY.Shell.HeaderOnly} />} />
               ),
               UIWithSuperFancyBorder2: (p: { size: 'big' | 'small' }): React.JSX.Element => (
                  <Frame border={30} tw='p-8' children={<self.UI Shell={UY.Shell.HeaderOnly} />} />
               ),
            })),
            d: b.fields({
               d1: b.string(),
               d2: b.string(),
            }),
         })
         .useMixin((self) => {
            return {
               v1: (): React.JSX.Element => {
                  const { a, b } = field.fields
                  return (
                     <ErrorBoundaryUI>
                        <h3>play with forms</h3>
                        <Frame border={20} tw='m-8'>
                           <Frame base={10}>
                              {field.type}({field.id})
                           </Frame>
                           <Frame base={{ hueShift: 100 }}>
                              <div>
                                 <b.UIWithFancyBorder />
                                 <b.UIWithSuperFancyBorder />
                              </div>
                           </Frame>
                           <Frame base={{ hueShift: 200 }}>
                              {b.type}({b.id})<div>{a.UI({ Shell: 'HeaderOnly' })}</div>
                              <div>{b.UIWithFancyBorder()}</div>
                           </Frame>
                        </Frame>
                     </ErrorBoundaryUI>
                  )
               },
            }
         }),
   )
   return (
      <>
         {/*  */}
         {field.UI()}
         {field.v1()}
      </>
   )
})
