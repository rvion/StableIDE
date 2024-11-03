import type { CushyAppL } from '../../models/CushyApp'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'
import { useState } from 'react'

import { AppIllustrationUI } from '../../cards/fancycard/AppIllustrationUI'
import { DraftIllustrationUI } from '../../cards/fancycard/DraftIllustration'
import { Button } from '../../csuite/button/Button'
import { Frame } from '../../csuite/frame/Frame'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { CreateAppPopupUI } from '../../panels/PanelWelcome/CreateAppBtnUI'
import { useSt } from '../../state/stateContext'

// Could give this an option be collapsible in the future?
/** Re-usable container to keep a consistent style around groups of buttons */
const FavBarContainer = observer(function FavBarContainer_(p: { children?: ReactNode }) {
   return (
      <div // Favorite app container
         tw={[
            //
            'flex w-full flex-col rounded',
            'items-center  justify-center gap-1 p-1 text-center',
         ]}
      >
         {p.children}
      </div>
   )
})

export const FavBarUI = observer(function FavBarUI_(p: {
   //
   direction?: 'row' | 'column'
}) {
   const st = useSt()
   const conf = st.preferences.interface.value.favBar
   // 💬 2024-09-29 rvion:
   // | temporarilly always display the favbar
   // |
   // |> if (!conf.visible) return null

   const size = conf.size
   const appIcons = conf.appIcons
   const sizeStr = size + 'px'
   const tempSize = `${size}px`

   const ree = ['1', '2', '3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2', '3', '4', '5', '6']
   return (
      <>
         <Frame //
            base={cushy.theme.value.appbar ?? { contrast: -0.077 }}
            tw='flex overflow-auto px-1'
            // style={{ width: `${size + 20}px` }}
         >
            <Frame //
               base={{ contrast: -0.1 }}
               tw='flex flex-grow flex-1 flex-col overflow-auto p-1'
               roundness={'5px'}
            >
               {/* <PanelHeaderUI>{conf.renderAsConfigBtn()}</PanelHeaderUI> */}
               <Button
                  //
                  tw='my-0.5 flex items-center justify-center self-center'
                  tooltip='SD1.5'
                  base={{ hue: 0, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SD15/cushySD15.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>SD1.5</span>
               </Button>
               <Button
                  tw='my-0.5 flex items-center justify-center self-center'
                  tooltip='SDXL'
                  base={{ hue: 90, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SDXL/cushySDXL.tsx:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>SDXL</span>
               </Button>
               {/* <AppIllustrationUI //
                        // className={'!rounded-none'}
                        size={tempSize}
                        app={cushy.db.cushy_app.get('library/built-in/SDXL/cushySDXL.tsx:1')}
                    /> */}
               <Button
                  tw='my-0.5 flex items-center justify-center self-center'
                  tooltip='NoobAI'
                  base={{ hue: 90, chromaBlend: 2, contrast: 0.3 }}
                  style={{
                     width: tempSize,
                     height: tempSize,
                     background: `url(${cushy.db.cushy_app.get('library/built-in/SDXL/cushySDXL.tsx:1')?.illustrationPathWithFileProtocol})`,
                     backgroundSize: 'cover',
                     textShadow: '0 1px 10px black',
                     fontWeight: 'bold',
                     color: 'white',
                     fontSize: '1rem',
                  }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SDXL/cushySDXL.tsx:1')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>NoobAI</span>
               </Button>
               <Button
                  tw='my-0.5 flex items-center justify-center self-center'
                  tooltip='SD3'
                  base={{ hue: 180, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SD3/cushySD3.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>SD3</span>
               </Button>
               <Button
                  tw='my-0.5 flex items-center justify-center self-center truncate'
                  tooltip='Cascade'
                  base={{ hue: 210, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() => cushy.db.cushy_app.get('library/built-in/Cascade/cushyCascade.ts:0')?.openLastOrCreateDraft()} // prettier-ignore
               >
                  <span tw='truncate'>Cascade</span>
               </Button>
               <Button
                  tw='my-0.5 flex items-center justify-center self-center'
                  tooltip='FLUX'
                  base={{ hue: 270, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/Flux/cushyFlux.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>FLUX</span>
               </Button>
               <Button
                  tooltip='Slay the Spire Card Generator'
                  tw='my-0.5 flex items-center justify-center self-center'
                  base={{ hue: 270, chromaBlend: 2, contrast: 0.3 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app
                        .get('library/built-in/sts/slay-the-spire.ts:0')
                        ?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>StS</span>
               </Button>
               <RevealUI
                  tw='my-0.5 self-center hover:brightness-125'
                  placement='screen-top'
                  UNSAFE_cloned={true}
                  shell='popup-lg'
                  content={(x) => <CreateAppPopupUI closeFn={() => x.reveal.close()} />}
               >
                  <Button
                     square
                     style={{ width: tempSize, height: tempSize, fontSize: sizeStr }}
                     tw='content-center items-center'
                     icon='mdiPlus'
                     iconSize={tempSize}
                  />
               </RevealUI>
               {/* Lot of divs, but it makes it so the scrolling container is rounded on the inside. */}

               {/* ------------------------------------------------------------------------ */}
               {st.favoriteApps.length > 0 && (
                  <>
                     {st.favoriteApps.map((app) => (
                        <Frame
                           border={20}
                           hover
                           tooltip={app.name}
                           // tw='rounded border border-base-300 overflow-clip box-content'
                           key={app.id}
                           style={{ width: tempSize, height: tempSize }}
                        >
                           <RevealUI
                              showDelay={0}
                              trigger='hover'
                              placement='right'
                              content={() => <AppDraftsQuickListUI app={app} />}
                           >
                              <AppIllustrationUI //
                                 className={'!rounded-none'}
                                 size={tempSize}
                                 app={app}
                              />
                           </RevealUI>
                        </Frame>
                     ))}
                  </>
               )}
               {/* ------------------------------------------------------------------------ */}
            </Frame>
         </Frame>
      </>
   )
})

export const AppDraftsQuickListUI = observer(function AppDraftsQuickListUI_(p: { app: CushyAppL }) {
   const app = p.app

   const [filterText, setFilterText] = useState<string>('')

   const filteredApps =
      filterText === ''
         ? app.drafts
         : app.drafts.filter((draft) => {
              return draft.name.toLowerCase().indexOf(filterText) != -1
           })
   return (
      <div className='MENU-ROOT'>
         <div className='MENU-HEADER'>
            <Button
               tw={[app.isFavorite ? '!text-yellow-500' : null, '!peer-hover:text-red-500']}
               onClick={() => app.setFavorite(!app.isFavorite)}
               icon='mdiStar'
               square
            />
            <div tw='border-base-100 flex-1 flex-grow content-center justify-center border-l border-r pt-1 text-center'>
               {app.name}
            </div>
            <Button //
               onClick={() => app.createDraft()}
               size='sm'
               icon='mdiPlus'
               square
            />
         </div>
         <div className='MENU-CONTENT' tw='flex max-w-md flex-col gap-1'>
            {app.description ? (
               <div //Description
                  tw='flex-1 rounded p-1 text-sm italic'
               >
                  {app.description}
               </div>
            ) : null}
            <div //App Grid Container
               tw='flex-col rounded p-2'
            >
               <div //Filter Input
                  tw='flex rounded pb-2'
               >
                  <input
                     tw='csuite-basic-input w-full rounded-r-none'
                     value={filterText}
                     onChange={(ev) => setFilterText(ev.currentTarget.value)}
                     placeholder='Filter Drafts'
                  ></input>
                  <Button icon='mdiCancel' onClick={(ev) => setFilterText('')}></Button>
               </div>
               <div //App Grid Container
                  tw='grid max-h-96 grid-cols-3 gap-2 overflow-scroll'
               >
                  {filteredApps.map((draft) => (
                     <div
                        key={draft.id}
                        tw='border-base-100 flex cursor-pointer justify-center rounded-md border p-1 brightness-95 hover:brightness-110'
                     >
                        <div key={draft.id} onClick={() => draft.openOrFocusTab()}>
                           <div tw='flex justify-center self-center p-1 text-center'>
                              <DraftIllustrationUI size='8rem' draft={draft} />
                           </div>
                           <div tw='max-w-32 overflow-clip truncate text-center text-sm'>{draft.name}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   )
})
