import "./AvgRating.css"

export default function AvgRating({ reviews }) {
  if (!reviews || reviews.length === 0) return null

  const average = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1)

  const full = Math.floor(average)
  const half = average - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className="avg-rating-component">
      <div className="avg-stars">
        {Array(full).fill(0).map((_, i) => <span key={"f"+i}>★</span>)}
        {half && <span className="half">★</span>}
        {Array(empty).fill(0).map((_, i) => <span key={"e"+i} className="empty">★</span>)}
      </div>
    </div>
  )
}
