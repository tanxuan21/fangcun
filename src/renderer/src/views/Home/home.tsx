import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const nav = useNavigate()

  useEffect(() => {
    nav('app/remember-card')
  }, [])
  return <div>home</div>
}
