export function Wrapper({
  className,
  styles,
  children
}: {
  children?: React.ReactNode
  className?: string
  styles?: React.CSSProperties
}) {
  return (
    <div className={className} style={styles}>
      {children || ''}
    </div>
  )
}
