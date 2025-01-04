import type { RevealPlacement } from '../reveal/RevealPlacement'

import { makeAutoObservable, observable } from 'mobx'

export type TooltipInst = {
   depth: number
   ref: Element
   text: string | React.ReactNode
   placement: RevealPlacement
}

class TooltipManager {
   tooltips = new Map<number, TooltipInst>()

   constructor() {
      makeAutoObservable(this, { tooltips: observable.shallow })
   }

   get deepest(): Maybe<TooltipInst> {
      const maxDepth = Math.max(...this.tooltips.keys())
      return this.tooltips.get(maxDepth)
   }
}

export const tooltipStuff: TooltipManager = new TooltipManager()
