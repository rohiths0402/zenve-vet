import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Compass,
  Users,
  BriefcaseMedical,
  Video,
  MessageCircle,
  Search,
  Award,
  Megaphone,
  Lightbulb,
  Stethoscope,
  ArrowUpRight,
  Sparkles,
  X,
} from "lucide-react";
import "./sidebar.css";

const primaryLinks = [
  { label: "Feed", to: "/", icon: Compass, end: true },
  { label: "Vet network", to: "/network", icon: Users },
  { label: "Clinical cases", to: "/clinical-cases", icon: BriefcaseMedical },
  { label: "Short videos", to: "/reels", icon: Video },
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Search", to: "/search", icon: Search },
  { label: "Member benefits", to: "/benefits", icon: Award },
  { label: "Advertise", to: "/advertise", icon: Megaphone },
];

const discoverLinks = [
  {
    label: "Innovation & scholarships",
    to: "/benefits",
    icon: Lightbulb,
  },
  {
    label: "Expert mentorship",
    to: "/mentorship",
    icon: Stethoscope,
  },
];

export default function Sidebar({
  open = false,
  onClose = () => {},
  badges = {},
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  function openCommunity() {
    navigate("/messages?community=1");
    onClose();
  }

  return (
    <>
      <div
        className={`zv-sidebar__overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="zenve-sidebar"
        className={`zv-sidebar ${open ? "is-open" : ""}`}
        aria-label="Primary navigation"
      >
        <button
          type="button"
          className="zv-sidebar__mobile-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>

        <div className="zv-sidebar__intro">
          <p className="zv-sidebar__eyebrow">Your professional world</p>

          <h2 className="zv-sidebar__heading">
            Great minds.
            <br />
            Healthier tomorrows.
          </h2>
        </div>

        <nav className="zv-sidebar__nav" aria-label="Main menu">
          {primaryLinks.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `zv-sidebar__link ${isActive ? "is-active" : ""}`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={1.7} />

                  <span className="zv-sidebar__label">{label}</span>

                  {Number(badges[label]) > 0 ? (
                    <span className="zv-sidebar__badge">
                      {Number(badges[label]) > 99 ? "99+" : badges[label]}
                    </span>
                  ) : isActive ? (
                    <span className="zv-sidebar__dot" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <section className="zv-sidebar__discover">
          <p className="zv-sidebar__discover-title">Discover more</p>

          <nav className="zv-sidebar__nav" aria-label="Discover">
            {discoverLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `zv-sidebar__link ${isActive ? "is-active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={1.7} />

                <span className="zv-sidebar__label">{label}</span>

                <ArrowUpRight className="zv-sidebar__arrow" size={14} />
              </NavLink>
            ))}
          </nav>
        </section>

        <section className="zv-sidebar__promo">
          <Sparkles className="zv-sidebar__promo-icon" size={19} />

          <h3 className="zv-sidebar__promo-heading">
            Your next chapter starts here.
          </h3>

          <p className="zv-sidebar__promo-text">
            A professional page. A stronger network. A world of possibilities.
          </p>

          <button
            type="button"
            className="zv-sidebar__promo-button"
            onClick={openCommunity}
          >
            Join the community
            <ArrowUpRight size={15} />
          </button>

          <p className="zv-sidebar__promo-note">Free membership</p>
        </section>

        <footer className="zv-sidebar__footer">
          ZENVE VET
          <br />
          The professional network
        </footer>
      </aside>
    </>
  );
}
