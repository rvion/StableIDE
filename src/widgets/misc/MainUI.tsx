import type { DragDropManager } from 'dnd-core'

import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { DndProvider, useDragDropManager } from 'react-dnd'
import { ToastContainer } from 'react-toastify'

import { CushyUI } from '../../app/layout/AppUI'
// import { withMobxSpy } from '../../csuite/utils/withSpy'
// import { TargetBox } from '../../importers/TargetBox'
import { STATE } from '../../state/state'
import { asAbsolutePath } from '../../utils/fs/pathUtils'

// import { useGlobalDropHook } from './useGlobalDropHook'

const path = asAbsolutePath(process.cwd())

export const MainUI = observer(function MainUI_() {
   const dragDropManager: DragDropManager = useDragDropManager()
   const st = useMemo(() => runInAction(() => new STATE(path, dragDropManager)), [])
   // useGlobalDropHook(st)
   return (
      <>
         <ToastContainer />
         {/* <TargetBox> */}
         <CushyUI />
         {/* </TargetBox> */}
      </>
   )
})
