export default function EmptyState({ onCreate }) {
  return (
    <div className="msg-empty">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      </svg>
      <h2>Message your peers privately.</h2>
      <p>Create your free page, connect with doctors, then chat.</p>
      <button type="button" className="msg-cta" onClick={onCreate}>
        Create your profile
      </button>
    </div>
  );
}
