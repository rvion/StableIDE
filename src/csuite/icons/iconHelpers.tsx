import type { FC } from 'react'

import * as IconImport from '@mdi/react'

import { allIcons, type IconName } from './icons'

const Icon = IconImport.Icon

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RawIconProps = import('@mdi/react/dist/IconProps.d.ts').IconProps
type MyIconProps = Omit<RawIconProps, 'path'>

/**
 * Automagical component you can use like that
 * <Ikon.mdiCancel />
 * <Ikon.mdiAlert size=' />
 */

export const Ikon: {
   [key in keyof typeof allIcons]: FC<MyIconProps>
} = new Proxy({} as any, {
   get(target, key): React.FC<MyIconProps> {
      if (key in target) return target[key]
      return (target[key] = (p: any): React.JSX.Element => (
         <Icon path={(allIcons as any)[key]} size='1.1em' {...p} />
      ))
   },
}) as any

/** reexport Icon from `@mdi/react` and add siz='1.1em' */
export const IkonOf = function IkonOf_({
   name,
   size,
   ...p
}: { name: IconName } & MyIconProps): React.JSX.Element {
   return (
      <Icon //
         path={(allIcons as any)[name]}
         size={size ?? '1.1em'}
         {...p}
      />
   )
}
