/**
 * this module implement the core system to allow cushy scripts to include external modules
 * without really importing them
 */

import type { any_TsEfficient } from '../csuite/utils/objectAssignTsEfficient'
import type ESBUILD from 'esbuild'
import type { BuildContext } from 'esbuild'

// EXTERNAL MODULES we'll inject ------------------------------------------------
import * as drei from '@react-three/drei'
import * as fiber from '@react-three/fiber'
import * as fs from 'fs'
import * as mobx from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import * as path from 'pathe'
import __react, { Fragment } from 'react'
import * as three from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import { jsx, jsxs } from '../csuite/custom-jsx/jsx-runtime'

// REWRITE LOGIC ------------------------------------------------------------------------
export const CUSHY_IMPORT = (mod: string): any_TsEfficient => {
   // initial externals allowed
   if (mod === 'react') return __react
   if (mod === 'mobx') return mobx
   if (mod === 'fs') return fs
   if (mod === 'mobx-react-lite') return { observer: observer, useLocalObservable }
   if (mod === 'react/jsx-runtime') return { jsx, jsxs, Fragment }
   //  added on 2024-03-25
   if (mod === '@react-three/drei') return drei
   if (mod === '@react-three/fiber') return fiber
   if (mod === 'three') return three
   if (mod === 'three/examples/jsm/loaders/MTLLoader.js') return { MTLLoader }
   if (mod === 'three/examples/jsm/loaders/OBJLoader.js') return { OBJLoader }
   if (mod === 'three/examples/jsm/loaders/MTLLoader') return { MTLLoader }
   if (mod === 'three/examples/jsm/loaders/OBJLoader') return { OBJLoader }
   //
   throw new Error('🔴 unsupported import: ' + mod)
}

export async function createEsbuildContextFor(p: {
   entrypoints: AbsolutePath[]
   root: AbsolutePath
}): Promise<BuildContext<any>> {
   const esbuild = window.require('esbuild') as typeof ESBUILD
   const distFolder = path.join(p.root, 'dist')

   return esbuild.context({
      entryPoints: p.entrypoints,
      outbase: p.root,
      bundle: true,
      format: 'esm',
      banner: { js: '// 🛋️ CushyStudio\n' + p.entrypoints.map((e) => `//   - ${e}`) },
      jsx: 'transform',
      jsxSideEffects: false,
      target: ['deno1'],
      loader: {
         '.png': 'dataurl',
         '.jpg': 'dataurl',
         '.svg': 'dataurl',
      },
      outdir: distFolder,
      external: [
         // initial externals allowed
         'react',
         'mobx',
         'mobx-react-lite',
         'fs',
         //  2024-03-25
         'three',
         '@react-three/drei',
         '@react-three/fiber',
         'three',
         'three/examples/jsm/loaders/MTLLoader.js',
         'three/examples/jsm/loaders/OBJLoader.js',
         // Regex to exclude all imports that are not relative or absolute paths
         'stream',
      ],

      // ----------------------
      write: false,
      metafile: true,
      // ----------------------
      // loader: { '.png': 'dataurl' },
      // outfile: path.join(fileFolder, basenameWithoutExt + '.cushyapp.js'), // Output file path
      // write: false,
      // plugins: [restrictFolderPlugin],
   })
}

// export async function compileTSFile(pkg: Package) {
//     const esbuild = window.require('esbuild') as typeof import('esbuild')
//     const distFolder = path.join(pkg.folderAbs, 'dist')

//     return esbuild.context({
//         entryPoints: pkg.esbuildEntrypoints,
//         outbase: pkg.folderAbs,
//         bundle: true,
//         format: 'esm',
//         banner: { js: CushyTextBanner },
//         jsx: 'transform',
//         jsxSideEffects: false,
//         target: ['node20'],
//         loader: { '.png': 'empty' },
//         outdir: distFolder,
//         external: ['react', 'mobx', 'mobx-react-lite'],
//         // metafile: true,
//         // loader: { '.png': 'dataurl' },
//         // outfile: path.join(fileFolder, basenameWithoutExt + '.cushyapp.js'), // Output file path
//         // write: false,
//         // plugins: [restrictFolderPlugin],
//     })
// }

/**
 Example usage:

```
const code = `import React, { useState as useHookState, useEffect } from 'react';
import { observer as observer2 } from "mobx-react-lite";
import { jsx, jsxs } from "react/jsx-runtime";`
console.log(replaceImportsWithSyncImport(code))
```
*/
export function replaceImportsWithSyncImport(code: string): string {
   const importStructures = _parseImportStatements(code)
   // ⏸️ console.log(`[🤠] replaceImportsWithSyncImport:`)
   // ⏸️ console.log(`[🤠] BFOR`, { code })
   // /* ⏸️ */ console.log(`[🤠] ....`, importStructures)
   let modifiedCode = code

   importStructures.forEach((importStructure) => {
      // console.log(`[🤠] replacing "${importStructure.stringToReplace}"`)
      // const originalImportRegex = new RegExp(`import\\s+.*?from\\s+['"]${importStructure.moduleName}['"];?`)
      const replacement = _generateSyncImportReplacement(importStructure)
      modifiedCode = modifiedCode.replace(
         importStructure.stringToReplace /* originalImportRegex */,
         replacement,
      )
   })

   // /* ⏸️  */ console.log(`[🤠] AFTR`, modifiedCode)
   return modifiedCode
}

// --------------------------------------------------------------------

export type ImportStructure = {
   moduleName: string
   defaultImport?: string
   namedImports: { [key: string]: string }
   stringToReplace: string
}

export function _parseImportStatements(code: string): ImportStructure[] {
   // const oldRegex = /import\s+            (?:(\w+), \s*)?   \{\s*([^}]+)\s*\}  \s+from\s+["'](.+?)["'];?/g
   //                            VVVVVVVVVVVV         V     VVV                 VV  V
   const importRegex = /import\s+(?:\* as\s)?(?:(\w+),?\s*)?(?:\{\s*([^}]+)\s*\})?\s*from\s+["'](.+?)["'];?/g
   const result: ImportStructure[] = []

   let match: RegExpExecArray | null
   while ((match = importRegex.exec(code)) !== null) {
      const [stringToReplace, defaultImport, namedImportsPart, moduleName] = match

      const namedImports: { [key: string]: string } = {}
      namedImportsPart?.split(',').forEach((namedImport) => {
         const parts = namedImport.trim().split(/\s+as\s+/)
         const parts0 = parts[0]!
         namedImports[parts0] = parts[1] || parts0
      })

      result.push({ moduleName: moduleName!, defaultImport, namedImports, stringToReplace })
   }

   return result
}

function _generateSyncImportReplacement(importStructure: ImportStructure): string {
   const { moduleName, defaultImport, namedImports } = importStructure

   const importParts: string[] = []
   if (defaultImport) {
      importParts.push(defaultImport)
   }

   const namedImportParts = Object.entries(namedImports).map(([original, renamed]) => {
      return original === renamed ? original : `${original}: ${renamed}`
   })

   if (namedImportParts.length > 0) {
      importParts.push(`{ ${namedImportParts.join(', ')} }`)
   }

   return `const ${importParts.join(', ')} = CUSHY_IMPORT("${moduleName}");`
}
