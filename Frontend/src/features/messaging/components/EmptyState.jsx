export default function EmptyState({ onCreate }) {
  return (
    <div className="msg-empty">
      <div className="msg-empty__icon">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        </svg>
      </div>

      <h2>Message your peers privately.</h2>

      <p>
        Create your professional profile to connect with
        veterinary doctors and start conversations.
      </p>

      <button
        type="button"
        className="msg-cta"
        onClick={onCreate}
      >
        Create your profile
      </button>
    </div>
  )
}
