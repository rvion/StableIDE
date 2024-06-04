import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'

import { SQLITE_false, SQLITE_true } from '../../db/SQLITE_boolean'
import { HostL } from '../../models/Host'
import { Button } from '../../rsuite/button/Button'
import { InputBoolUI } from '../../rsuite/checkbox/InputBoolUI'
import { useSt } from '../../state/stateContext'
import { LabelUI } from '../LabelUI'
import { HostSchemaIndicatorUI } from './HostSchemaIndicatorUI'
import { HostWebsocketIndicatorUI } from './HostWebsocketIndicatorUI'

export const HostUI = observer(function MachineUI_(p: { host: HostL }) {
    const st = useSt()
    const config = st.configFile.value
    const host: HostL = p.host
    const isMain = host.id === config.mainComfyHostID
    const disabled = host.data.isVirtual ? true : false
    return (
        <div
            tw={[
                //
                'virtualBorder',
                'p-2 w-96 shadow-xl',
                isMain && 'bg-primary bg-opacity-30',
            ]}
        >
            {/* {host.data.isReadonly ? (
                <div tw='bg-secondary text-secondary-content p-0.5 opacity-50'>Readonly Host (Built-in)</div>
            ) : (
                <Box base={5} tw='p-0.5'>Custom Host</Box base={5}>
            )} */}
            <div tw='flex gap-1'>
                <HostWebsocketIndicatorUI showIcon host={host} />
                {host.data.isVirtual ? (
                    <div tw='bg-info text-info-content p-0.5 opacity-50'>Virtual Host (Types Only)</div>
                ) : (
                    <HostSchemaIndicatorUI showIcon showSize host={host} />
                )}
            </div>

            <div className='p-2 flex flex-col gap-1'>
                {/* SELECT BTN */}
                <div tw='flex join gap-1'>
                    <Button look='primary' active={isMain} onClick={() => host.electAsPrimary()}>
                        Set Primary
                        {/* {host.data.name ?? `${host.data.hostname}:${host.data.port}`} */}
                    </Button>
                    <Button look='ghost' onClick={() => host.CONNECT()}>
                        {host.isConnected ? 'Re-Connect' : 'Connect'}
                    </Button>
                    <Button
                        icon='mdiDelete'
                        tw={['btn btn-outline btn-square btn-sm', host.isReadonly && 'btn-disabled']}
                        onClick={() => {
                            if (host.isReadonly) return
                            runInAction(() => {
                                host.schema.delete()
                                host.delete()
                            })
                            // st.configFile.update(() => {
                            //     if (config.mainComfyHostID === host.id) config.mainComfyHostID = null
                            //     const index = config.comfyUIHosts?.indexOf(host)
                            //     if (index != null) config.comfyUIHosts?.splice(index, 1)
                            // })
                        }}
                    ></Button>
                </div>

                {/* <div tw='divider m-1'></div> */}
                {/* <div tw='font-bold under'>Configuration</div> */}
                {/* NAME */}
                <div tw='flex gap-1 items-center'>
                    <div tw='w-14'>name</div>
                    <input
                        disabled={disabled}
                        tw='cushy-basic-input w-full'
                        onChange={(ev) => host.update({ name: ev.target.value })}
                        value={host.data.name ?? 'unnamed'}
                    ></input>
                </div>

                {/* HOST */}
                <div tw='flex gap-1 items-center'>
                    <div tw='w-14'>Host</div>
                    <input
                        disabled={disabled}
                        tw='cushy-basic-input w-full' //
                        onChange={(ev) => host.update({ hostname: ev.target.value })}
                        value={host.data.hostname ?? ''}
                    ></input>
                </div>

                {/* PORT */}
                <div tw='flex gap-1 items-center'>
                    <div tw='w-14'>Port</div>
                    <input
                        disabled={disabled}
                        tw='cushy-basic-input w-full' //
                        value={host.data.port ?? 8188}
                        onChange={(ev) => {
                            const next = ev.target.value
                            host.update({ port: parseInt(next, 10) })
                        }}
                    ></input>
                </div>

                <InputBoolUI // HTTPS
                    disabled={disabled}
                    value={host.data.useHttps ? true : false}
                    onValueChange={(next) => host.update({ useHttps: next ? SQLITE_true : SQLITE_false })}
                    text='use HTTPS'
                />
                <InputBoolUI // LOCAL PATH
                    disabled={disabled}
                    onValueChange={(next) => host.update({ isLocal: next ? SQLITE_true : SQLITE_false })}
                    value={host.data.isLocal ? true : false}
                    text='Is local'
                />

                <div tw='flex flex-col'>
                    <LabelUI>absolute path to ComfyUI install folder</LabelUI>
                    <input
                        disabled={disabled}
                        tw='cushy-basic-input w-full'
                        type='string'
                        onChange={(ev) => host.update({ absolutePathToComfyUI: ev.target.value })}
                        value={host.data.absolutePathToComfyUI ?? ''}
                    ></input>
                </div>
                <div tw='flex flex-col'>
                    <LabelUI>Absolute path to model folder</LabelUI>
                    <input
                        tw='cushy-basic-input w-full'
                        type='string'
                        disabled={disabled}
                        onChange={(ev) => host.update({ absolutPathToDownloadModelsTo: ev.target.value })}
                        value={host.data.absolutPathToDownloadModelsTo ?? ''}
                    ></input>
                </div>
                {/* ID */}
                <div tw='flex'>
                    <div tw='italic text-xs text-opacity-50'>id: {host.id}</div>
                </div>
                <Button
                    onClick={async () => {
                        const res = await host.manager.configureLogging(true)
                        console.log(`[🤠] res=`, res)
                    }}
                >
                    Forward logs via manager
                </Button>
            </div>
            {/* <div tw='divider m-1'></div> */}
            {/* <div tw='font-bold under'>Status</div> */}
            {/* STATUS */}
            {/* <div tw='flex gap-1'>
                <HostWebsocketIndicatorUI showIcon host={host} />
                <HostSchemaIndicatorUI showIcon showSize host={host} />
            </div> */}
            {/* <div>
                <div>isLoaded: {host.isConnected ? 'true' : 'false'}</div>
            </div> */}
            {/* STATUS */}
        </div>
    )
})
