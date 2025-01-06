import type { CompiledRenderProps } from '../presenters/RenderTypes'

import { observer } from 'mobx-react-lite'

// BODY ONLY

export const ShellBodyOnlyUI = observer(function ShellBodyOnlyUI(p: CompiledRenderProps) {
   const field = p.field
   const utils = p.presenter.utils
   return utils.renderFCOrNodeWithWrapper(p.Header, p, p.ContainerForHeader, {
      className: p.classNameAroundBodyAndHeader ?? undefined,
      field,
   })
})
