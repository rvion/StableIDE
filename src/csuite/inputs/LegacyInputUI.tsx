export const LegacyInputUI = (p: JSX.IntrinsicElements['input']): React.JSX.Element => {
   const { className, children, ...rest } = p
   return (
      <input tw={['csuite-basic-input', className]} {...rest}>
         {children}
      </input>
   )
}
