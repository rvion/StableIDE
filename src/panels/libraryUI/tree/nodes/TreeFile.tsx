import type { LibraryFile } from '../../../../cards/LibraryFile'
import type { ITreeElement, ITreeEntry, TreeEntryAction } from '../../../../csuite/tree/TreeEntry'
import type { TreeNode } from '../../../../csuite/tree/TreeNode'
import type { CushyScriptL } from '../../../../models/CushyScript'

import { makeAutoObservable } from 'mobx'
import { basename } from 'pathe'
import { cwd } from 'process'

import { type ScriptExtractionResult } from '../../../../cards/LibraryFile'
import { assets } from '../../../../utils/assets/assets'
import { TreeApp } from './TreeApp'

export class TreeFile implements ITreeEntry {
   file: LibraryFile

   async onExpand(): Promise<void> {
      await this.file.extractScriptFromFileAndUpdateApps()
   }

   constructor(public path: RelativePath) {
      this.file = cushy.library.getFile(path)
      makeAutoObservable(this)
   }

   /** 🔶 'isFolder' for the tree widget, not on the filesystem */
   isFolder: boolean = true

   /** icon to display in the treeview */
   get icon(): string | React.JSX.Element {
      if (this.path.endsWith('.ts')) return assets.typescript_512_png
      if (this.path.endsWith('.tsx')) return assets.typescript_512_png
      if (this.path.endsWith('.png')) return `file://${cwd()}/${this.path}`
      // if (this.file) return <AppIllustrationUI size='1.3rem' app={this.file} />
      return <span>❓</span>
      // if (this.path === 'library/Installed') return <span className='material-symbols-outlined'>get_app</span>
      // if (this.path === 'library/Local') return <span className='material-symbols-outlined'>privacy_tip</span>
      // if (this.path === 'library/CushyStudio') return <span className='material-symbols-outlined'>home</span>
      // return <span className='material-symbols-outlined'>home</span>
   }

   get script(): Maybe<CushyScriptL> {
      return this.file.script
   }

   get name(): string {
      return basename(this.path)
   }

   actions: TreeEntryAction[] = [
      {
         name: 'add Draft',
         icon: 'mdiTabSearch', //'play_arrow',
         mode: 'small',
         onClick: async (): Promise<ScriptExtractionResult | undefined> => {
            if (this.file == null) return
            return this.file.extractScriptFromFile()
         },
      },
   ]

   onFocusItem = async (): Promise<ScriptExtractionResult | undefined> => {
      if (this.file.scriptExtractionAttemptedOnce) return
      return this.file.extractScriptFromFile()
   }

   onPrimaryAction(n: TreeNode): void {
      void this.file.extractScriptFromFile()
      if (!n.isOpen) {
         n.open()
         this.script?.evaluateAndUpdateAppsAndViews()
      } else {
         n.close()
      }
   }

   children = (): ITreeElement<CushyAppID>[] => {
      // if (!this.file.hasBeenLoadedAtLeastOnce) return []
      if (this.file == null) { console.log(`[🔴] TreeFile (${this.path}): FILE is null`); return [] } // prettier-ignore
      if (this.script == null) { console.log(`[🔴] TreeFile (${this.path}): SCRIPT is null`); return [] } // prettier-ignore

      const apps = this.script.apps
      // console.log(`[🧐] 🔴 ${this.path} => ${apps.length}`)
      if (apps.length === 0) {
         // console.log(`[🔴] TreeFile (${this.path}): APPS.length = 0`)
         return []
      }

      // console.log(`[🟢] TreeFile: found ${apps.length} apps`)
      return [
         //
         ...apps.map((app) => ({
            ctor: TreeApp,
            key: app.id,
            props: app.id,
         })),
         // ...this.script,
      ]
   }
}
