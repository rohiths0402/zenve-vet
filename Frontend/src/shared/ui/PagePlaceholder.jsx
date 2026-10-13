/** Temporary page body. Each owner REPLACES their page component's contents and deletes this import. */
export default function PagePlaceholder({ title, owner, note }) {
  return (
    <div className="placeholder">
      <h1>{title}</h1>
      <p>Owner: {owner}</p>
      {note && <p>{note}</p>}
    </div>
  )
}
