import type { ButtonProps } from '../button/Button'
import type { InputStringProps } from '../input-string/InputStringUI'

import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import { Button } from '../button/Button'
import { InputStringUI } from '../input-string/InputStringUI'
import { RevealUI } from '../reveal/RevealUI'

export type ButtonStringProps = {
   setValue: InputStringProps['setValue']
   getValue: InputStringProps['getValue']
} & ButtonProps

export const ButtonStringUI = observer(function WidgetStringUI_({
   getValue,
   setValue,
   onKeyDown,
   ref,
   ...rest
}: ButtonStringProps) {
   const prev = useMemo(() => getValue(), [])
   return (
      <RevealUI
         trigger={['doubleClick', 'rightClick']}
         placement='above-no-max-size'
         content={(p) => (
            <InputStringUI //
               autoFocus
               onKeyDown={(ev) => {
                  if (onKeyDown) {
                     onKeyDown(ev)
                  }
                  if (ev.key === 'Escape') {
                     ev.preventDefault()
                     ev.stopPropagation()
                     setValue(prev)
                     p.reveal.close()
                  }
                  if (ev.key === 'Enter') {
                     ev.preventDefault()
                     ev.stopPropagation()
                     p.reveal.close()
                  }
               }}
               setValue={setValue}
               getValue={getValue}
            />
         )}
      >
         <Button //
            ref={ref}
            {...rest}
         ></Button>
      </RevealUI>
   )
})

/*
Type '(ev: FocusEvent<HTMLInputElement, Element>) => void' is not assignable
type '(ev: FocusEvent<HTMLDivElement, Element>) => void'.

*/
