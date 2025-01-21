import type { ITreeElement, ITreeEntry } from '../../../../csuite/tree/TreeEntry'
import type { TreeNode } from '../../../../csuite/tree/TreeNode'
import type { VirtualFolder } from '../../../../csuite/tree/VirtualHierarchy'
import type { DraftL } from '../../../../models/Draft'
import type { STATE } from '../../../../state/state'

import { basename } from 'pathe'

import { Ikon } from '../../../../csuite/icons/iconHelpers'
import { TreeDraft } from './TreeDraft'

export class TreeDraftFolder implements ITreeEntry<VirtualFolder<DraftL>> {
   constructor(public vf: VirtualFolder<DraftL>) {}

   get st(): STATE {
      return cushy
   }

   get name(): string {
      return `${basename(this.vf.folderPath)}`
   }

   get icon(): React.JSX.Element {
      return <Ikon.mdiFolder tw='text-yellow-700' />
   }

   get iconExpanded(): React.JSX.Element {
      return <Ikon.mdiFolderOpen tw='text-yellow-700' />
   }

   onPrimaryAction(n: TreeNode): void {
      n.toggle()
   }

   children = (): ITreeElement<any>[] => {
      const vh = this.vf.vh
      const subFolders = vh
         .getSubFolders(this.vf.folderPath)
         .sort()
         .map(
            (folderPath): ITreeElement<VirtualFolder<DraftL>> => ({
               ctor: TreeDraftFolder,
               key: folderPath,
               props: { vh: vh, folderPath },
            }),
         )
      const subFiles = vh
         .getItemsInFolder(this.vf.folderPath)
         .sort((a, b) => a.name.localeCompare(b.name))
         .map(
            (draft): ITreeElement<DraftL> => ({
               ctor: TreeDraft,
               key: draft.id,
               props: draft,
            }),
         )
      return [...subFolders, ...subFiles]
   }
}
