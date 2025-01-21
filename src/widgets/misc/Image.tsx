export const Image = (p: {
   //
   onClick?: () => void
   height?: number | string
   width?: number | string
   fit?: 'cover' | 'contain'
   src?: Maybe<string>
   alt?: string
   className?: string
}): React.JSX.Element => {
   return (
      <img
         //
         onClick={p.onClick}
         src={p.src ?? ''}
         alt={p.alt}
         className={p.className}
         style={{
            objectFit: p.fit,
            height: renderSize(p.height),
            width: renderSize(p.width),
         }}
      />
   )
}

const renderSize = (size?: number | string): string | undefined => {
   if (size == null) return undefined
   if (typeof size === 'number') return `${size}px`
   return size
}
