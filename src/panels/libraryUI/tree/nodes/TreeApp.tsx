import type { ITreeElement, ITreeEntry, TreeEntryAction } from '../../../../csuite/tree/TreeEntry'
import type { TreeNode } from '../../../../csuite/tree/TreeNode'
import type { VirtualFolder } from '../../../../csuite/tree/VirtualHierarchy'
import type { CushyAppL } from '../../../../models/CushyApp'
import type { DraftL } from '../../../../models/Draft'
import type { STATE } from '../../../../state/state'

import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import { AppFavoriteBtnUI } from './misc/CardPicker2UI'
import { TreeDraft } from './TreeDraft'
import { TreeDraftFolder } from './TreeDraftFolders'

export class TreeApp implements ITreeEntry {
   app?: Maybe<CushyAppL>
   get st():STATE { return cushy } // prettier-ignore
   constructor(
      public appID: CushyAppID, // public app: CushyAppL,
   ) {
      this.app = cushy.db.cushy_app.get(appID)
      makeAutoObservable(this)
   }

   get name(): string { return `${this.app?.name??'❌'}`; } // prettier-ignore
   isFolder: boolean = true
   get icon(): string {
      return this.app?.illustrationPathWithFileProtocol ?? ''
      // return <span className='material-symbols-outlined'>Draft</span>
   }

   onPrimaryAction = (n: TreeNode): void => {
      if (this.app == null) return
      if (!n.isOpen) n.open()
      if (this.app.drafts.length > 0) return
      this.app.createDraft()
   }

   children = (): ITreeElement<any>[] => {
      const app = this.app
      if (app == null) return []
      const vh = app.subFolderStructure
      const subFolders = vh
         .getTopLevelFolders()
         .sort()
         .map(
            (folderPath): ITreeElement<VirtualFolder<DraftL>> => ({
               ctor: TreeDraftFolder,
               key: folderPath,
               props: { vh, folderPath },
            }),
         )
      const subFiles = vh.topLevelItems
         .sort((a, b) => a.name.localeCompare(b.name))
         .map((draft): ITreeElement<DraftL> => ({ ctor: TreeDraft, key: draft.id, props: draft }))
      return [...subFolders, ...subFiles]
   }

   extra = (): React.JSX.Element | null => (
      <>
         {this.app?.isLoadedInMemory ? (
            <span className='material-symbols-outlined text-green-500'>memory</span>
         ) : null}
         <TreeApp_BtnFavUI entry={this} />
      </>
   )
   actions: TreeEntryAction[] = [
      {
         name: 'add Draft',
         icon: 'mdiPlus',
         mode: 'small',
         onClick: (node): void => {
            if (this.app == null) return
            this.app.createDraft()
            node.open()
         },
      },
   ]
}

export const TreeApp_BtnFavUI = observer(function TreeApp_BtnFavUI_(p: { entry: TreeApp }) {
   if (p.entry.app == null) return null
   return <AppFavoriteBtnUI app={p.entry.app} />
})
