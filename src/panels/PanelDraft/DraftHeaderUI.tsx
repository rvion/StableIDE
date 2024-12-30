import type { DraftL } from '../../models/Draft'

import { observer } from 'mobx-react-lite'

import { DraftIllustrationUI } from '../../cards/fancycard/DraftIllustration'
import { InputBoolCheckboxUI } from '../../csuite/checkbox/InputBoolCheckboxUI'
import { SpacerUI } from '../../csuite/components/SpacerUI'
import { Frame, type FrameProps } from '../../csuite/frame/Frame'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { PanelHeaderUI } from '../../csuite/panel/PanelHeaderUI'
import { SQLITE_false, SQLITE_true } from '../../csuite/types/SQLITE_boolean'
import { mergeStylesTsEfficient } from '../../csuite/utils/mergeStylesTsEfficient'
import { DraftMenuAppUI } from './DraftMenuAppUI'
import { DraftMenuDraftUI } from './DraftMenuDraftUI'
import { DraftMenuDataBlockUI } from './DraftMenuJump'
import { DraftMenuLooks } from './DraftMenuLooksUI'
import { RunOrAutorunUI } from './RunOrAutorunUI'

export const DraftHeaderUI = observer(function DraftHeader({
   // own props
   draft,

   // wrapped
   children,
   style,

   // rest
   ...rest
}: { draft: DraftL } & FrameProps) {
   const app = draft.appRef.item
   const theme = cushy.preferences.theme.value

   return (
      <Frame
         style={mergeStylesTsEfficient({ zIndex: 99 }, style)}
         tw='🔴test sticky top-0 z-50 flex shrink-0 flex-col overflow-clip'
         {...rest}
      >
         <PanelHeaderUI>
            <DraftMenuLooks.DropDownUI draft={draft} title={app.name} />
            {/* <DraftMenuLooksUI draft={draft} title={app.name} /> */}
            <DraftMenuAppUI draft={draft} />
            <DraftMenuDraftUI draft={draft} />
            <SpacerUI />
            {children}
            <SpacerUI />

            {/* <PublishAppBtnUI app={app} /> //Is in DraftMenuAppUI, no need for this */}
         </PanelHeaderUI>

         {/* <OverflowingRowUI // quick access to past versions
            row
            icon='mdiHistory'
            iconSize='1.25rem'
            tw='items-center gap-1'
         >
            {app.lastExecutedDrafts.map(({ id, title, lastRunAt }) => {
               return (
                  <Button
                     borderless
                     chroma={draft.id === id ? 0.15 : 0.04}
                     contrast={draft.id === id ? 0.15 : 0.04}
                     look='primary'
                     hue={hashStringToNumber(id)}
                     key={id}
                     onClick={() => cushy.db.draft.getOrThrow(id).openOrFocusTab()}
                  >
                     <div tw='flex items-center'>{title ?? id}</div>
                  </Button>
               )
            })}
         </OverflowingRowUI> */}
         <Frame tw='text-base-content flex w-full flex-grow gap-2 p-2' base={{ contrast: -0.025 }}>
            <DraftIllustrationUI
               revealAppIllustrationOnHover
               draft={draft}
               size={`${cushy.preferences.interface.value.inputHeight * 2.25}rem`}
               // size='3.69rem'
            />
            <div tw='flex flex-1 flex-col gap-2'>
               <Frame line>
                  <DraftMenuDataBlockUI draft={draft} title='Drafts' />
                  <RunOrAutorunUI tw='!h-full flex-grow' draft={draft} />
               </Frame>
               <div tw='flex items-center'>
                  <InputBoolCheckboxUI //
                     value={app.data.showInfo === SQLITE_true}
                     onValueChange={(v) => app.update({ showInfo: v ? SQLITE_true : SQLITE_false })}
                     toggleGroup='showInfo'
                     icon='mdiInformation'
                  >
                     Info
                  </InputBoolCheckboxUI>
                  <InputStringUI
                     icon='mdiHammerScrewdriver'
                     autoResize
                     getValue={() => draft.data.canvasToolCategory ?? ''}
                     setValue={(val) => draft.update({ canvasToolCategory: val ? val : null })}
                     placeholder='Unified Canvas Category'
                  />
                  {/* {cushy.preferences.theme.fields.labelLayout.renderSimple({ label: 'Label' })} */}
               </div>
            </div>
         </Frame>
      </Frame>
   )
})

// {/* ({formatSize(JSON.stringify(draft.data.formSerial).length)})  */}
// {/* ({formatSize(JSON.stringify(draft.data.formSerial, null, 3).length)}) */}
// {/* <SpacerUI /> */}
// {/* <div tw='flex justify-center'>
//     <Frame
//         // TODO(bird_d): We need a better way to "join" items together automatically. Possibly just move the tailwind from this? But with better handling of the inbetween borders.
//         tw={['flex [&>*]:rounded-none [&_*]:!border-none ']}
//         border={{ contrast: 0.1 }}
//     >
//         <Dropdown //
//             // tw={'flex-grow'}
//             title={false}
//             content={() => <>Not implemented</>}
//             button={
//                 <Button //
//                     tw={'w-full'}
//                     icon={'mdiApplication'}
//                     tooltip='Not Implemented'
//                 >
//                     {app.name}
//                 </Button>
//             }
//         />
//     </Frame>
// </div> */}
