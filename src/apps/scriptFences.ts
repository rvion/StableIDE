import type { Metafile } from 'esbuild'

import { readFileSync } from 'fs'

import { EntrypointDependencyGraph } from './EntrypointDependencyGraph'
import { fence, fenceParentNodeModule, type fenceResult } from './Fence'

export function checkLibraryScriptFences(
   //
   extensionName: string,
   metafile: /** path */ string | Metafile,
   { log = false }: { log?: 'inline' | 'multiline' | false } = {},
): fenceResult {
   const shouldGenIdeal = process.argv.includes('--gen-ideal') ? true : false
   const metafileExtension: Metafile =
      typeof metafile == 'string' //
         ? JSON.parse(readFileSync(metafile, 'utf-8'))
         : metafile
   const extensionsDepGraph = new EntrypointDependencyGraph(`Script ${extensionName}`, metafileExtension, {
      considerUnusedRuleAsError: false,
   })

   /**
    * we want CI to explain why things have been included
    * so we can debug crappy stuff
    */
   // const backCurrent = extensionsDepGraph.EXPLAIN_WHY_INPUTS_HAVE_BEEN_INCLUDED({ log })
   // writeFileSync('./metafile.back.1.json', backCurrent)
   if (shouldGenIdeal) {
      // writeFileSync('./metafile.back.2.txt', extensionsDepGraph.BUILD_THEORICAL_CONFIG())
      console.log(`[🔶] Example set of matching rules have been generated in ./metafile.back.2.txt `)
   }

   // prettier-ignore
   const backCheck = extensionsDepGraph.validate([
      fence("library"),
      fence('src/csuite/utils'),
      fenceParentNodeModule("nanoid"),
      fenceParentNodeModule("date-fns"),
      fenceParentNodeModule("date-fns-tz"),
      fenceParentNodeModule("react"),
      fenceParentNodeModule("react-dom"),
      fenceParentNodeModule("mobx"),
      fenceParentNodeModule("mobx-react-lite"),
      fenceParentNodeModule("@js-temporal/polyfill"),

   ])
   extensionsDepGraph.printFencesStatus(backCheck)
   return backCheck
}
