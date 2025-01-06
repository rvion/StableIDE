import type { Field } from '../../csuite/model/Field'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { presenterCtx, usePresenterOrNull } from './RenderCtx'
import { renderDefaultKey } from './RenderDefaultsKey'
import { Presenter } from './Renderer'

export const RenderUI = observer(function RenderUI_({
   field,
   rule,
   ...p
}: { field: Field } & RENDERER.FieldRenderArgs<any>): ReactNode {
   const presenterOrNull = usePresenterOrNull()
   if (presenterOrNull == null) {
      const mobxHack = renderDefaultKey.version // do not remove this line; it allow to invalidate default rules during dev
      const presenter = new Presenter(field)
      return (
         <presenterCtx.Provider //
            value={presenter}
         >
            {presenter.render(field, rule, p)}
         </presenterCtx.Provider>
      )
   } else {
      return presenterOrNull.render(field, rule, p)
   }
})
