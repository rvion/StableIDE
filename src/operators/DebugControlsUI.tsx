import { observer } from 'mobx-react-lite'

import { commandManager } from '../app/shortcuts/CommandManager'
import { regionMonitor } from './RegionMonitor'

export const DebugControlsUI = observer(function DebugControlsUI_(p: {}) {
    return (
        <div tw='flex gap-1 text-xs'>
            <div tw='text-green-500'>{regionMonitor.hoveredRegion?.type}</div>
            <div tw='text-yellow-500'>#{regionMonitor.hoveredRegion?.id ?? '0'}</div>
            <div tw='text-blue-500'>{regionMonitor.debugMods}</div>
            <div tw='text-gray-500'>...{commandManager.inputHistory.slice(-3).join(' ')}</div>
        </div>
    )
})
