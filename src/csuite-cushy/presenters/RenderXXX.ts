import type { Presenter } from './Renderer'
import type { DisplaySlots } from './RenderSlots'
import type { DisplaySlotsExt, FieldUIConf } from './RenderTypes'

import { computed, makeObservable } from 'mobx'

import { Field } from '../../csuite/model/Field'
import { FieldSelector } from '../../csuite/selector/selector'
import { renderPresets } from './RenderPresets'

export const RENDER_PRIORITY_DEFAULT_RULES = 10
export const RENDER_PRIORITY_UIUI = 20
export const RENDER_PRIORITY_ON_SET = 50
export const RENDER_PRIORITY_FINAL = 120

export type RuleEntry = {
   addedBy: Field | null
   selector: FieldSelector | true
   uiconf: DisplaySlotsExt<Field>
   priority: number
}
export type SelfEntry<FIELD extends Field> = {
   priority: number
   slots: DisplaySlots<FIELD>
}

type CompiledFieldConf<FIELD extends Field> = {
   rulesForSubtree: RuleEntry[]
   selfSlotOverrides: SelfEntry<FIELD>[]
}

const emptyArray = Object.freeze([]) as any

export class RenderXXX<FIELD extends Field> {
   private forSelf: { priority: number; slots: DisplaySlots<FIELD> }[] = []
   private forOthers: RuleEntry[] = []

   get final(): CompiledFieldConf<FIELD> {
      if (this.field.config.ui == null)
         return {
            rulesForSubtree: emptyArray,
            selfSlotOverrides: emptyArray,
         }
      //  reset stack and rules
      this.forSelf.splice(0, this.forSelf.length)
      this.forOthers.splice(0, this.forOthers.length)
      this.evalRule(this.field.config.ui, RENDER_PRIORITY_UIUI)
      return { rulesForSubtree: this.forOthers, selfSlotOverrides: this.forSelf }
   }

   constructor(
      //
      public presenter: Presenter,
      public field: FIELD,
   ) {
      makeObservable(this, { final: computed })
   }

   run = 0
   //    eval(finalRuleOrConf: DisplaySlots<FIELD>): void {
   //       // parenet rules
   //       for (const rule of this.presenter.rules) {
   //          if (rule.addedBy !== null && !this.field.path.startsWith(rule.addedBy.path)) continue
   //          const isMatching = isBool(rule.selector) ? rule.selector : this.field.matches(rule.selector)
   //          if (isMatching) this.evalRule(rule.uiconf as DisplaySlotExt<FIELD>, rule.priority)
   //       }
   //       // final rule
   //       this.evalRule(finalRuleOrConf, RENDER_PRIORITY_FINAL)

   //       this.run++
   //    }

   /** render SHOULD ONLY (!!) eval rules for current (FIELD) */
   evalRule = (
      //
      ruleOrConf: FieldUIConf<FIELD>,
      priority: number,
   ): void => {
      if (typeof ruleOrConf === 'function') {
         const slots = ruleOrConf({
            presets: renderPresets,
            set: this.registerRule.bind(this),
            field: this.field,
         }) // as Maybe<DisplaySlots<FIELD>>
         if (slots) this.forSelf.push({ priority, slots }) //slots = mergeDefined(slots, _slots)
      } else {
         const slots = ruleOrConf
         if (slots && Object.keys(slots).length > 0) {
            this.forSelf.push({ priority, slots: slots })
         }
      }
   }

   /**
    * a field can add rules for any of it's children, not only itself.
    * that where the magic happen; since fields know the extra type of their children,
    * any field can quickly add a bunch of rule for all of it's descendants.
    */
   registerRule(/* A */ x: DisplaySlots<FIELD>, priority?: number): void
   registerRule(/* B */ selector: string, x: DisplaySlotsExt<Field>, priority?: number): void
   registerRule(/* C */ selector: FieldSelector, x: DisplaySlotsExt<Field>, priority?: number): void
   registerRule</* D */ Sub extends Field>(field: Maybe<Sub>, x: DisplaySlotsExt<Sub>, priority?: number): void // prettier-ignore
   registerRule<SUB extends Field>(
      x: unknown,
      y?: unknown,
      z?: unknown,
      // sub: Maybe<SUB>,
      // ruleOrConf: RuleOrConf<SUB>,
   ): void {
      // #region A
      if (y === undefined || typeof y === 'number') {
         const priority = (y as Maybe<number>) ?? RENDER_PRIORITY_ON_SET
         this.evalRule(x as DisplaySlots<FIELD>, priority)
         return
      }

      // #region B
      if (typeof x === 'string') {
         const selectorStr = x as string
         const selector = FieldSelector.from(selectorStr)
         const ruleOrConf = y as DisplaySlotsExt<Field>
         const priority = (z as Maybe<number>) ?? RENDER_PRIORITY_ON_SET
         this.forOthers.push({ selector, addedBy: this.field, uiconf: ruleOrConf, priority })
         return
      }

      // #region C
      if (x instanceof FieldSelector) {
         const ruleOrConf = y as DisplaySlotsExt<Field>
         const priority = (z as Maybe<number>) ?? RENDER_PRIORITY_ON_SET
         this.forOthers.push({ selector: x, addedBy: this.field, uiconf: ruleOrConf, priority })
         return
      }

      // #region D
      if (x instanceof Field) {
         const ruleOrConf = y as DisplaySlotsExt<SUB>
         const priority = (z as Maybe<number>) ?? RENDER_PRIORITY_ON_SET
         if (x === this.field) {
            this.evalRule(ruleOrConf as DisplaySlotsExt<FIELD>, priority)
            return
         }
         const sub = x as SUB
         const selector = FieldSelector.from(sub.path)
         this.forOthers.push({ selector, addedBy: this.field, uiconf: ruleOrConf, priority })
      }
   }
}

function isBool(x: unknown): x is boolean {
   return typeof x === 'boolean'
}
