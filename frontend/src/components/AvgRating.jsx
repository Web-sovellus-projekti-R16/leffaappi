import "./AvgRating.css"

export default function AvgRating({ reviews }) {
  if (!reviews || reviews.length === 0) return null

  const average1 = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const average = Math.round(average1)

  const full = average
  const empty = 5 - full

  return (
    <div className="avg-rating-component">
      <div className="avg-stars">
        {Array(full).fill(0).map((_, i) => (<span key={"f" + i} className="star gold">★</span>))}
        {Array(empty).fill(0).map((_, i) => (<span key={"e" + i} className="star gray">★</span>))}
      </div>
    </div>
  )
}
