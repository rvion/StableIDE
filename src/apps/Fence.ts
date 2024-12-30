/** check if our frontend/backend only import correct things */

import type { Summary } from './MiniLogger'

export type FencesDefinition = { pattern: RegExp }

export type ModuleStatus = {
   module: string
   status: string
}

export type fenceResult = FencesStatus & {
   summary: Summary
}

export type FencesStatus = {
   /** entrypoint name */
   title: string

   /** final status */
   isValid: boolean

   //
   errors: ModuleStatus[]
   warnings: ModuleStatus[]
   valids: ModuleStatus[]

   /** we want to be force to acknoledge those removals */
   unusedRules: string[]
}

export const fence = (path: string): FencesDefinition => {
   return { pattern: new RegExp(`^${path}($|/.+)`) }
}

export const fenceParentNodeModule = (path: string): FencesDefinition => {
   return { pattern: /^(\.\.\/)*node_modules\/${path}($|\/.+)/ }
}

export const fenceCSS = (relativePath: string): FencesDefinition => {
   return { pattern: new RegExp(`^(?:temp_)?stylePlugin:.*${relativePath}$`) }
}
