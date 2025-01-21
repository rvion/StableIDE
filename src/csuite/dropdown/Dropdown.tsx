import type { IconName } from '../icons/icons'
import type { Tint } from '../kolor/Tint'
import type { ReactNode } from 'react'

import { Button } from '../button/Button'
import { Frame } from '../frame/Frame'
import { RevealUI } from '../reveal/RevealUI'
import { MenuDivider } from './MenuDivider'
import { MenuItem } from './MenuItem'
import { observerWC } from './observerWC'

export type DropdownProps = {
   title: ReactNode
   className?: string
   startIcon?: Maybe<IconName>
   theme?: Tint
   content?: () => ReactNode
   button?: ReactNode
   expand?: boolean
   debugName?: string
}

/**
 * dropdown are just a pre-configured Reveal with a bunch of associated components that make it easy
 * to build menus
 * see modules like `src/appbar/MenuDebugUI.tsx`
 */
export const Dropdown = observerWC(
   function Dropdown_(p: DropdownProps): React.JSX.Element {
      return (
         <RevealUI
            tw={[p.className]}
            hideTriggers={{ shellClick: true, backdropClick: true, escapeKey: true }}
            content={() => <Frame tabIndex={0} tw='z-[1] flex flex-col' children={p.content?.()} />}
            debugName={p.debugName}
            children={
               p.button ?? (
                  <Button
                     borderless
                     subtle
                     icon={p.startIcon}
                     tabIndex={0}
                     expand={p.expand}
                     children={p.title}
                  />
               )
            }
         />
      )
   },
   {
      Divider: MenuDivider,
      Item: MenuItem,
   },
)
