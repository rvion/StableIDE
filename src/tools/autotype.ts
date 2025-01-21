// TODO: re-enable var decls for exported stuffs
// TODO: use React.FC instead of FunctionComponent
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

import { bang } from '../csuite/utils/bang'

const summaryLines: string[] = []
const globalTypes = new Set(['string', 'number', 'boolean', 'void', 'undefined', 'null', 'any', 'Promise'])
const globallyInjectedSymbols = new Set(['Maybe', 'Z'])

async function addTypes(
   //
   fileNames: string[],
   compilerOptions: ts.CompilerOptions,
): Promise<void> {
   LOG_INFO(`Starting to process ${fileNames.length} files...`)

   const program = ts.createProgram(fileNames, compilerOptions)
   const checker = program.getTypeChecker()

   let processed: number = 0
   for (const fileName of fileNames) {
      const typeContext: TypeContext = { ext: path.extname(fileName) as '.ts' | '.tsx' }
      processed++
      // if (processed % 10 === 0) {
      //    await waitForInput('Press Enter to continue...')
      // }
      LOG_INFO(`\nProcessing file: ${fileName}`)
      const sourceFile = program.getSourceFile(fileName)

      if (!sourceFile) {
         LOG_ERR(`  Skipped file: ${fileName} (not found in program)`)
         continue
      }

      const changes: { pos: number; text: string }[] = []
      // TODO make map with built-in entries (name => module) so we can whitelist a few stuff, like _E or _L
      const importStatements: Map<string, string> = new Map()

      // eslint-disable-next-line no-inner-declarations
      function visit(node: ts.Node): void {
         // #region 1. VarDecl
         if (ts.isVariableDeclaration(node) && !node.type) {
            // Check if the VariableDeclaration is part of a ForOfStatement or ForInStatement
            if (
               node.parent &&
               ts.isVariableDeclarationList(node.parent) &&
               node.parent.parent &&
               (ts.isForOfStatement(node.parent.parent) || ts.isForInStatement(node.parent.parent))
            ) {
               const loopType = ts.isForOfStatement(node.parent.parent) ? 'for...of' : 'for...in'
               LOG_DEBUG(`  Skipped type annotation in ${loopType} for ${node.name.getText()} in ${fileName}`) // prettier-ignore
               return
            }

            const symbol = checker.getSymbolAtLocation(node.name)
            if (symbol) {
               const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)

               // Handle arrow functions assigned to variables
               if (node.initializer && ts.isArrowFunction(node.initializer) && !node.initializer.type) {
                  const signature = checker.getSignatureFromDeclaration(node.initializer)
                  if (signature) {
                     const returnType = checker.getReturnTypeOfSignature(signature)
                     const [returnTypeString, action] = renderType(checker, returnType, typeContext)
                     if (action === 'skip') return LOG_WARN(`  [skip] type ${chalk.underline(returnTypeString)} for ${node.name.getText()} in ${fileName}`) // prettier-ignore

                     // Check for 'any' or Anonymous Class in return type
                     if (returnTypeString.includes('any') || isAnonymousClass(returnTypeString)) {
                        const reason = returnTypeString.includes('any') ? `'any'` : 'Anonymous class'
                        LOG_ERR(`  Skipped adding ${reason} return type for arrow function assigned to ${node.name.getText()} in ${fileName}`) // prettier-ignore
                     } else if (
                        returnTypeString.split(/\s+/).length <= 4 &&
                        !returnTypeString.includes('any')
                     ) {
                        LOG_OK(`  Adding return type to arrow function assigned to ${node.name.getText()}: ${returnTypeString}`) // prettier-ignore
                        const arrowFunc = node.initializer

                        const pos = getFunctionReturnTypeInsertPos(arrowFunc)
                        if (pos !== undefined) {
                           changes.push({ pos: pos, text: `: ${returnTypeString}` })
                        } else {
                           LOG_ERR( `  Failed to determine where to insert return type for arrow function assigned to ${node.name.getText()} in ${fileName}`) // prettier-ignore
                           return
                        }
                        gatherImports(returnTypeString, importStatements)
                     } else {
                        LOG_WARN(`  Skipped return type for arrow function assigned to ${node.name.getText()}: Too long (${returnTypeString})`) // prettier-ignore
                     }
                  }
               } else {
                  // Handle regular variables
                  // fix: discard var decls for now
                  const isModuleExport =
                     node.parent &&
                     ts.isVariableDeclarationList(node.parent) &&
                     // TODO: just check if parent.parent is a SourceFile (instead? both?)
                     (node.parent.parent?.getText().startsWith('export ') ||
                        node.parent.parent.parent?.kind === ts.SyntaxKind.SourceFile)

                  if (!isModuleExport) return // TODO: decide what to do with regular variables
                  const [typeString, action] = renderType(checker, type, typeContext)
                  if (action === 'skip') return LOG_WARN(`  [skip] type ${chalk.underline(typeString)} for ${node.name.getText()} in ${fileName}`) // prettier-ignore

                  // Check for 'any' or Anonymous Class in type
                  if (typeString.includes('any') || isAnonymousClass(typeString)) {
                     const reason = typeString.includes('any') ? `'any'` : 'Anonymous class'
                     LOG_ERR( `  Skipped adding ${reason} type for ${node.name.getText()} in ${fileName}`) // prettier-ignore
                  }
                  // ...
                  else if (typeString.split(/\s+/).length <= 4 && !typeString.includes('any')) {
                     LOG_OK(`  Adding type to variable ${node.name.getText()}: ${chalk.underline(typeString)}`) // prettier-ignore
                     changes.push({
                        pos: node.name.getEnd(),
                        text: `: ${typeString}`,
                     })
                     gatherImports(typeString, importStatements)
                  }
                  // ...
                  else {
                     LOG_WARN(`  Skipped type for ${node.name.getText()}: Too long (${typeString})`)
                  }
               }
            }
         }
         // #endregion

         // #region 2. ForOf
         else if (ts.isForOfStatement(node)) {
            LOG_DEBUG( `  Skipped type annotation in for...of for ${node.initializer.getText()} in ${fileName}`) // prettier-ignore
         }
         // #endregion

         // #region 3. ForIn
         else if (ts.isForInStatement(node)) {
            LOG_DEBUG( `  Skipped type annotation in for...in for ${node.initializer.getText()} in ${fileName}`) // prettier-ignore
         }
         // #endregion

         // #region 4. FunDecl
         else if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && !node.type) {
            const signature = checker.getSignatureFromDeclaration(node)
            if (signature) {
               const returnType = checker.getReturnTypeOfSignature(signature)
               const [returnTypeString, action] = renderType(checker, returnType, typeContext)
               if (action === 'skip') return LOG_WARN(`  [skip] type ${chalk.underline(returnTypeString)} for ${node.name?.getText()} in ${fileName}`) // prettier-ignore

               // Check for 'any' or Anonymous Class in return type
               if (returnTypeString.includes('any') || isAnonymousClass(returnTypeString)) {
                  const reason = returnTypeString.includes('any') ? `'any'` : 'Anonymous class'
                  LOG_ERR( `  Skipped adding ${reason} return type for function ${node.name?.getText() ?? 'anonymous function'} in ${fileName}`) // prettier-ignore
               }
               // check that the type is quite simple
               else if (
                  returnTypeString.length < 30 &&
                  returnTypeString.split(/\s+/).length <= 4 &&
                  !returnTypeString.includes('any')
               ) {
                  LOG_OK(`  Adding return type to function ${node.name?.getText() ?? 'anonymous function'}: ${returnTypeString}`) // prettier-ignore
                  const pos = getFunctionReturnTypeInsertPos(node)
                  if (pos !== undefined) {
                     changes.push({ pos: pos, text: `: ${returnTypeString}` })
                  } else {
                     LOG_ERR( `  Failed to determine where to insert return type for function ${ node.name?.getText() ?? 'anonymous function' } in ${fileName}`) // prettier-ignore
                     return
                  }
                  gatherImports(returnTypeString, importStatements)
               }
               //
               else {
                  LOG_WARN( `  Skipped return type for function ${ node.name?.getText() ?? 'anonymous function' }: Too long (${returnTypeString})`) // prettier-ignore
               }
            }
         }
         // #endregion

         // #region 5. Class Members
         else if (ts.isClassDeclaration(node) && node.members) {
            if (!node.name) {
               LOG_WARN(`  Skipped unnamed class in ${fileName}`)
               return
            }
            LOG_INFO(`  Processing class: ${node.name.getText()}`)
            node.members.forEach((member) => {
               // Handle Property Declarations
               if (ts.isPropertyDeclaration(member) && !member.type) {
                  const propName = member.name.getText()
                  const symbol = checker.getSymbolAtLocation(member.name)
                  if (symbol) {
                     const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
                     const [typeString, action] = renderType(checker, type, typeContext)
                     if (action === 'skip') {
                        LOG_WARN(
                           `    [skip] type ${chalk.underline(typeString)} for property ${propName} in class ${node.name?.getText()}`,
                        )
                        return
                     }

                     // Check for 'any' or Anonymous Class in type
                     if (typeString.includes('any') || isAnonymousClass(typeString)) {
                        const reason = typeString.includes('any') ? `'any'` : 'Anonymous class'
                        LOG_ERR(
                           `    Skipped adding ${reason} type for property ${propName} in class ${node.name?.getText()}`,
                        )
                     } else if (typeString.split(/\s+/).length <= 4 && !typeString.includes('any')) {
                        LOG_OK(`    Adding type to property ${propName}: ${chalk.underline(typeString)}`)
                        changes.push({
                           pos: member.name.getEnd(),
                           text: `: ${typeString}`,
                        })
                        gatherImports(typeString, importStatements)
                     } else {
                        LOG_WARN(`    Skipped type for property ${propName}: Too long (${typeString})`)
                     }
                  }
               }
               // Handle Get Accessors
               else if (ts.isGetAccessor(member) && !member.type) {
                  const accessorName = member.name.getText()
                  const signature = checker.getSignatureFromDeclaration(member)
                  if (signature) {
                     const returnType = checker.getReturnTypeOfSignature(signature)
                     const [returnTypeString, action] = renderType(checker, returnType, typeContext)
                     if (action === 'skip') {
                        LOG_WARN( `    [skip] type ${chalk.underline(returnTypeString)} for getter ${accessorName} in class ${node.name?.getText()}`, ) // prettier-ignore
                        return
                     }

                     // Check for 'any' or Anonymous Class in return type
                     if (returnTypeString.includes('any') || isAnonymousClass(returnTypeString)) {
                        const reason = returnTypeString.includes('any') ? `'any'` : 'Anonymous class'
                        LOG_ERR( `    Skipped adding ${reason} return type for getter ${accessorName} in class ${node.name?.getText()}`, ) // prettier-ignore
                     } else if (
                        returnTypeString.split(/\s+/).length <= 4 &&
                        !returnTypeString.includes('any')
                     ) {
                        LOG_OK(`    Adding return type to getter ${accessorName}: ${returnTypeString}`)
                        const pos = getFunctionReturnTypeInsertPos(member)
                        if (pos !== undefined) {
                           changes.push({ pos: pos, text: `: ${returnTypeString}` })
                        } else {
                           LOG_ERR( `    Failed to determine where to insert return type for getter ${accessorName} in class ${node.name?.getText()}`, ) // prettier-ignore
                           return
                        }
                        gatherImports(returnTypeString, importStatements)
                     } else {
                        LOG_WARN( `    Skipped return type for getter ${accessorName}: Too long (${returnTypeString})`, ) // prettier-ignore
                     }
                  }
               }
               // Handle Method Declarations
               else if (ts.isMethodDeclaration(member) && !member.type) {
                  const methodName = member.name.getText()
                  const signature = checker.getSignatureFromDeclaration(member)
                  if (signature) {
                     const returnType = checker.getReturnTypeOfSignature(signature)
                     const [returnTypeString, action] = renderType(checker, returnType, typeContext)
                     if (action === 'skip') {
                        LOG_WARN( `    [skip] type ${chalk.underline(returnTypeString)} for method ${methodName} in class ${node.name?.getText()}`, ) // prettier-ignore
                        return
                     }

                     // Check for 'any' or Anonymous Class in return type
                     if (returnTypeString.includes('any') || isAnonymousClass(returnTypeString)) {
                        const reason = returnTypeString.includes('any') ? `'any'` : 'Anonymous class'
                        LOG_ERR( `    Skipped adding ${reason} return type for method ${methodName} in class ${node.name?.getText()}`, ) // prettier-ignore
                     } else if (
                        returnTypeString.split(/\s+/).length <= 4 &&
                        !returnTypeString.includes('any')
                     ) {
                        LOG_OK(`    Adding return type to method ${methodName}: ${returnTypeString}`)
                        const pos = getFunctionReturnTypeInsertPos(member)
                        if (pos !== undefined) {
                           changes.push({ pos: pos, text: `: ${returnTypeString}` })
                        } else {
                           LOG_ERR(
                              `    Failed to determine where to insert return type for method ${methodName} in class ${node.name?.getText()}`,
                           )
                           return
                        }
                        gatherImports(returnTypeString, importStatements)
                     } else {
                        LOG_WARN(
                           `    Skipped return type for method ${methodName}: Too long (${returnTypeString})`,
                        )
                     }
                  }
               }
            })
         }
         // #endregion

         ts.forEachChild(node, visit)
      }

      visit(sourceFile)

      // Sort changes by position to adjust offsets correctly
      changes.sort((a, b) => a.pos - b.pos)

      // Apply changes in reverse order to avoid position issues
      let modifiedSource: string = sourceFile.getFullText()
      for (let i = changes.length - 1; i >= 0; i--) {
         modifiedSource =
            modifiedSource.slice(0, bang(changes[i]).pos) +
            bang(changes[i]).text +
            modifiedSource.slice(bang(changes[i]).pos)
      }

      // Handle Imports
      if (importStatements.size > 0) {
         const importInsertPos = getImportInsertPosition(sourceFile)
         const importLines: string =
            Array.from(importStatements)
               .map(([type, importMod]) => `\nimport type { ${type} } from '${importMod}'`)
               .join('') + '\n'
         modifiedSource =
            modifiedSource.slice(0, importInsertPos) + importLines + modifiedSource.slice(importInsertPos)
      }

      // Write changes back to the file if any modifications were made
      if (changes.length > 0) {
         if (process.argv.includes('--x')) fs.writeFileSync(fileName, modifiedSource)
         LOG_INFO(`  Updated file: ${fileName} with ${changes.length} changes.`)
      } else {
         LOG_DEBUG(`  No changes made to file: ${fileName}.`)
      }
   }

   LOG_INFO('Processing complete.')
}

/**
 * 🔶 meh quality, since it's regexp / string based, with pretty naive shortcuts
 */
function gatherImports(
   //
   typeString: string,
   importStatements: Map<string, string>,
): void {
   const typeNames = typeString.match(/(\w+|\w+<.*?>|\w+\[\])/g)
   if (typeNames) {
      typeNames.forEach((typeName) => {
         const wellKnownImportLocation = getWellKnownImportLocation(typeName)
         if (wellKnownImportLocation) {
            importStatements.set(typeName, wellKnownImportLocation)
         } else {
            // Extract the base type if it's a generic type or array
            const baseType: string = bang(typeName.split('<')[0]).replace('[]', '')
            if (
               !globalTypes.has(baseType) &&
               !globallyInjectedSymbols.has(baseType) &&
               !importStatements.has(baseType)
            ) {
               LOG_DEBUG(`    possible missing import types: ${baseType} (from ${typeString})`)

               // DISABLED FOR NOW
               // importStatements.add(baseType)
            }
         }
      })
   }
}

// #region Main
const compilerOptions = getCompilerOptions()
const directoryPath: string = process.argv[2] || 'src'
const fileNames: string[] = getAllFiles(directoryPath)
await addTypes(fileNames, compilerOptions)
fs.writeFileSync('autotype.summary.txt', summaryLines.join('\n'))

// #endregion

// #region TS Utils
/** Find the last import statement to insert new imports after */
function getImportInsertPosition(sourceFile: ts.SourceFile): number {
   let lastImportEnd = 0
   sourceFile.statements.forEach((statement) => {
      if (ts.isImportDeclaration(statement) || ts.isImportEqualsDeclaration(statement)) {
         lastImportEnd = statement.end
      }
   })
   return lastImportEnd
}

type TypeContext = { ext: '.ts' | '.tsx' }

/** Determine the import path for well-known types based on naming conventions */
function getWellKnownImportLocation(finalType: string): string | null {
   const isSimpleWord = /^[a-zA-Z_]+$/.test(finalType)
   if (!isSimpleWord) return null
   if (finalType.endsWith('_E')) return `src/back/db/mikro-orm/entities/${finalType.slice(0, -2)}_E`
   if (finalType.endsWith('_L')) return `src/front/lives/${finalType.slice(0, -2)}_L`
   return null
}

/** Render a ts.Type to what we want to inject */
function renderType(
   checker: ts.TypeChecker,
   returnType: ts.Type,
   typeContext: TypeContext,
): [string, 'skip' | 'insert'] {
   const alt1: string = checker.typeToString(returnType, undefined, ts.TypeFormatFlags.NoTruncation)
   const alt2: string = checker.typeToString(returnType, undefined, ts.TypeFormatFlags.NoTruncation & ts.TypeFormatFlags.UseFullyQualifiedType ) // prettier-ignore
   if (alt1 !== alt2) {
      LOG_DEBUG(`          > A: ${alt1}`)
      LOG_DEBUG(`          > B: ${alt2}`)
   }
   const final: string =
      alt1 === 'Element' && typeContext.ext === '.tsx' //
         ? 'React.JSX.Element'
         : alt1

   const isWhitelisted = ((): boolean => {
      if (final == 'true') return true
      if (final == 'false') return true
      if (final == 'null') return true
      if (final == 'undefined') return true
      if (final == 'void') return true

      if (final == 'Promise<true>') return true
      if (final == 'Promise<false>') return true
      if (final == 'Promise<null>') return true
      if (final == 'Promise<undefined>') return true
      if (final == 'Promise<void>') return true

      if (simpleVariations('string').includes(final)) return true
      if (simpleVariations('boolean').includes(final)) return true
      if (simpleVariations('number').includes(final)) return true
      if (simpleVariations('Date').includes(final)) return true
      // console.log(`[🤠] `, final)
      // console.log(`[🤠] `, simpleVariationsRegex('[a-zA-Z]+_E'))
      // console.log(`[🤠] `, simpleVariationsRegex('[a-zA-Z]+_E').test(final))
      if (simpleVariationsRegex('[a-zA-Z]+_E').test(final)) return true
      if (simpleVariationsRegex('[a-zA-Z]+_L').test(final)) return true

      // type-level number litteral
      if (/^[0-9]+$/.test(final)) return true

      // small type-level string litteral
      if (final.startsWith('"') && !final.includes('|') && !final.includes(' ') && !final.includes('<')) {
         if (final.length < 25) return true
         return false
      }

      // return true
      return false
   })()

   return [alt1, isWhitelisted ? 'insert' : 'skip']
}

function simpleVariationsRegex(subRegex: string): RegExp {
   return new RegExp(
      `^(${[
         subRegex,
         `Promise<${subRegex}>`,
         `Promise<${subRegex}[]>`,
         `Maybe<${subRegex}>`,
         `Maybe<${subRegex}[]>`,
         `${subRegex}\\s|\\ssnull`,
         `${subRegex}\\s|\\ssundefined`,
      ].join('|')})$`,
   )
}

function simpleVariations(type: string): string[] {
   return [
      type,
      `${type}[]`,
      `Promise<${type}>`,
      `Promise<${type}[]>`,
      `Maybe<${type}>`,
      `Maybe<${type}[]>`,
      `${type} | null`,
      `${type} | undefined`,
   ]
}

/** Find the position to insert the return type for a function */
function getFunctionReturnTypeInsertPos(
   node:
      | ts.FunctionDeclaration
      | ts.FunctionExpression
      | ts.ArrowFunction
      | ts.MethodDeclaration
      | ts.GetAccessorDeclaration,
): number | undefined {
   const sourceFile = node.getSourceFile()
   let end: number

   if (ts.isArrowFunction(node)) {
      // For arrow functions, find the end of the parameters
      end = node.parameters.end
   } else {
      // For regular functions and methods, find the end of the parameters
      end = node.parameters.end
   }

   const text: string = sourceFile.text

   // Find the position after the closing parenthesis
   const closingParenIndex = text.indexOf(')', end)
   if (closingParenIndex !== -1) {
      return closingParenIndex + 1
   }

   return undefined
}

/** Function to read tsconfig.json and return compiler options */
function getCompilerOptions(): ts.CompilerOptions {
   const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json')
   if (!configPath) {
      LOG_ERR('Could not find a valid "tsconfig.json".')
      process.exit(1)
   }

   const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
   if (configFile.error) {
      const error = configFile.error
      LOG_ERR(`Error reading tsconfig.json: ${error.messageText}`)
      process.exit(1)
   }

   const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath))
   if (parsedConfig.errors.length > 0) {
      parsedConfig.errors.forEach((err) => {
         LOG_ERR(`tsconfig.json error: ${err.messageText}`)
      })
      process.exit(1)
   }

   return parsedConfig.options
}

/** Simple regex to detect 'Anonymous class' patterns */
function isAnonymousClass(typeString: string): boolean {
   return /\bAnonymous\s+class\b/.test(typeString)
}

// #endregion

// #region File Utils
/** get all files in given folder */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
   // return ['src/utils/codegen/jsEscapeStr.ts']
   // return ['src/back/features/integrations/nylas/ui/NylasThreadListUI.tsx']
   // return ['src/back/features/devutils/CMD_exec/SynchronizeEventRelations.ts']
   const files: string[] = fs.readdirSync(dirPath)
   files.forEach((file) => {
      const filePath: string = path.join(dirPath, file)
      if (fs.statSync(filePath).isDirectory()) {
         getAllFiles(filePath, arrayOfFiles)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
         arrayOfFiles.push(filePath)
      }
   })

   return arrayOfFiles
}
// #endregion

// #region Logger Utils
function LOG_OK(line: string): void {
   LOG(chalk.green, line)
}
function LOG_WARN(line: string): void {
   LOG(chalk.yellow, line)
}
function LOG_ERR(line: string): void {
   LOG(chalk.red, line)
}
function LOG_INFO(line: string): void {
   LOG(chalk.blue, line)
}
function LOG_DEBUG(line: string): void {
   LOG(chalk.dim, line)
}
function LOG(chalkFn: (text: string) => string, line: string): void {
   summaryLines.push(line)
   console.log(chalkFn(line))
}
// #endregion
