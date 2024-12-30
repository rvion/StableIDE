import { observer } from 'mobx-react-lite'

import { AppIllustrationUI } from '../../cards/fancycard/AppIllustrationUI'
import { Button } from '../../csuite/button/Button'
import { Frame } from '../../csuite/frame/Frame'
import { Ikon } from '../../csuite/icons/iconHelpers'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { CreateAppPopupUI } from '../../panels/PanelWelcome/CreateAppBtnUI'
import { AppDraftsQuickListUI } from './AppDraftsQuickListUI'

export const FavBarUI = observer(function FavBarUI_(p: { direction?: 'row' | 'column' }) {
   const conf = cushy.preferences.interface.value.favBar
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
            base={cushy.preferences.theme.value.appbar ?? { contrast: -0.077 }}
            tw='flex overflow-auto px-1'
            // style={{ width: `${size + 20}px` }}
         >
            <Frame //
               base={{ contrast: -0.1 }}
               tw='flex flex-1 flex-grow flex-col overflow-auto p-1 '
               roundness={'5px'}
            >
               <Button
                  //
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='SD1.5'
                  // base={{ hue: 0, chromaBlend: 2, contrast: 0.2 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() => cushy.layout.open('PanelAppLibrary', {})}
               >
                  <Ikon.mdiApps style={{ fontSize: '8rem' }} />
               </Button>
               {/* <PanelHeaderUI>{conf.renderAsConfigBtn()}</PanelHeaderUI> */}
               <Button
                  //
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='SD1.5'
                  base={{ hue: 0, chromaBlend: 2, contrast: 0.2 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SD15/cushySD15.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>SD1.5</span>
               </Button>
               <Button
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='SDXL'
                  base={{ hue: 90, chromaBlend: 2, contrast: 0.2 }}
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
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='NoobAI'
                  base={{ hue: 90, chromaBlend: 2, contrast: 0.2 }}
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
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='SD3'
                  base={{ hue: 180, chromaBlend: 2, contrast: 0.2 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/SD3/cushySD3.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>SD3</span>
               </Button>
               <Button
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center truncate'
                  tooltip='Cascade'
                  base={{ hue: 210, chromaBlend: 2, contrast: 0.2 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() => cushy.db.cushy_app.get('library/built-in/Cascade/cushyCascade.ts:0')?.openLastOrCreateDraft()} // prettier-ignore
               >
                  <span tw='truncate'>Cascade</span>
               </Button>
               <Button
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  tooltip='FLUX'
                  base={{ hue: 270, chromaBlend: 2, contrast: 0.2 }}
                  style={{ width: tempSize, height: tempSize }}
                  onClick={() =>
                     cushy.db.cushy_app.get('library/built-in/Flux/cushyFlux.ts:0')?.openLastOrCreateDraft()
                  }
               >
                  <span tw='truncate'>FLUX</span>
               </Button>
               <Button
                  tooltip='Slay the Spire Card Generator'
                  tw='my-0.5 flex flex-shrink-0 items-center justify-center self-center'
                  base={{ hue: 270, chromaBlend: 2, contrast: 0.2 }}
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
                     tw='flex-shrink-0 content-center items-center'
                     icon='mdiPlus'
                     iconSize={tempSize}
                  />
               </RevealUI>
               {/* Lot of divs, but it makes it so the scrolling container is rounded on the inside. */}

               {/* ------------------------------------------------------------------------ */}
               {cushy.favoriteApps.length > 0 && (
                  <>
                     {cushy.favoriteApps.map((app) => (
                        <Frame
                           border={20}
                           tooltip={app.name}
                           roundness={cushy.preferences.theme.value.global.roundness}
                           key={app.id}
                           style={{ width: tempSize, height: tempSize }}
                           tw='flex overflow-clip object-contain'
                        >
                           <RevealUI
                              // showDelay={0}
                              trigger='click'
                              placement='right'
                              content={() => <AppDraftsQuickListUI app={app} />}
                              shell='popover'
                           >
                              <AppIllustrationUI //
                                 className={'!rounded-none'}
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
