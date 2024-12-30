import type { fenceResult, FencesDefinition, FencesStatus, ModuleStatus } from './Fence'
import type { Metafile } from 'esbuild'

import chalk from 'chalk'

import { Summary } from './MiniLogger'

export class EntrypointDependencyGraph {
   // importsByFrom: Map<string, {from: string, to:string}> = new Map()
   // importsByTo: Map<string, {from: string, to:string}> = new Map()
   importedBy = new Map<string, string>()

   constructor(
      public title: string,
      public metafile: Metafile,
      public opts: { considerUnusedRuleAsError: boolean },
   ) {
      for (const [from, moduleInfo] of Object.entries(metafile.inputs)) {
         for (const imprt of moduleInfo.imports) {
            const to = imprt.path // WE WANT TO KEEP EXTERNAL IMPORTS
            // it's ok if we override, we just want to have at least one path to explain why it's here
            this.importedBy.set(to, from)
            // this.importsByFrom.set(from, { from, to })
            // this.importsByTo.set(to, {from, to})
         }
      }
   }

   /** return a specific path leading to why this module is imported */
   explainWhy = (path: string): string[] => {
      const ancestors: string[] = []
      let current = path
      while (this.importedBy.has(current)) {
         if (ancestors.includes(current)) return ancestors
         ancestors.push(current)
         current = this.importedBy.get(current)!
      }
      return ancestors
   }

   get inputs(): string[] {
      return Object.keys(this.metafile.inputs)
   }

   validate(rules: FencesDefinition[]): fenceResult {
      const inputs = this.inputs
      const errors: ModuleStatus[] = []
      const warnings: ModuleStatus[] = []
      const valids: ModuleStatus[] = []
      const rulesMatched: Set<FencesDefinition> = new Set()

      for (const input of inputs) {
         let matchedAtLeastOnePattern = false
         let isValid = false
         for (const rule of rules) {
            if (rule.pattern.test(input)) {
               rulesMatched.add(rule)
               matchedAtLeastOnePattern = true
               isValid = true
               break
            }
         }
         // if (!matchedAtLeastOnePattern) {
         //    warnings.push({ module: input, status: 'not matched' })
         // } else
         if (!isValid) {
            errors.push({
               module: input,
               status:
                  'not matched, but imported by \n       => ' +
                  this.explainWhy(input).reverse().join('\n       -> '),
            })
         } else {
            valids.push({ module: input, status: 'matched by' })
         }
      }

      const unusedRules = rules.filter((r) => !rulesMatched.has(r)).map((rg) => rg.pattern.toString())
      let isValid = errors.length === 0 && warnings.length === 0
      if (this.opts.considerUnusedRuleAsError) isValid = isValid && unusedRules.length === 0
      const finalStatus: FencesStatus = {
         title: this.title,
         isValid,
         errors,
         warnings,
         valids,
         unusedRules,
      }
      const result: fenceResult = {
         ...finalStatus,
         summary: this.buildFencesStatusSummary(finalStatus),
      }
      this.printFencesStatus(result)
      return result
   }

   /** print result in some human-readable way */
   printFencesStatus(result: fenceResult): void {
      result.summary.print()
   }

   buildFencesStatusSummary({
      isValid,
      errors,
      warnings,
      title,
      valids,
      unusedRules,
   }: FencesStatus): Summary {
      const summary = new Summary()
      if (!isValid) {
         summary.error(
            `\n🔴 ${title} fences check failed (❌${errors.length}, 🔶:${warnings.length}, 🟢:${valids.length}, 👀:${unusedRules.length}):`,
         )

         for (const error of errors.slice(0, 10)) {
            summary.error(`  - ❌ ${error.module}`)
            summary.log(`       | ${error.status}`)
         }
         if (errors.length > 10) summary.error(`  - ❌ ... (+${errors.length - 10})`)

         for (const warning of warnings.slice(0, 10)) {
            summary.warn(`  - 🔶 ${warning.module}`)
            summary.log(`       | ${warning.status}`)
         }
         if (warnings.length > 10) summary.warn(`  - 🔶 ... (+${warnings.length - 10})`)

         // for (const valid of valids.slice(0, 10)) {
         //    add.info(`  - 🟢 ${valid.module}`)
         //    add.log(`       | ${valid.status}`)
         // }
         // if (valids.length > 10) add.info(`  - 🟢 ... (+${valids.length - 10})`)

         if (this.opts.considerUnusedRuleAsError) {
            for (const unusedRule of unusedRules.slice(0, 10)) {
               summary.info(`  - 👀 ${unusedRule}`)
            }
         }
      } else {
         summary.log(`✔️ Fences Ok in ${chalk.blueBright(title)}`)
      }
      return summary
   }

   private getMeaningfulPrefix(x: string): string {
      if (x.startsWith('loco-raw-loader-of-the-utlimate-success:src'))
         return 'loco-raw-loader-of-the-utlimate-success:src'
      const parts = x.split('/')
      if (parts[0] === 'src') return parts.slice(0, 2).join('/')
      if (parts[0] === 'node_modules') {
         if (parts[1]?.startsWith('@')) return parts.slice(0, 3).join('/')
         return parts.slice(0, 2).join('/')
      }
      return x
   }

   BUILD_THEORICAL_CONFIG(): string {
      const inputs = this.inputs
      const seen = new Set<string>()
      const out = []

      for (const x of inputs) {
         const meaningfulID = this.getMeaningfulPrefix(x)
         if (meaningfulID.startsWith('stylePlugin:')) continue

         const toAdd = meaningfulID.startsWith('temp_stylePlugin:')
            ? `   fenceCSS(${JSON.stringify(meaningfulID.replace(/^temp_stylePlugin:/, ''))}),`
            : `   fence(${JSON.stringify(meaningfulID)}),`

         if (seen.has(toAdd)) continue
         seen.add(toAdd)
         out.push(toAdd.padEnd(76) + ` // ${this.explainWhy(x).toReversed().join(' ~> ')}`)
      }
      return `validate([\n${out.sort().join('\n')}\n])`
   }

   EXPLAIN_WHY_INPUTS_HAVE_BEEN_INCLUDED(p: { log: 'inline' | 'multiline' | false }): string {
      const inputs = this.inputs
      const OUT: { [key: string]: string[] } = {}
      for (const x of inputs) {
         const meaningfulID = this.getMeaningfulPrefix(x)
         if (meaningfulID in OUT) continue

         const why = this.explainWhy(x)
         if (p.log === 'inline') {
            console.log(`[🟢${meaningfulID}] 👉`, why.join(' 👉 '))
         } else if (p.log === 'multiline') {
            console.log(`\n👉 ${meaningfulID}:`)
            for (const w of why) console.log(`  -> ${w}`)
         }
         OUT[meaningfulID] = why
      }

      return JSON.stringify(OUT, null, 3)
   }

   // printIdealConfig(): void {
   //    const inputs = this.inputs
   //    const OUT: { [key: string]: string[] } = {}
   //    for (const x of inputs) {
   //       const meaningfulID = this.getMeaningfulPrefix(x)
   //       if (meaningfulID in OUT) continue
   //       const why = this.explainWhy(x)
   //       if (p.shouldExplainInline) {
   //          console.log(`[🟢${meaningfulID}] 👉`, why.join(' 👉 '))
   //       } else {
   //          console.log(`\n👉 ${meaningfulID}:`)
   //          for (const w of why) console.log(`  -> ${w}`)
   //       }
   //       OUT[meaningfulID] = why
   //    }
   //    return JSON.stringify(OUT, null, 3)
   // }
}
