import 'react'

import type { WidgetsCatalog } from '../csuite-cushy/presenters/RenderCatalog'
import type { RenderRule } from '../csuite-cushy/presenters/RenderTypes'
import type { Field } from '../csuite/model/Field'
import type { PixiReactElementProps } from '@pixi/react/types/typedefs/PixiReactNode'
import type { Viewport } from 'pixi-viewport'

type ClassLike = import('../csuite/types/ClassLike').ClassLike

declare global {
   const app: import('../cards/App').GlobalFunctionToDefineAnApp
   const view: import('../cards/App').GlobalFunctionToDefineAView
   const getCurrentForm: import('../cards/App').GlobalGetCurrentForm
   const getCurrentRun: import('../cards/App').GlobalGetCurrentRun

   namespace JSX {
      interface IntrinsicAttributes {
         tw?: string | ClassLike[]
      }
      interface IntrinsicElements {
         viewport: PixiReactElementProps<typeof Viewport>
      }
   }
   /*
    defined on window, using observable cache + getter, to allow hot-reload
        | Object.defineProperty(window, 'CushyObservableCache' { value: observable({ st: this }) })
        | Object.defineProperty(window, 'cushy', { get() { return (window as any).st } }) // prettier-ignore
    */
   const cushy: import('../state/state').STATE
   const UY: WidgetsCatalog
   const defaultRenderRules: RenderRule<Field>
}

declare module 'react' {
   interface DOMAttributes<T> {
      tw?: string | ClassLike[]
   }
}

// -----------------
declare module '*.css' {}

// -----------------
// https://github.com/pmndrs/react-three-fiber/issues/2501#issuecomment-1250058445
// R3F XRFrame
type XRFrameImpl = XRFrame
type XRFrameRequestCallbackImpl = XRFrameRequestCallback

declare module 'three' {
   interface XRFrame extends XRFrameImpl {}
   type XRFrameRequestCallback = XRFrameRequestCallbackImpl
}

// HDRCubeTextureLoader.d.ts
