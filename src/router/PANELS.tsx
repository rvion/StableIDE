import type { Panel } from './Panel'

import { PanelAppLibrary } from '../panels/AppLibrary/AppLibrary'
import { PanelScript } from '../panels/Panel_Script'
import { PanelSquoosh } from '../panels/Panel_Squoosh'
import { PanelAssets } from '../panels/PanelAssets/PanelAssets'
import { PanelCanvas } from '../panels/PanelCanvas/PanelCanvas'
import { PanelCaptioning } from '../panels/PanelCaptioning/PanelCaptioning'
import { PanelCivitai } from '../panels/PanelCivitai/Panel_Civitai'
import { PanelComfy } from '../panels/PanelComfy/PanelComfy'
import { PanelComfyHosts } from '../panels/PanelComfyHosts/PanelComfyHosts'
import { PanelComfyNodeExplorer } from '../panels/PanelComfyNodeExplorer/PanelComfyNodeExplorer'
import { PanelCustom } from '../panels/PanelCustom/PanelCustom'
import { PanelDraft } from '../panels/PanelDraft/PanelDraft'
import { PanelDraftSerial } from '../panels/PanelDraftSerial/PanelDraftSerial'
import { PanelDraftValue } from '../panels/PanelDraftValue/PanelDraftValue'
import { PanelGallery } from '../panels/PanelGallery/PanelGallery'
import { PanelIcon } from '../panels/PanelIcons/PanelIcons'
import { PanelIframe } from '../panels/PanelIFrame/PanelIFrame'
import { PanelImport } from '../panels/PanelImport/PanelImport'
import { PanelLastGraph } from '../panels/PanelLastGraph/PanelLastGraph'
import { PanelLastStep } from '../panels/PanelLastStep/PanelLastStep'
import { PanelMarketplace } from '../panels/PanelMarketplace/Panel_Marketplace'
import { PanelMinipaint } from '../panels/PanelMinipaint/PanelMinipaint'
import { PanelModels } from '../panels/PanelModels/PanelModels'
import { PanelStep } from '../panels/PanelOutput/PanelOutput'
import { PanelPlayground } from '../panels/PanelPlayground/PanelPlayground'
import { PanelPreferences } from '../panels/PanelPreferences/PanelPreferences'
import { PanelSafetyRatings } from '../panels/PanelSafetyRatings/PanelSafetyRatings'
import { PanelShortcuts } from '../panels/PanelShortcuts/PanelShortcuts'
import { PanelSteps } from '../panels/PanelSteps/PanelSteps'
import { PanelTreeExplorer } from '../panels/PanelTreeExplorer/PanelTreeExplorer'
import { PanelLastImage, PanelViewImage } from '../panels/PanelViewImage/Panel_ViewImage'
import { PanelWelcome } from '../panels/PanelWelcome/PanelWelcome'

export const panels = {
   Assets: PanelAssets,
   // Image
   Gallery: PanelGallery,
   Paint: PanelMinipaint,
   Canvas: PanelCanvas,
   Image: PanelViewImage,
   SafetyRatings: PanelSafetyRatings,

   // apps & marketplace
   Marketplace: PanelMarketplace,
   TreeExplorer: PanelTreeExplorer,
   Import: PanelImport,

   // ComfyUI
   ComfyUI: PanelComfy,
   'ComfyUI Node Explorer': PanelComfyNodeExplorer,

   // misc
   Output: PanelStep,
   Steps: PanelSteps,
   LastGraph: PanelLastGraph,
   LastImage: PanelLastImage,
   LastStep: PanelLastStep,
   Custom: PanelCustom,

   // App
   Welcome: PanelWelcome,
   PanelAppLibrary: PanelAppLibrary,

   // Draft
   Draft: PanelDraft,
   DraftJsonResult: PanelDraftValue,
   DraftJsonSerial: PanelDraftSerial,
   Script: PanelScript,

   // DevTools
   Icons: PanelIcon,
   Playground: PanelPlayground,

   // iframe utils
   IFrame: PanelIframe,
   Civitai: PanelCivitai,
   Squoosh: PanelSquoosh,

   // config
   Config: PanelPreferences,
   Models: PanelModels,
   Hosts: PanelComfyHosts,
   Shortcuts: PanelShortcuts,

   // Dataset Handling
   Captioning: PanelCaptioning,
} satisfies { [k in string]: Panel<any> }

export const allPanels: Panel<any>[] = Object.values(panels)

export type Panels = typeof panels
export type PanelName = keyof Panels
