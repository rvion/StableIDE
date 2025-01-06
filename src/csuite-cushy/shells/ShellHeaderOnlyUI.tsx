import type { CompiledRenderProps } from '../presenters/RenderTypes'

import { observer } from 'mobx-react-lite'

// HEADER ONLY

export const ShellHeaderOnlyUI = observer(function ShellHeaderOnlyUI(p: CompiledRenderProps) {
   const field = p.field
   const utils = p.presenter.utils
   return <>FUCK{utils.renderFCOrNode(p.Header, p)}</>
   return utils.renderFCOrNodeWithWrapper(p.Header, p, p.ContainerForHeader, {
      className: p.classNameAroundBodyAndHeader ?? undefined,
      field,
   })
})
