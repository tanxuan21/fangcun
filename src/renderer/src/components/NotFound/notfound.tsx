import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const nav = useNavigate()
  return (
    <div>
      404 not found
      <button
        onClick={() => {
          nav(-1)
        }}
      >
        back
      </button>
    </div>
  )
}
