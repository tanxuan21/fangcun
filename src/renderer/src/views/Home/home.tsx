import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function Home() {
  const nav = useNavigate()

  useEffect(() => {
    // nav('app/remember-card')
  }, [])
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px'
      }}
    >
      <Link to={'/app/remember-card/'}>Remember Car</Link>
      <Link to={'/app/board/'}>board</Link>
      <Link to={'/app/table/'}>table</Link>
      <svg
        style={{
          fontSize: '25px',
          width: '1em',
          height: '1em',
          display: 'inline-block',
          color: '#aaa'
        }}
        className="icon"
        aria-hidden="true"
      >
        <use style={{ width: '100%', height: '100%' }} xlinkHref="#icon-sousuo"></use>
      </svg>
    </div>
  )
}
