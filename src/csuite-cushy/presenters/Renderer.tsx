import type { Field } from '../../csuite/model/Field'
import type { DisplaySlots } from './RenderSlots'
import type { CompiledRenderProps, FieldUIConf } from './RenderTypes'
import type { ReactNode } from 'react'

import { createElement } from 'react'

import { extractComponentName } from '../../csuite/utils/extractComponentName'
import { mergeDefined } from '../../csuite/utils/mergeDefined'
import { _isFC, renderFCOrNode, renderFCOrNodeWithWrapper } from '../../csuite/utils/renderFCOrNode'
import { QuickForm } from '../catalog/group/QuickForm'
import { defaultRulesV2 } from './RenderDefaults'
import { RenderUI } from './RenderUI'
import { RenderXXX, type RuleEntry } from './RenderXXX'

// 👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
// Those types are made folling a language design principle:
// every field/config/override is based on what UX people may request
// so we have a quick vocabulary to ajdust look and feel.
// see src/csuite-cushy/presenters/presenter.readme.md
// 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆

// #region Presenter
// see `src/csuite/form/presenters/presenter.readme.md`
/**
 * retrieve * Shell + Slots for each field,
 * and convenient method to call the Wrapper bound to field and slots
 */
export class Presenter<DOC extends Field = Field> {
   static count = 0
   /** list of all the ruleOrConf, indexed by field, added during this presenter lifecycle  */
   // rules: RuleEntry[] = []

   constructor(
      //
      public rootField: Field,
   ) {
      Presenter.count++
      // const proc = new RenderXXX(this, rootField)
      // defaultRenderRules({ set:  })
      // this.rules.push({
      //    addedBy: null,
      //    selector: true,
      //    uiconf: defaultRenderRules,
      //    priority: RENDER_PRIORITY_DEFAULT_RULES,
      // })
   }

   fieldRenderers: WeakMap<Field, RenderXXX<any>> = new WeakMap()
   getFieldRenderer<FIELD extends Field>(field: FIELD): RenderXXX<FIELD> {
      let proc = this.fieldRenderers.get(field)
      if (proc == null) {
         proc = new RenderXXX(this, field)
         this.fieldRenderers.set(field, proc)
      }
      return proc
   }

   /** all fields in document */
   get allFields(): Field[] {
      const fields: Field[] = []
      this.rootField.traverseAllDepthFirst((field) => {
         fields.push(field)
      })
      return fields
   }

   get allFieldRenderers(): RenderXXX<Field>[] {
      return this.allFields.map((field) => this.getFieldRenderer(field))
   }

   get allRules(): RuleEntry[] {
      return this.allFieldRenderers
         .flatMap((proc) => proc.final.rulesForSubtree)
         .concat(defaultRulesV2)
         .sort((a, b) => a.priority - b.priority)
   }

   /**
    * MAIN METHOD TO RENDER A FIELD
    * this method is both for humans (calling render on field root)
    * and for fields rendering their childern
    */
   render<FIELD extends Field>(
      //
      field: FIELD,
      rule: FieldUIConf<FIELD> | undefined,
      extraSlots: DisplaySlots<FIELD>,
   ): ReactNode {
      console.log(`[🦊] rendering ${field.path}`, this.allRules.length)
      const debug =
         true || //
         field.path === '$' ||
         field.path === `$.ipAdapter.child` // '$.latent.b' // '$.positive'

      const rules: RuleEntry[] = [
         ...this.allRules,
         { addedBy: null, selector: true, uiconf: extraSlots, priority: 1000 },
      ]
      let slots: DisplaySlots<FIELD> = {}
      // // eval rule from config
      // if (field.config.uiui != null) xxx.evalRule(field.config.uiui, RENDER_PRIORITY_UIUI)
      for (const rule of rules) {
         // only attempt to apply rules defined by parents
         if (rule.addedBy !== null && !field.path.startsWith(rule.addedBy.path)) continue

         // starts from this, and ensures the result contains the field.
         // we probably want contains in many place.
         //                                                         VVVVVVVVVVVVVV
         const isMatching = isBool(rule.selector) ? rule.selector : field.matches(rule.selector)
         if (debug)
            console.log(
               `[🦊] ${field.pathExt}`,
               isMatching ? '🟢' : '🔴',
               isBool(rule.selector) ? rule.selector : rule.selector.selector,
               typeof rule.uiconf !== 'function' ? this.explainSlots(rule.uiconf) : '<function...>',
            )
         if (isMatching) {
            const newSlots =
               typeof rule.uiconf === 'function' //
                  ? (rule.uiconf({ field }) as DisplaySlots<FIELD>)
                  : (rule.uiconf as DisplaySlots<FIELD>)
            if (newSlots != null && Object.keys(newSlots).length > 0) {
               slots = mergeDefined(slots, newSlots)
            }
         }
      }

      // override `Body` if `chidlren` is specified
      const layout = slots.layout
      if (layout != null) {
         slots.Body = createElement(QuickForm, { field, items: layout(field) })
      }

      console.log(`[🔴🦊SHELL]`, slots.Shell)
      const Shell =
         typeof slots.Shell === 'string' //
            ? UY.Shell[slots.Shell]
            : (slots.Shell ?? UY.Shell.Default)

      // console.log(`[🤠] slots.ShellName`, slots.ShellName, field.path, Shell === catalog.Shell.Inline)
      if (!Shell) throw new Error('Shell is not defined')

      // COMPILED
      const finalProps: CompiledRenderProps<FIELD> = {
         field,
         UI: UY,
         presenter: this,
         ...slots,
      }

      if (debug) this.debugFinalProps(finalProps)
      // if (field.path === '$.latent.b.image.resize') this.debugFinalProps(finalProps)
      // console.log(`[🤠] Shell for ${field.path} is `, Shell)
      console.log(`[🦊] slots for`, field.path, slots)
      return renderFCOrNode(Shell, finalProps)
   }

   debugFinalProps(finalProps: CompiledRenderProps<any>): void {
      console.log(`[🤠] `, finalProps.field.path, this.explainSlots(finalProps))
   }

   private explainSlots(slots: DisplaySlots<any>): Record<string, any> {
      return Object.fromEntries(
         Object.entries(slots).map(([k, v]) => [
            k,
            _isFC(v) && 'type' in v ? (extractComponentName(v.type) ?? v) : v,
         ]),
      )
   }

   utils = {
      renderFCOrNode: renderFCOrNode,
      renderFCOrNodeWithWrapper: renderFCOrNodeWithWrapper,
   }
}

// #region 'window' mixin
// Renderer is injected, to help with using csuite in other codebases.
window.RENDERER = {
   Render: RenderUI,
}

function isBool(x: unknown): x is boolean {
   return typeof x === 'boolean'
}
