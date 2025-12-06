import { useState } from "react"
import "./RatePopup.css"

export default function RatePopup({ rating, onClose, onSubmit }) {
  const [comment, setComment] = useState("")

  return (
    <div className="rate-bg">
      <div className="rate-box">
        <h3>Rate {rating} / 5</h3>

        <textarea value={comment}onChange={e => setComment(e.target.value)}placeholder="Write a comment"className="rate-textarea"/>

        <div className="rate-buttons">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={() => onSubmit(rating, comment)}>Submit</button>
        </div>
      </div>
    </div>
  )
}
