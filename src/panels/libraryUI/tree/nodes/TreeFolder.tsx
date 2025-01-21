import type { ITreeElement, ITreeEntry, TreeEntryAction } from '../../../../csuite/tree/TreeEntry'
import type { TreeNode } from '../../../../csuite/tree/TreeNode'

import { readdirSync, statSync } from 'fs'
import { makeAutoObservable } from 'mobx'
import { basename } from 'pathe'

import { shouldSkip } from '../../../../cards/shouldSkip'
import { Ikon } from '../../../../csuite/icons/iconHelpers'
import { asRelativePath } from '../../../../utils/fs/pathUtils'
import { TreeFile } from './TreeFile'

export class TreeFolder implements ITreeEntry<RelativePath> {
   constructor(public path: RelativePath) {
      makeAutoObservable(this)
   }
   get id(): string{return `path#${this.path}`} //prettier-ignore
   get name(): string { return basename(this.path) } // prettier-ignore

   children(): ITreeElement<RelativePath>[] {
      const files = readdirSync(this.path)
      const subFolders: ITreeElement<RelativePath>[] = []
      const subFiles: ITreeElement<RelativePath>[] = []
      for (const file of files) {
         if (shouldSkip(file)) continue
         const relPath = asRelativePath(`${this.path}/${file}`)
         const stats = statSync(relPath)
         const isFolder = stats.isDirectory()
         if (isFolder) subFolders.push({ ctor: TreeFolder, key: file, props: relPath })
         else subFiles.push({ ctor: TreeFile, key: file, props: relPath })
      }
      return [
         //
         ...subFolders.sort((a, b) => a.key.localeCompare(b.key)),
         ...subFiles.sort((a, b) => a.key.localeCompare(b.key)),
      ]
   }

   isFolder: boolean = true

   onPrimaryAction = (n: TreeNode): void => {
      n.toggle()
   }

   get actions(): TreeEntryAction[] {
      if (this.path === 'library/installed')
         return [
            {
               name: 'Find More...',
               icon: 'mdiCloudDownloadOutline',
               onClick: (): void => {},
               mode: 'full',
            },
         ]
      if (this.path === 'library/local')
         return [
            {
               name: 'create...',
               icon: 'mdiPlusCircleOutline',
               onClick: (): void => {},
               mode: 'full',
            },
         ]
      return []
   }
   get icon(): React.JSX.Element {
      return <Ikon.mdiFolder tw='text-yellow-700' />
   }
   get iconExpanded(): React.JSX.Element {
      return <Ikon.mdiFolderOpen tw='text-yellow-700' />
   }

   // get icon() {
   //     // if (this.path === 'library/installed')            return <span className='material-symbols-outlined text-red-500'>get_app</span>
   //     // if (this.path === 'library/local')                return <span className='material-symbols-outlined text-blue-500'>privacy_tip</span>
   //     // if (this.path === 'library/built-in')             return <span className='material-symbols-outlined text-green-500'>apps</span>
   //     // if (this.path === 'library/sdk-examples')         return <span className='material-symbols-outlined text-green-500'>live_help</span>
   //     return <span className='material-symbols-outlined text-base-300'>folder</span>
   // }
}
