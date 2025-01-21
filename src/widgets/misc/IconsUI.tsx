// https://fonts.google.com/icons

import { IconUI } from './IconUI'

export const FolderIcon = (p: { isOpen?: boolean }): React.JSX.Element =>
   p.isOpen ? ( //
      <IconUI icon='expand_more' color='e8a87c' />
   ) : (
      <IconUI icon='chevron_right' color='e8a87c' />
   )

export const FileIcon = (p: { filename: string }): React.JSX.Element | null => {
   const filename = p.filename
   const extension = filename.slice(filename.lastIndexOf('.') + 1)
   // prettier-ignore
   switch (extension) {
        case 'js': return <IconUI icon='Javascript' color='yellow' />
        case 'css': return <IconUI icon='css3' color='turquoise' />
        case 'json': return <IconUI icon='list' color='yellow' />
        case 'npmignore': return <IconUI icon='npm' color='red' />
        default: return null
    }
}
