import { Link } from "react-router-dom";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function getInternalPath(url) {
  try {
    const parsed = new URL(url);

    if (parsed.origin === window.location.origin) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    return null;
  }

  return null;
}

export default function MessageText({ text }) {
  const parts = String(text).split(URL_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!/^https?:\/\//.test(part)) return part;

        const path = getInternalPath(part);

        if (path) {
          const label = path.startsWith("/messages?join=")
            ? "Join community"
            : part;

          return (
            <Link key={index} to={path} className="msg-link">
              {label}
            </Link>
          );
        }

        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="msg-link"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
