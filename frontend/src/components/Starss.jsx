import { useState } from "react"
import RatePopup from "./RatePopup"
import "./Starss.css"

export default function Starss({ onSubmit }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)

  const clickStar = (n) => {
    setSelected(n)
    setOpen(true)
  }

  const submit = (rating, comment) => {
    setOpen(false)
    onSubmit(rating, comment)
  }

  return (
    <>
      <div className="starss">
        {[1,2,3,4,5].map(n => (
          <span key={n}className={n <= (hovered || selected)? "star active": "star"}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => clickStar(n)}>★
          </span>
        ))}
      </div>

      {open && (<RatePopup rating={selected}onClose={() => setOpen(false)}onSubmit={submit}/>)}
    </>
  )
}
