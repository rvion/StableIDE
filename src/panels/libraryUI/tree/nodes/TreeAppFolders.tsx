import type { ITreeElement, ITreeEntry } from '../../../../csuite/tree/TreeEntry'
import type { TreeNode } from '../../../../csuite/tree/TreeNode'
import type { VirtualFolder } from '../../../../csuite/tree/VirtualHierarchy'
import type { CushyAppL } from '../../../../models/CushyApp'

import { basename } from 'pathe'

import { Ikon } from '../../../../csuite/icons/iconHelpers'
import { TreeApp } from './TreeApp'

export class TreeAppFolder implements ITreeEntry<VirtualFolder<CushyAppL>> {
   constructor(public vf: VirtualFolder<CushyAppL>) {}

   get name(): string {
      return `${basename(this.vf.folderPath)}`
   }
   get icon(): React.JSX.Element {
      return <Ikon.mdiFolder className='text-yellow-700' />
   }
   get iconExpanded(): React.JSX.Element {
      return <Ikon.mdiFolderOpen className='text-yellow-700' />
   }

   onPrimaryAction = (n: TreeNode): void => n.toggle()

   children = (): ITreeElement<any>[] => {
      const vh = cushy.virtualAppHierarchy
      const subFolders = vh
         .getSubFolders(this.vf.folderPath)
         .sort()
         .map(
            (folderPath): ITreeElement<VirtualFolder<CushyAppL>> => ({
               ctor: TreeAppFolder,
               key: folderPath,
               props: { folderPath, vh },
            }),
         )
      const subFiles = vh
         .getItemsInFolder(this.vf.folderPath)
         .sort((a, b) => a.name.localeCompare(b.name))
         .map((app): ITreeElement<CushyAppID> => ({ ctor: TreeApp, key: app.id, props: app.id }))
      return [...subFolders, ...subFiles]
   }
}
