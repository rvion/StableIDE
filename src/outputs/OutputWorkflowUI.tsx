import type { ComfyWorkflowL } from '../models/ComfyWorkflow'
import type { StepL } from '../models/Step'

import { observer } from 'mobx-react-lite'

import { MenuItem } from '../csuite/dropdown/MenuItem'
import { Frame } from '../csuite/frame/Frame'
import { RevealUI } from '../csuite/reveal/RevealUI'
import { DrawWorkflowUI } from '../widgets/graph/DrawWorkflowUI'
import { GraphPreviewUI } from '../widgets/graph/GraphPreviewUI'
import { ButtonOpenInComfyUI } from '../widgets/workspace/ButtonOpenInComfyUI'

export const OutputWorkflowPreviewUI = observer(function OutputWorkflowUI_(p: {
   step?: Maybe<StepL>
   output: ComfyWorkflowL
}) {
   const size = cushy.historySizeStr
   const graph = p.output
   return (
      // <RevealUI showDelay={0} hideDelay={100}>

      <RevealUI
         className='item-center size-full justify-center'
         trigger={'rightClick'}
         content={() => (
            <ul tabIndex={0} tw='menu dropdown-content rounded-box z-[1]  shadow'>
               {/* <ImageDropdownMenuUI img={image} /> */}
               <MenuItem //
                  icon={'mdiOpenInNew'}
                  onClick={graph.menuAction_openInTab}
                  label='open in ComfyUI Tab'
               />
               <MenuItem //
                  icon={'mdiOpenInApp'}
                  onClick={graph.menuAction_openInFullScreen}
                  label='open in ComfyUI FULL'
               />
               <div className='divider my-0'></div>
               <MenuItem //
                  icon={'mdiCloud'}
                  onClick={graph.menuAction_downloadWorkflow}
                  label='Download ComfyUI Workflow'
               />
               <MenuItem //
                  icon={'mdiDownloadLock'}
                  onClick={graph.menuAction_downloadPrompt}
                  label='Download ComfyUI PROMPT'
               />
               <div className='divider my-0'>Quick Graph preview</div>
               <GraphPreviewUI graph={graph} />
               <ButtonOpenInComfyUI graph={p.output} />
            </ul>
         )}
      >
         <Frame //
            square
            icon='cdiNodes'
            iconSize='80%'
            tooltip='Workflow'
         />
      </RevealUI>
   )
})

export const OutputWorkflowUI = observer(function OutputWorkflowUI_(p: {
   step?: Maybe<StepL>
   output: ComfyWorkflowL
}) {
   const graph = p.output
   // const litegraphK = Kwery.get('cyto', { id: graph.id }, () => graph?.json_workflow())
   return (
      // <TabUI tw='w-full h-full'>
      // <div>Simple View</div>
      <div tw='h-full w-full'>
         {/* <div>
                    <ButtonDownloadFilesUI graph={graph} />
                    <ButtonOpenInComfyUI graph={graph} />
                </div> */}
         <div tw='text-sm italic opacity-50'>graphID: {graph.id}</div>
         {/* <GraphPreviewUI graph={graph} /> */}
         <DrawWorkflowUI //
            // offset={isDragging ? { x: dx, y: dy } : undefined}
            workflow={graph}
         />
      </div>
      // {/* <div>ComfyUI</div>
      // {litegraphK.ui((json) => (
      //     <Panel_ComfyUI //
      //         tw='w-full h-full'
      //         litegraphJson={json}
      //     />
      // ))} */}
      // </TabUI>
   )
})

// onClick={async () => {
//     const graph = st.db.graphs.get(p.output.graphID)
//     if (graph == null) return // 🔴
//     const litegraphJson = await graph.json_workflow()
//     st.layout.FOCUS_OR_CREATE('ComfyUI', { litegraphJson })
// }}
// <OutputWorkflowUI step={p.step} output={p.output} />
