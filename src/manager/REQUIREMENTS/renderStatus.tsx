import type { PluginInstallStatus } from './PluginInstallStatus'

export const renderStatus = (
   //
   status: PluginInstallStatus,
   optional: boolean,
   tailwind?: string | undefined,
): React.JSX.Element => {
   const tw = tailwind ?? ''
   if (status === 'installed') return <span tw={[tw, 'text-green-500']}>Installed</span>
   if (status === 'not-installed') {
      if (optional) return <span tw={[tw, 'text-yellow-500']}>optional</span>
      return <span tw={[tw, 'text-red-500']}>Required</span>
   }
   if (status === 'update-available') return <span tw={[tw, 'text-yellow-500']}>Update Available</span>
   if (status === 'unknown') return <span tw={[tw, 'text-gray-500']}>Unknown</span>
   if (status === 'error') return <span tw={[tw, 'text-red-500']}>❌ Error (a)</span>
   return <span tw={[tw, 'text-red-500']}>❌ Error (b)</span>
}
