import type { PropsOf } from '../csuite/types/PropsOf'
import type { ProplessFC } from '../csuite/types/ReactUtils'
import type { PerspectiveL } from '../models/Perspective'
import type { STATE } from '../state/state'
import type { PanelPersistedJSON } from './PanelPersistedJSON'
import type { PanelName, Panels } from './PANELS'
import type { Layout } from 'flexlayout-react'
import type { FC } from 'react'

import * as FL from 'flexlayout-react'
import { Actions, Model as FlexLayoutModel } from 'flexlayout-react'
import { action, isObservable, makeAutoObservable, runInAction } from 'mobx'
import { createElement, createRef, type RefObject } from 'react'

import { hashJSONObjectToNumber } from '../csuite/hashUtils/hash'
import { getIconAsDataSVG } from '../csuite/icons/iconStr'
import { LegacyMessageUI } from '../csuite/inputs/LegacyMessageUI'
import { regionMonitor } from '../csuite/regions/RegionMonitor'
import { Stack } from '../csuite/structures/Stack'
import { Trigger } from '../csuite/trigger/Trigger'
import { bang } from '../csuite/utils/bang'
import { toastError } from '../csuite/utils/toasts'
import { type CustomPanelRef, registerCustomPanel } from '../panels/PanelCustom/CustomPanels'
import { LayoutUI } from './LayoutUI'
import { PanelContainerUI } from './PanelContainerUI'
import { panels } from './PANELS'
import { perspectiveHelper } from './perspectives/_PerspectiveBuilder'
import { getCanvasPerspective } from './perspectives/canvas.perspective'
import { getDefaultPerspective } from './perspectives/default1.perspective'
import { getEmptyPerspective } from './perspectives/empty.perspective'
import { type TraversalNextStep, type TraverseFn, traverseLayoutNode } from './traverseLayoutNode'
import { uniqueIDByMemoryRef } from './uniqueIDByMemoryRef'

export type TabsetExt = 'active' | 'hoverd' | FL.TabSetNode

// prettier-ignore
export type PanelPlacement =
    /** open in the current pane */
    | 'current'
    /** open in the nearest parent row, on the left of current tabset */
    | 'left'
    /** open in the nearest parent row, on the right of current tabset */
    | 'right'
    /** open ..... TODO */
    | 'below'
    /** open in the tabset that have the biggest area */
    | 'biggest'
    /** open in the non-current tabset that have the biggest area */
    | 'biggest-except-current'
    /** prefer the biggest existing tabset with similar content */
    | 'biggest-similar'

type TabsetID = string
type PerspectiveDataForSelect = {
   label: string
   value: string
}

export class CushyLayoutManager {
   /** the current Flexlayout Model, holding the position of all panels */
   model!: FlexLayoutModel

   setSingleTabStretch(value: boolean): void {
      const action = Actions.updateModelAttributes({
         tabSetEnableSingleTabStretch: value,
      })
      this.model.doAction(action)
   }

   /**
    * Useful to properly force react component to refresh when switching
    * between different perspectives
    */
   private modelKey: number = 0
   private setModel(model: FlexLayoutModel): void {
      this.model = model
      this.modelKey++
   }

   perspective: PerspectiveL
   constructor(public st: STATE) {
      // const prevLayout = st.configFile.value.layouts_v13?.default
      const PDefault = cushy.db.perspective.getOrCreateWith('default', this.makeNewPerspective_default1)
      const PCanvas = cushy.db.perspective.getOrCreateWith('canvas', this.makeNewPerspective_canvas)
      const PEmpty = cushy.db.perspective.getOrCreateWith('empty', this.makeNewPerspective_empty)
      this.perspective = PDefault
      this.openPerspective(this.perspective)
      makeAutoObservable(this, {
         layoutRef: false,
         open: action,
      })
   }

   /** pretty print model layout as json */
   prettyPrintLayoutModel(): void {
      const obs = isObservable(this.model)
      console.log(
         `[💠] ${obs ? '(❌ OBSERVABLE)' : ''} layout model:`,
         JSON.stringify(this.model.toJson(), null, 4),
      )
   }

   private _getTabset(tse: TabsetExt): FL.TabSetNode {
      if (tse === 'active') return this.getActiveOrFirstTabset_orThrow()
      if (tse === 'hoverd') return this.getHoveredOrFirstTabset_orThrow()
      return tse
   }

   // Tabset Size Manipulation -----------------------------------------------------------
   /** widen given tabset by given factor (default to 1.3) */
   widenTabset(tse: TabsetExt, factor = 1.3): void {
      this.prettyPrintLayoutShape()
      const tabset = this._getTabset(tse)
      const prevWeight = tabset.getWeight()
      this.do((a) =>
         a.updateNodeAttributes(
            //
            tabset.getId(),
            { weight: prevWeight * factor },
         ),
      )
   }

   /** widen given tabset by given factor (default to 0.7) */
   shrinkTabset(tse: TabsetExt, factor = 0.7): void {
      this.prettyPrintLayoutShape()
      const tabset = this._getTabset(tse)
      const prevWeight = tabset.getWeight()
      this.do((a) =>
         a.updateNodeAttributes(
            //
            tabset.getId(),
            { weight: prevWeight * factor },
         ),
      )
   }

   /** reset tabset size by resetting it's layout weight (default to 1) */
   resetTabsetSize(tse: TabsetExt, weight = 100): void {
      this.prettyPrintLayoutShape()
      const tabset = this._getTabset(tse)
      this.do((a) => a.updateNodeAttributes(tabset.getId(), { weight }))
   }

   // Tabset Size Manipulation -----------------------------------------------------------

   /** pretty print model shape as tree, only showing important infos */
   prettyPrintLayoutShape(): void {
      const out: string[] = []
      function getDepth(node: FL.Node): number {
         let depth = 0
         let at: Maybe<FL.Node> = node
         while (at != null) {
            depth++
            at = at.getParent()
         }
         return depth
      }
      this.traverse({
         onNode2({ type, node }) {
            const weight =
               type === 'tabset' //
                  ? ` (${node.getWeight().toString()})`
                  : ''
            out.push(`${'  '.repeat(getDepth(node))}${type}${weight}`)
            return null
         },
      })
      console.log(`[💠] layout shape:\n${out.join('\n')}`)
   }

   /** quick method to maximize a tabset */
   _maximizeToggle(tabsetNodeID: string): Trigger {
      return this.do(Actions.maximizeToggle(tabsetNodeID))
   }

   /**
    * wrap model.doAction,
    * allow to use lambda syntax to inject Action builder
    * return Trigger.Success
    */
   do(action_: FL.Action | ((actions: typeof Actions) => FL.Action)): Trigger {
      const action: FL.Action =
         typeof action_ === 'function' //
            ? action_(Actions)
            : action_
      this.model.doAction(action)
      return Trigger.Success
   }

   /** utility to apply a function on the active tabset */
   _withActiveTabset<Ret extends any>(fn: (tabset: FL.TabSetNode) => Ret): Ret | Trigger {
      const tabset: FL.TabSetNode | undefined = this.getActiveOrFirstTabset_orThrow()
      return fn(tabset)
   }

   /** utility to apply a function on the hovered tabset */
   _withHoveredTabset<Ret extends any>(fn: (tabset: FL.TabSetNode) => Ret): Ret | Trigger {
      const tabset: Maybe<FL.TabSetNode> = this.hoveredTabset
      if (tabset == null) {
         console.log(`[❌] maximizHoveredTabset: tabset is null`)
         return Trigger.UNMATCHED
      }
      return fn(tabset)
   }

   /** utility to apply a function on the whole layout */
   _withLayout<Ret extends any>(fn: (layout: Layout) => Ret): Ret | Trigger {
      const layout: FL.Layout | null = this.layoutRef.current
      if (layout == null) {
         console.log(`[❌] _withLayout: layout is null`)
         return Trigger.UNMATCHED
      }
      return fn(layout)
   }

   /** close all tabs currently open */
   closeAllTabs(): Trigger {
      let tabset = this.getActiveOrFirstTabset_orNull()
      if (tabset == null) return Trigger.UNMATCHED
      while (tabset != null) {
         this.do(Actions.deleteTabset(tabset.getId()))
         tabset = this.getActiveOrFirstTabset_orNull()
      }
      return Trigger.Success
   }

   closeCurrentTabset(): Trigger {
      const tabset = this.getActiveOrFirstTabset_orNull()
      if (tabset == null) return Trigger.UNMATCHED
      this.do(Actions.deleteTabset(tabset.getId()))
      return Trigger.Success
   }

   getAllTabset(): FL.TabSetNode[] {
      const tabsets: FL.TabSetNode[] = []
      this.traverse({
         onTabset: (tabset): TraversalNextStep => {
            tabsets.push(tabset)
            return 'stop'
         },
      })
      return tabsets
   }

   get biggestTabset(): Maybe<FL.TabSetNode> {
      const tabsets = this.getAllTabset()
      let biggest: Maybe<FL.TabSetNode> = null
      let biggestArea: number = 0
      for (const tabset of tabsets) {
         const rect = tabset.getRect()
         const area = rect.width * rect.height
         if (area > biggestArea) {
            biggest = tabset
            biggestArea = area
            continue
         }
      }
      return biggest
   }

   get biggestTabsetExceptCurrent(): Maybe<FL.TabSetNode> {
      const tabsets = this.getAllTabset()
      const currentTabset = this.getActiveOrFirstTabset_orThrow()
      let biggest: Maybe<FL.TabSetNode> = null
      let biggestArea: number = 0
      for (const tabset of tabsets) {
         if (tabset === currentTabset) continue
         const rect = tabset.getRect()
         const area = rect.width * rect.height
         if (area > biggestArea) {
            biggest = tabset
            biggestArea = area
            continue
         }
      }
      return biggest
   }

   /** same as cmd+page-up in vscode: focus previous tab in tabset */
   openPreviousPane(): Trigger {
      return this._withActiveTabset((tabset) => {
         // select previous tab
         const selected = tabset.getSelected()
         if (selected == null) return Trigger.UNMATCHED
         const prev = selected - 1
         if (prev < 0) return Trigger.UNMATCHED
         const allTabsInTabset = tabset.getChildren()
         const prevID = allTabsInTabset[prev]!.getId()
         this.do(Actions.selectTab(prevID))
         return Trigger.Success
      })
   }

   /** same as cmd+page-down in vscode: focus next tab in tabset */
   openNextPane(): Trigger {
      return this._withActiveTabset((tabset) => {
         // select next tab
         const selected = tabset.getSelected()
         if (selected == null) return Trigger.UNMATCHED
         const next = selected + 1
         const allTabsInTabset = tabset.getChildren()
         if (next >= allTabsInTabset.length) return Trigger.UNMATCHED
         const nextID = allTabsInTabset[next]!.getId()
         this.do(Actions.selectTab(nextID))
         return Trigger.Success
      })
   }

   /** maximize the active(=selected; with focus) tabset */
   maximizeActiveTabset(): Trigger {
      return this._withActiveTabset((tabset) => this._maximizeToggle(tabset.getId()))
   }

   /** maximize the tabset under the mouse */
   maximizHoveredTabset = (): Trigger => {
      return this._withHoveredTabset((tabset) => this._maximizeToggle(tabset.getId()))
   }

   getHoveredOrFirstTabset_orThrow = (): FL.TabSetNode => {
      return (
         this.hoveredTabset ?? //
         this._assertTabsetNode_orThrow(this.model.getFirstTabSet())
      )
   }

   getHoveredOrFirstTabset_orNull = (): Maybe<FL.TabSetNode> => {
      return (
         this.hoveredTabset ?? //
         this._assertTabsetNode_orNull(this.model.getFirstTabSet())
      )
   }

   /** access hovered tabset */
   get hoveredTabset(): Maybe<FL.TabSetNode> {
      // get hovered tab
      const hoveredTab = this.hoveredTab
      if (hoveredTab == null) return null

      // get it's parent tabset
      const tabSet = hoveredTab.getParent()
      if (tabSet == null) {
         console.log(`[🔴] INVARIANT VIOLATION; tab parent is null (expected: tabset)`)
         return null
      }
      if (tabSet.getType() !== 'tabset')
         console.log(
            `[🔴] INVARIANT VIOLATION; panelID correspond to a '${tabSet.getType()}', not a 'tabset'`,
         )
      return tabSet as FL.TabSetNode
   }

   /** access hovered tab */
   get hoveredTab(): Maybe<FL.TabNode> {
      const tabNodeID = cushy.region.hoveredPanel
      if (tabNodeID == null) return null
      const tabNode = this.model.getNodeById(tabNodeID)
      if (tabNode == null) return null
      if (tabNode.getType() !== 'tab')
         console.log(`[🔴] INVARIANT VIOLATION; panelID correspond to a ${tabNode.getType()}`)
      return tabNode as FL.TabNode
   }

   // PERSPECTIVE SYSTEM --------------------------------------------------------------
   /**
    * currently active perspective name
    * DO NOT UPDATE THAT MANUALLY
    */
   // currentPerspectiveName = 'default'

   // allPerspectives: PerspectiveDataForSelect[] = [
   //     { label: 'default', value: 'default' },
   //     { label: 'test', value: 'test' },
   // ]

   // /**
   //  * update the currently selected perspective to the current layout
   //  * allow to easilly revert to this specific set of panels later
   //  */
   // saveCurrentPerspective(): void {
   //     return this.saveCurrentPerspectiveAs(this.currentPerspectiveName)
   // }

   // saveCurrentPerspectiveAsDefault(): void {
   //     return this.saveCurrentPerspectiveAs('default')
   // }

   // saveCurrentPerspectiveAs(perspectiveName: string): void {
   //     const curr: FL.IJsonModel = this.model.toJson()
   //     this.st.configFile.update((t) => {
   //         t.layouts_v13 ??= {}
   //         t.layouts_v13[perspectiveName] = curr
   //     })
   // }
   openPerspective(perspective: PerspectiveL): void {
      this.perspective = perspective
      const json = this.perspective.data.layout
      if (isObservable(json)) {
         console.log(`[💠] Layout: ❌ json is observable`)
         // throw new Error('❌nope22❌')
      }
      try {
         this.setModel(FlexLayoutModel.fromJson(json))
      } catch (e) {
         console.log('[💠] Layout: ❌ error loading layout', e)
         this.setModel(FlexLayoutModel.fromJson(this.makeNewPerspective_default1()))
      }
   }

   makeNewPerspective_default1(): FL.IJsonModel {
      return getDefaultPerspective(perspectiveHelper)
   }
   makeNewPerspective_canvas(): FL.IJsonModel {
      return getCanvasPerspective(perspectiveHelper)
   }
   makeNewPerspective_empty(): FL.IJsonModel {
      return getEmptyPerspective(perspectiveHelper)
   }

   resetCurrent(): void {
      this.perspective.resetToDefault()
   }

   resetDefault(): void {
      this.reset('default')
   }

   reset(perspectiveName: string): void {
      const perspective = cushy.db.perspective.getOrCreateWith(
         perspectiveName,
         this.makeNewPerspective_default1,
      )
      perspective.resetToDefault()
      if (perspective === this.perspective) {
         this.setModel(FlexLayoutModel.fromJson(perspective.data.layout))
      }
   }

   layoutRef: RefObject<FL.Layout> = createRef<Layout>()
   updateCurrentTab(p: Partial<FL.TabNode>): void {
      const tab = this.currentTab
      if (tab == null) return
      this.model.doAction(Actions.updateNodeAttributes(tab.getId(), p))
   }

   isPanelVisible(panelName: PanelName): boolean {
      const node = this.findTabsFor(panelName)
      const tab = node[0]
      if (tab == null) return false
      return tab.tabNode.isVisible()
   }

   currentTabSet: Maybe<FL.TabSetNode> = null
   currentTab: Maybe<FL.Node> = null
   currentTabID: Maybe<string> = null

   private _isTabset(node: FL.Node): node is FL.TabSetNode {
      return node.getType() === 'tabset'
   }

   moveActiveTabToRight = (): Trigger => {
      // 1. get tabset
      const surroundings = this.getTabsetSurroundings()
      if (surroundings == null) return Trigger.UNMATCHED
      const tabset = surroundings.curr

      // 2. get tab
      const tabIx = tabset.getSelected()
      if (tabIx == null) return toastError('No active tab')
      const tab = tabset.getChildren()[tabIx]
      if (tab == null) return toastError('No active tab')
      const tabID = tab.getId()

      if (surroundings.next == null) {
         // 3. move tab into split
         this.model.doAction(Actions.moveNode(tabID, tabset.getId(), FL.DockLocation.RIGHT, -1))
         this.prettyPrintLayoutModel()
         return Trigger.Success
      } else {
         // 3. move tab to right tabset
         this.model.doAction(Actions.moveNode(tabID, surroundings.next.getId(), FL.DockLocation.CENTER, -1))
         this.prettyPrintLayoutModel()
         return Trigger.Success
      }
   }

   moveActiveTabToLeft = (): Trigger => {
      // 1. get tabset
      const surroundings = this.getTabsetSurroundings()
      if (surroundings == null) return Trigger.UNMATCHED
      const tabset = surroundings.curr

      // 2. get tab
      const tabIx = tabset.getSelected()
      if (tabIx == null) return toastError('No active tab')
      const tab = tabset.getChildren()[tabIx]
      if (tab == null) return toastError('No active tab')
      const tabID = tab.getId()

      if (surroundings.prev == null) {
         // 3. move tab into split
         this.model.doAction(Actions.moveNode(tabID, tabset.getId(), FL.DockLocation.LEFT, -1))
         this.prettyPrintLayoutModel()
         return Trigger.Success
      } else {
         // 3. move tab to left split
         this.model.doAction(Actions.moveNode(tabID, surroundings.prev.getId(), FL.DockLocation.CENTER, -1))
         this.prettyPrintLayoutModel()
         return Trigger.Success
      }
   }

   getTabsetSurroundings = (): Maybe<{
      row: FL.RowNode
      curr: FL.TabSetNode
      prev: Maybe<FL.TabSetNode>
      next: Maybe<FL.TabSetNode>
   }> => {
      const tabset = this.getActiveOrFirstTabset_orThrow()

      const parent = tabset.getParent()
      if (parent == null) return void toastError('tabset has no parent')
      if (parent.getType() !== 'row')
         return void toastError(`parent is a '${parent.getType()}', not a tabset`)

      const children = parent.getChildren()
      const selfX = children.indexOf(tabset)
      console.log(`[🤠] children`, `${selfX + 1} / ${children.length}`)

      return {
         row: parent as FL.RowNode,
         curr: tabset,
         prev: children[selfX - 1] as Maybe<FL.TabSetNode>,
         next: children[selfX + 1] as Maybe<FL.TabSetNode>,
      }
      // let next = children[selfX + 1]
      // if (next == null) {
      //     console.log(`[🤠] last tabset`)
      //     this.model.doAction(Actions.moveNode(tabID, tabset.getId(), FL.DockLocation.LEFT, -1))
      // } else {
      //     this.model.doAction(Actions.selectTab(next.getId()))
      // }

      // return parent as FL.TabSetNode
   }

   UI: ProplessFC = (): React.JSX.Element => <LayoutUI layout={this} />

   /** rename tab by ID */
   renameTab(tabID: string, newName: string): void {
      const tab = this.model.getNodeById(tabID)
      if (tab == null) return
      this.model.doAction(Actions.renameTab(tabID, newName))
   }

   private _assertTabsetNode_orThrow = (node: FL.Node): FL.TabSetNode => {
      if (node.getType() !== 'tabset') throw new Error(`[❌] node is not a tabset`)
      return node as FL.TabSetNode
   }

   private _assertTabsetNode_orNull = (node: FL.Node): Maybe<FL.TabSetNode> => {
      if (node.getType() !== 'tabset') return null
      return node as FL.TabSetNode
   }

   getActiveOrFirstTabset_orThrow = (): FL.TabSetNode => {
      return (
         this.model.getActiveTabset() ?? //
         this._assertTabsetNode_orThrow(this.model.getFirstTabSet())
      )
   }

   getActiveOrFirstTabset_orNull = (): Maybe<FL.TabSetNode> => {
      return (
         this.model.getActiveTabset() ?? //
         this._assertTabsetNode_orNull(this.model.getFirstTabSet())
      )
   }
   /** quickly rename the current tab */
   renameCurrentTab(newName: string): void {
      const tabset = this.getActiveOrFirstTabset_orThrow()
      if (tabset == null) return
      const tab = tabset.getSelectedNode()
      if (tab == null) return
      const tabID = tab.getId()
      this.model.doAction(Actions.renameTab(tabID, newName))
   }

   tabHistory = new Map<string /* tabsetID */, Stack<string /* tabID */>>()
   unrecordVisit(tabsetID: string, tabID: string): Maybe<string> {
      let stack = this.tabHistory.get(tabsetID)
      if (stack == null) {
         stack = new Stack<string>()
         this.tabHistory.set(tabsetID, stack)
      }
      stack.remove(tabID)

      const last = stack.last()
      // console.log(`[XX] 🔴 <== previous visit (${tabsetID}:${last}):`)
      return last
   }
   recordVisit(tabsetID: string, tabId: string): void {
      let stack = this.tabHistory.get(tabsetID)
      if (stack == null) {
         stack = new Stack<string>()
         this.tabHistory.set(tabsetID, stack)
      }
      const last = stack.last()
      if (last === tabId) return
      // console.log(`[xx] 🟢 ==> recording visit (${tabsetID}:${tabId}):`)
      stack.push(tabId)
   }

   closeCurrentTab(tse: TabsetExt = 'hoverd'): Trigger {
      // 1. find tabset
      const tabset = this._getTabset(tse)
      if (tabset == null) return Trigger.UNMATCHED

      // 2. find active tab
      const tab = tabset.getSelectedNode()
      if (tab == null) return Trigger.UNMATCHED
      const tabID = tab.getId()

      // ??. focus preview tab in the tabset if it exists
      const prevTabToReselect = this.unrecordVisit(tabset.getId(), tabID)
      if (prevTabToReselect != null) {
         this.model.doAction(Actions.selectTab(prevTabToReselect))
      }

      // 3. close tab
      this.model.doAction(Actions.deleteTab(tabID))

      // else {
      //    const prevTab = tabset.getSelectedNode()
      //    if (prevTab != null) this.model.doAction(Actions.selectTab(prevTab.getId()))
      // }

      // 5. mark action as success
      return Trigger.Success
   }

   closeTab(tabID: string): Trigger {
      const shouldRefocusAfter = this.currentTabID === tabID
      this.model.doAction(Actions.deleteTab(tabID))
      return Trigger.Success
   }

   currentHoveredTabIs<K extends PanelName>(component: K): boolean {
      return regionMonitor.hoveredRegion?.type === component
   }

   currentTabIs<K extends PanelName>(component: K): Maybe<Panels[K]['$Props']> {
      const tabPrefix = `/${component}/`
      const current = this.currentTab
      if (current == null) {
         console.log(`❌ currentTabIs(...): current is null`)
         return null
      }
      const type = current.getType()
      const id = current.getId()
      if (type !== 'tab') {
         console.log(`❌ currentTabIs(...): current is not a tab`)
         return null
      }
      if (!id.startsWith(tabPrefix)) {
         console.log(`❌ currentTabIs(...): "${id}" does not start with ${tabPrefix}`)
         return null
      }
      const config: PanelPersistedJSON<Panels[K]['$Props']> = (current as FL.TabNode).getConfig()
      return config.$props
   }

   findTabsFor = <K extends PanelName>(
      component: K,
   ): {
      //
      tabNode: FL.TabNode
      props: Panels[K]['$Props']
   }[] => {
      const tabPrefix = `/${component}/`
      const tabs: FL.TabNode[] = []
      this.model.visitNodes((node) => {
         const id = node.getId()
         const type = node.getType()
         if (type === 'tab' && id.startsWith(tabPrefix)) tabs.push(node as FL.TabNode)
      })
      const out = tabs
         .filter((tab) => tab.getId().startsWith(tabPrefix))
         .map((tab) => {
            type Props = PropsOf<Panels[K]['widget']>
            const config: PanelPersistedJSON<Props> = tab.getConfig()
            const props: Props = bang(config.$props) // config /* hack */
            return { props, tabNode: tab }
         })
      return out
   }

   /** practical way to keep a tab properly named (synced with it's content) */
   syncTabTitle<const K extends PanelName>(
      //
      panelName: K,
      props: PropsOf<Panels[K]['widget']>,
      title: string,
   ): void {
      const tabID = `/${panelName}/${hashJSONObjectToNumber(props ?? {})}`
      const tab = this.model.getNodeById(tabID)
      if (tab == null) return
      runInAction(() => {
         this.model.doAction(Actions.renameTab(tabID, title || panelName))
      })
   }

   // TRAVERSAL CAPABILITIES --------------------------------------------------------

   /** traverse layout tree from the root */
   traverse(fns: TraverseFn): void {
      const root: FL.RowNode = this.model.getRoot()
      traverseLayoutNode(root, fns)
   }

   /** traverse layout tree from a specific node */
   traverseLayoutNode(node: FL.Node, fns: TraverseFn): void {
      return traverseLayoutNode(node, fns)
   }

   /** fix all tabs that have negative size */
   fixTabsWithNegativeArea(): void {
      const root: FL.RowNode = this.model.getRoot()
      const minHeight = 100
      const minWidth = 100
      traverseLayoutNode(root, {
         onNode1: (node): undefined => {
            // console.log(`[🤠] `, node.getId(), node.getType(), node.getRect())
            const rect = node.getRect()
            if (rect.width < minWidth) {
               console.log(`[🔴] invalid ${node.getType()} width`, JSON.stringify(node.toJson(), null, 4))
            }
            if (rect.height < minHeight) {
               console.log(`[🔴] invalid ${node.getType()} height`, JSON.stringify(node.toJson(), null, 4))
            }
            return
         },
      })
   }

   // CREATION --------------------------------------------------------
   // clone = <PANEL_NAME extends PanelName>(
   //     panelState: PanelState,
   //     panelName: PANEL_NAME,
   //     panelProps: PropsOf<Panels[NoInfer<PANEL_NAME>]['widget']>,
   // ): void => {
   //     if (panelState.getConfig)
   // }

   open = <PANEL_NAME extends PanelName>(
      panelName: PANEL_NAME,
      panelProps: PropsOf<Panels[NoInfer<PANEL_NAME>]['widget']>,
      conf: {
         /**
          * you can specify where to open the panel,
          * relative to the currently active one
          * @default 'right'
          */
         where?: PanelPlacement
         /**
          * allow to specify whether the placement specified should be
          * relative to the `active` or the `focused` tab
          * @default 'active'
          */
         relativeTo?: 'active' | 'hovered'

         /**
          * allow to pre-fill the panel $store data
          * notably usefull when cloning a tab
          * 🔶 YOU NEED TO DEEP-CLONE the object if needed BEFORE
          */
         $store?: any

         /**
          * allow to pre-fill the panel $store data
          * notably usefull when cloning a tab
          * 🔶 YOU NEED TO DEEP-CLONE the object if needed BEFORE
          */
         $temp?: any
      } = {},
   ): Maybe<FL.Node> => {
      // 1. retrieve the layout model
      const currentLayout = this.layoutRef.current
      if (currentLayout == null) return void console.log('❌ no currentLayout')

      // 2. compute unique URI for panel
      const panelURI = `/${panelName}/${hashJSONObjectToNumber(panelProps ?? {})}`

      // 3. find possibly existing panel with same URI
      let prevTab: FL.TabNode | undefined
      prevTab = this.model.getNodeById(panelURI) as FL.TabNode // 🔴 UNSAFE ?

      // 4. create panel if no
      if (prevTab == null) {
         const tabsetIDToAddThePanelTo = ((): TabsetID => {
            // case biggest
            if (conf.where === 'biggest') {
               return this.biggestTabset?.getId() ?? this.getActiveOrFirstTabset_orThrow().getId()
            }

            if (conf.where === 'biggest-except-current') {
               return ( this.biggestTabsetExceptCurrent?.getId() ?? this.getActiveOrFirstTabset_orThrow().getId() ) // prettier-ignore
            }

            if (conf.where === 'biggest-similar') {
               const similarTabs = this.findTabsFor(panelName)
               if (similarTabs.length === 0) {
                  console.log(`[📛] did not find any other tab similar to target '${panelName}'`)
                  return this.getActiveOrFirstTabset_orThrow().getId()
               }
               let maxTabesetArea = -1
               let bestTabset = null
               for (const tab of similarTabs) {
                  const tabset = tab.tabNode.getParent() as FL.TabSetNode
                  if (tabset == null) continue
                  const rect = tabset.getRect()
                  const area = rect.width * rect.height
                  if (area > maxTabesetArea) {
                     maxTabesetArea = area
                     bestTabset = tabset
                  }
               }
               return bestTabset?.getId() ?? this.getActiveOrFirstTabset_orThrow().getId()
            }

            // if (conf.where === 'right') throw new Error('❌ not implemented yet')
            // if (conf.where === 'left') throw new Error('❌ not implemented yet')
            if (conf.where === 'below') {
               throw new Error('❌ not implemented yet')
               // const tabset = this.getActiveOrFirstTabset_orThrow()
               // const parent = tabset.getParent()
               // if (parent == null) return tabset.getId()
               // const children = parent.getChildren()
               // const selfX = children.indexOf(tabset)
               // return children[selfX + 1]?.getId() ?? tabset.getId()
            }

            // case current
            if (
               conf.where === 'current' || //
               conf.where == null
            ) {
               return this.getActiveOrFirstTabset_orThrow().getId()
            }

            // exhaust(conf.where)

            // temporary catch-all until we're done implementing
            // all `where` options
            return this.getActiveOrFirstTabset_orThrow().getId()
         })()

         const panel = panels[panelName]
         console.log('⁉️', panels, panelName, panel)
         const { title } = panel.header(panelProps as any)
         const icon = panel.icon
         const config: PanelPersistedJSON = {
            $props: panelProps ?? {},
            $store: conf.$store ?? {},
            $temp: conf.$temp ?? {},
         }
         const addition = currentLayout.addTabToTabSet(tabsetIDToAddThePanelTo, {
            component: panelName,
            id: panelURI,
            icon: getIconAsDataSVG(icon),
            name: title,
            config,
         })
         prevTab = this.model.getNodeById(panelURI) as FL.TabNode // 🔴 UNSAFE ?
         if (prevTab == null) {
            console.log(`[🧐] addition:`, addition, {
               component: panelName,
               tabID: panelURI,
               icon,
               title,
               props: panelProps,
            })
            this.prettyPrintLayoutModel()
            return void console.log('❌ no new tab')
         }
      }
      if (conf.where === 'below') {
         this.do((t) =>
            t.moveNode(
               //
               panelURI,
               prevTab.getParent()!.getId(),
               FL.DockLocation.BOTTOM,
               -1,
               true,
            ),
         )
      }
      // 5. update panel if it already exists
      else {
         const prevConfig: PanelPersistedJSON = prevTab.getConfig()
         const nextConfig = { ...prevConfig, $props: panelProps }
         this.model.doAction(Actions.updateNodeAttributes(panelURI, { config: nextConfig }))
         this.model.doAction(Actions.selectTab(panelURI))
      }

      // 4. merge props
      // this.model.doAction(Actions.updateNodeAttributes(tabID, /* 🔴 */ panelProps))
      return prevTab
   }

   /**
    * @experimental
    * @unstable
    */
   addCustom<T extends any>(panel: CustomPanelRef<any, T>, props: T): void {
      this.open('Custom', { uid: panel.uid, props })
   }

   /**
    * @experimental
    * @unstable
    */
   addCustomV2<T extends any>(fn: FC<T>, props: T): void {
      const uid = uniqueIDByMemoryRef(fn)
      const panel = registerCustomPanel(uid, fn)
      this.open('Custom', { uid: panel.uid, props })
   }

   factory(node: FL.TabNode): React.ReactNode {
      // 1. get panel name
      const panelName = node.getComponent() as Maybe<PanelName>
      if (panelName == null)
         return (
            <LegacyMessageUI type='error' showIcon>
               no panel (TabNode.getComponent())
            </LegacyMessageUI>
         )

      // 2. get panel props
      const panelConfig: PanelPersistedJSON = node.getConfig()
      const panelProps = bang(panelConfig.$props) // panelConfig /* 🔴 HACKY backward config */

      // temporary assertions; to be removed when we're sure there is no more wrong config
      if ('$props' in panelProps) throw new Error('❌ $props in panelProps')
      if ('$store' in panelProps) throw new Error('❌ $store in panelProps')
      if ('$temp' in panelProps) throw new Error('❌ $temp in panelProps')

      if (panelProps == null)
         return (
            <LegacyMessageUI type='error' showIcon>
               no panel props (TabNode.getConfig().$props)
            </LegacyMessageUI>
         )

      return createElement(PanelContainerUI, {
         flexLayoutTabNode: node,
         panelName,
         panelProps,
      })
   }
}
