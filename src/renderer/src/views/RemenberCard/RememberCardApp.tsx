import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function RemenberCardApp() {
  const [books_list, set_books_list] = useState<string[]>([])
  useEffect(() => {
    set_books_list(['a', 'b', 'c'])
  }, [])
  return (
    <div>
      {books_list.map((item) => {
        return (
          <Link
            style={{
              margin: '10px'
            }}
            key={item}
            to={'/app/remember-card/content'}
          >
            {item}
          </Link>
        )
      })}
    </div>
  )
}
