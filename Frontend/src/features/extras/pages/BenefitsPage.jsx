
import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function BenefitsPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("Member benefits");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const benefits = [
    {
      icon: "◎",
      title: "A page that is entirely you",
      description:
        "A shareable professional presence with your story, specialty, clinical journal and community contributions.",
      more:
        "Build your professional identity with your biography, qualifications, areas of expertise and clinical interests.",
    },
    {
      icon: "♧",
      title: "Peers beyond your postcode",
      description:
        "Discover doctors across India, make connections and bring new perspectives into your practice.",
      more:
        "Connect with veterinary professionals, exchange ideas and discover people working in your specialty.",
    },
    {
      icon: "♙",
      title: "Knowledge that travels",
      description:
        "Share de-identified cases, discuss clinical questions and learn through thoughtful conversations.",
      more:
        "Explore clinical discussions, learn from shared experiences and grow your veterinary knowledge.",
    },
    {
      icon: "▱",
      title: "Your voice, in every format",
      description:
        "Publish photos, stories and short videos that bring your practice and perspective to life.",
      more:
        "Share your professional journey through photos, articles, stories and short-form video content.",
    },
    {
      icon: "♧",
      title: "Ideas with a future",
      description:
        "Explore innovation, scholarship, technology guidance and pilot pathways.",
      more:
        "Find opportunities to explore new ideas, learn about emerging technologies and participate in innovation.",
    },
    {
      icon: "♙",
      title: "Room to grow",
      description:
        "Discover potential mentorship, research collaboration and professional visibility.",
      more:
        "Discover mentorship opportunities, collaborate on research and develop your career with your community.",
    },
  ];

  const navItems = [
    { icon: "⊙", label: "Feed" },
    { icon: "♧", label: "Vet network" },
    { icon: "♙", label: "Clinical cases" },
    { icon: "▣", label: "Short videos" },
    { icon: "◯", label: "Messages" },
    { icon: "⌕", label: "Search" },
    { icon: "♧", label: "Member benefits" },
    { icon: "⚑", label: "Advertise" },
  ];

  const handleNav = (label) => {
    setActiveNav(label);
    if (label === "Search") {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  return (
    <div className="bv-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .bv-app {
          --green: #07573c;
          --dark-green: #064a34;
          --gold: #c49a53;
          --cream: #f8f7f1;
          --line: #e7d5ac;
          --text: #17231e;
          --muted: #707973;
          background: var(--cream);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          font-size: 13px;
        }

        .bv-app button,
        .bv-app input,
        .bv-app select,
        .bv-app textarea {
          font: inherit;
        }

        .bv-app button {
          cursor: pointer;
        }

        .bv-header {
          height: 72px;
          background: #fff;
          border-bottom: 1px solid #ecebe4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          gap: 22px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .bv-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .bv-logo {
          width: 35px;
          height: 35px;
          border: 1px solid #eee5cf;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          font-size: 21px;
        }

        .bv-brand-name {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: 2px;
          color: var(--green);
          line-height: 1.1;
        }

        .bv-brand-sub {
          color: #8b806b;
          font-size: 7px;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .bv-search {
          height: 35px;
          width: min(410px, 36vw);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          border: 1px solid #e6e5dd;
          background: #fafaf7;
          border-radius: 5px;
          position: relative;
          color: #738079;
        }

        .bv-search input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          width: 50px;
          font-size: 11px;
          color: var(--text);
        }

        .bv-country {
          font-size: 8px;
          letter-spacing: 1px;
          border-left: 1px solid #e7e4da;
          padding-left: 12px;
        }

        .bv-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 25px;
          white-space: nowrap;
        }

        .bv-community {
          font-size: 10px;
          color: #6c796f;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .bv-dot {
          width: 5px;
          height: 5px;
          background: #2c986d;
          border-radius: 50%;
        }

        .bv-create {
          background: #f5ebd1;
          border: 1px solid #e6d4a8;
          color: #252a23;
          padding: 10px 15px;
          border-radius: 2px;
          font-size: 10px;
          transition: background .2s, transform .2s;
        }

        .bv-create:hover {
          background: #ead7a8;
          transform: translateY(-1px);
        }

        .bv-create span {
          font-size: 16px;
          margin-right: 7px;
          vertical-align: -1px;
        }

        .bv-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          align-items: start;
        }

        .bv-sidebar {
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          overflow-y: auto;
          background: #fff;
          border-right: 1px solid #e7e6df;
          padding: 37px 19px 25px;
          z-index: 10;
        }

        .bv-eyebrow {
          font-size: 8px;
          letter-spacing: 1.6px;
          font-weight: 700;
          color: #9a7950;
          text-transform: uppercase;
        }

        .bv-side-heading {
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          line-height: 1.45;
          font-weight: 600;
          margin: 14px 0 24px;
        }

        .bv-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bv-nav-item {
          width: 100%;
          min-height: 37px;
          padding: 9px 10px;
          border: none;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          background: transparent;
          color: #64716a;
          font-size: 11px;
          transition: background .2s, color .2s;
          position: relative;
        }

        .bv-nav-item:hover {
          background: #f3f5ef;
          color: var(--green);
        }

        .bv-nav-item.active {
          background: #e8f0e9;
          color: var(--green);
          font-weight: 700;
        }

        .bv-nav-icon {
          font-size: 17px;
          width: 15px;
          text-align: center;
          line-height: 1;
        }

        .bv-active-dot {
          margin-left: auto;
          height: 5px;
          width: 5px;
          background: #247b55;
          border-radius: 50%;
        }

        .bv-side-divider {
          border-top: 1px solid #deded6;
          margin: 20px 0;
        }

        .bv-discover {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          border: none;
          background: transparent;
          color: #68736b;
          padding: 12px 0;
          text-align: left;
          font-size: 10px;
          transition: color .2s;
        }

        .bv-discover:hover {
          color: var(--green);
        }

        .bv-side-promo {
          background: #f6ebd1;
          border: 1px solid #eddfbd;
          padding: 15px 12px;
          margin-top: 27px;
          transition: box-shadow .2s, transform .2s;
        }

        .bv-side-promo:hover {
          box-shadow: 0 7px 22px #163e2410;
          transform: translateY(-2px);
        }

        .bv-side-promo strong {
          display: block;
          font-family: 'Manrope', sans-serif;
          font-size: 12px;
          line-height: 1.5;
          margin: 8px 0;
        }

        .bv-side-promo p {
          font-size: 10px;
          line-height: 1.6;
          color: #746c5c;
        }

        .bv-side-promo button {
          background: var(--green);
          color: white;
          border: none;
          padding: 8px 10px;
          font-size: 9px;
          margin-top: 4px;
        }

        /* Benefits page uses the existing shared Topbar and Sidebar. */
        .bv-app {
          width: calc(100% - 280px);
          min-width: 0;
          min-height: calc(100vh - 104px);
          margin-left: 280px;
          margin-top: 104px;
          overflow-x: hidden;
        }

        /* Do not render a second Topbar or Sidebar inside Benefits. */
        .bv-header,
        .bv-sidebar {
          display: none !important;
        }

        .bv-layout {
          display: block !important;
          width: 100%;
          min-width: 0;
          margin: 0;
        }

        .bv-main {
          box-sizing: border-box;
          min-width: 0;
          padding: 24px 28px 60px;
          max-width: none;
          width: 100%;
          margin: 0;
        }

        @media (max-width: 760px) {
          .bv-app {
            width: 100%;
            margin-left: 0;
            margin-top: 76px;
            min-height: calc(100vh - 76px);
          }

          .bv-main {
            padding: 16px 14px 40px;
          }
        }

        .bv-hero {
          height: 308px;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          margin-top: 0;
          background-color: #064b35;
          background-image:
            linear-gradient(90deg, rgba(3,66,43,.91), rgba(4,79,52,.68)),
            url('https://images.unsplash.com/photo-1587559070757-f72b7b3f5b5b?auto=format&fit=crop&w=1800&q=85');
          background-size: cover;
          background-position: center 43%;
          display: flex;
          align-items: center;
          transition: background-position .5s;
        }

        .bv-hero:hover {
          background-position: center 48%;
        }

        .bv-hero-content {
          padding: 30px 38px;
          color: white;
          max-width: 650px;
        }

        .bv-hero .bv-eyebrow {
          color: #e0bd77;
          margin-bottom: 20px;
        }

        .bv-hero h1 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(29px, 3vw, 45px);
          line-height: 1.19;
          letter-spacing: -1.1px;
          font-weight: 600;
          margin: 0 0 17px;
        }

        .bv-hero p {
          color: #f2f2e7;
          font-size: 12px;
          line-height: 1.8;
          margin: 0 0 21px;
        }

        .bv-hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          background: #f6edda;
          color: #1c2a20;
          border: 1px solid #e6d3a6;
          font-size: 10px;
          transition: background .2s, transform .2s;
        }

        .bv-hero-btn:hover {
          background: #e8d6ad;
          transform: translateY(-2px);
        }

        .bv-intro {
          text-align: center;
          padding: 42px 10px 45px;
        }

        .bv-intro .bv-eyebrow {
          color: #b18b4f;
          margin-bottom: 16px;
        }

        .bv-intro h2 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(25px, 2.5vw, 35px);
          line-height: 1.35;
          font-weight: 600;
          letter-spacing: -.7px;
          margin: 0;
        }

        .bv-intro p {
          margin: 17px 0 0;
          font-size: 10px;
          color: #777e77;
        }

        .bv-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          column-gap: 27px;
          row-gap: 0;
        }

        .bv-card {
          min-width: 0;
          border-top: 1px solid var(--line);
          padding: 23px 1px 27px;
          position: relative;
          transition: border-color .25s;
        }

        .bv-card:hover {
          border-top-color: #b98e4c;
        }

        .bv-card-icon {
          font-size: 25px;
          line-height: 1;
          color: #b99354;
          height: 35px;
          transition: transform .25s;
        }

        .bv-card:hover .bv-card-icon {
          transform: translateY(-3px);
        }

        .bv-card h3 {
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          line-height: 1.5;
          font-weight: 600;
          margin: 7px 0 11px;
        }

        .bv-card p {
          font-size: 11px;
          line-height: 1.8;
          color: #777d76;
          margin: 0;
        }

        .bv-card-tooltip {
          position: absolute;
          z-index: 5;
          top: calc(100% - 10px);
          left: 0;
          right: 0;
          background: #fff;
          padding: 17px;
          border: 1px solid #e9dfc8;
          box-shadow: 0 12px 30px #243a2517;
          font-size: 11px;
          line-height: 1.7;
          color: #647068;
          animation: bvPop .2s ease-out;
        }

        .bv-card-tooltip strong {
          color: var(--green);
          display: block;
          margin-bottom: 5px;
        }

        .bv-bottom {
          text-align: center;
          padding: 45px 10px 10px;
          margin-top: 10px;
        }

        .bv-bottom h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 17px;
        }

        .bv-bottom button {
          background: var(--green);
          color: white;
          padding: 12px 19px;
          border: 1px solid var(--green);
          font-size: 10px;
          transition: background .2s, transform .2s;
        }

        .bv-bottom button:hover {
          background: #0b704b;
          transform: translateY(-2px);
        }

        .bv-search-results {
          position: absolute;
          left: 0;
          right: 0;
          top: 42px;
          background: white;
          border: 1px solid #e5e1d5;
          box-shadow: 0 10px 25px #172b1b18;
          padding: 13px;
          z-index: 80;
          color: #5c6a61;
        }

        .bv-search-results strong {
          display: block;
          color: var(--green);
          margin-bottom: 8px;
        }

        .bv-search-results p {
          font-size: 11px;
          margin: 5px 0;
        }

        .bv-overlay {
          position: fixed;
          top: 104px;
          left: 280px;
          right: 0;
          bottom: 0;
          background: rgba(12, 22, 17, .58);
          z-index: 2147483000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
          animation: bvFade .2s ease-out;
        }

        .bv-modal {
          box-sizing: border-box;
          width: min(100%, 460px);
          max-width: 460px;
          max-height: calc(100% - 16px);
          overflow-y: auto;
          background: #fff;
          border: 1px solid #e8e2d4;
          padding: 27px;
          position: relative;
          box-shadow: 0 25px 80px #0003;
          animation: bvPop .25s ease-out;
        }

        .bv-modal-head {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .bv-modal h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 22px;
          line-height: 1.4;
          margin: 7px 0;
          font-weight: 600;
        }

        .bv-modal-sub {
          color: #777f77;
          font-size: 11px;
          line-height: 1.6;
        }

        .bv-close {
          background: #f4f3ed;
          border: none;
          width: 30px;
          height: 30px;
          font-size: 19px;
          flex-shrink: 0;
        }

        .bv-close:hover {
          background: #eadfca;
        }

        .bv-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bv-form label {
          font-size: 10px;
          font-weight: 600;
          color: #515e54;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bv-form input,
        .bv-form select,
        .bv-form textarea {
          width: 100%;
          border: 1px solid #e4e4dc;
          border-radius: 2px;
          background: #fafaf7;
          color: #24352a;
          padding: 11px;
          outline: none;
          font-size: 11px;
          transition: border .2s;
        }

        .bv-form input:focus,
        .bv-form select:focus,
        .bv-form textarea:focus {
          border-color: #65977b;
          background: white;
        }

        .bv-form textarea {
          min-height: 75px;
          resize: vertical;
        }

        .bv-form-submit {
          background: #f2e6c9;
          border: 1px solid #e5d3a6;
          color: #25372b;
          padding: 13px;
          margin-top: 3px;
          font-weight: 600;
          font-size: 11px;
          transition: background .2s;
        }

        .bv-form-submit:hover {
          background: #e7d3a3;
        }

        .bv-success {
          text-align: center;
          padding: 30px 10px;
        }

        .bv-success-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #e7f0e7;
          color: var(--green);
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          font-size: 24px;
        }

        .bv-success p {
          line-height: 1.8;
          color: #737c73;
          font-size: 12px;
        }

        .bv-toast {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 90;
          padding: 14px 20px;
          background: #fff;
          border-left: 3px solid var(--green);
          box-shadow: 0 5px 25px #0001;
          color: var(--green);
          font-size: 12px;
        }

        @keyframes bvFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bvPop {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 1500px) {
          .bv-main {
            padding-left: 48px;
            padding-right: 48px;
          }

          .bv-hero {
            height: 340px;
          }

          .bv-card {
            padding-top: 27px;
            padding-bottom: 32px;
          }
        }

        @media (max-width: 1100px) {
          .bv-header {
            padding: 0 18px;
            gap: 12px;
          }

          .bv-header-right {
            gap: 12px;
          }

          .bv-layout {
            grid-template-columns: 190px minmax(0, 1fr);
          }

          .bv-sidebar {
            padding-left: 14px;
            padding-right: 14px;
          }

          .bv-main {
            padding-left: 24px;
            padding-right: 24px;
          }

          .bv-grid {
            gap: 0 18px;
          }

          .bv-card h3 {
            font-size: 14px;
          }
        }

        @media (max-width: 760px) {
          .bv-header {
            height: auto;
            min-height: 66px;
            padding: 12px 15px;
            flex-wrap: wrap;
          }

          .bv-brand-name {
            font-size: 16px;
          }

          .bv-search {
            order: 3;
            width: 100%;
            flex: 1 0 100%;
          }

          .bv-header-right {
            margin-left: auto;
          }

          .bv-community {
            display: none;
          }

          .bv-create {
            padding: 9px 10px;
          }

          .bv-layout {
            display: block;
          }

          .bv-sidebar {
            position: relative;
            top: auto;
            width: 100%;
            height: auto;
            padding: 12px 14px;
            border-right: none;
            border-bottom: 1px solid #e7e6df;
          }

          .bv-sidebar > .bv-eyebrow,
          .bv-side-heading,
          .bv-side-divider,
          .bv-discover,
          .bv-side-promo {
            display: none;
          }

          .bv-nav {
            flex-direction: row;
            overflow-x: auto;
            gap: 5px;
            padding-bottom: 2px;
          }

          .bv-nav-item {
            width: auto;
            min-width: max-content;
            min-height: 36px;
            padding: 8px 11px;
          }

          .bv-nav-icon {
            font-size: 15px;
          }

          .bv-main {
            padding: 0 15px 40px;
          }

          .bv-hero {
            height: 300px;
            margin-top: 14px;
            background-position: center;
          }

          .bv-hero-content {
            padding: 24px;
          }

          .bv-hero h1 {
            font-size: 31px;
          }

          .bv-intro {
            padding: 35px 0;
          }

          .bv-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0 18px;
          }

          .bv-bottom h2 {
            font-size: 23px;
          }
        }

        @media (max-width: 760px) {
          .bv-overlay {
            top: 76px;
            left: 0;
            padding: 14px;
          }
          .bv-modal {
            width: 100%;
            max-width: 460px;
            max-height: calc(100% - 8px);
            padding: 21px;
          }
        }

        @media (max-width: 450px) {
          .bv-grid {
            grid-template-columns: 1fr;
          }

          .bv-hero {
            height: 280px;
          }

          .bv-hero-content {
            padding: 20px;
          }

          .bv-hero h1 {
            font-size: 28px;
          }

          .bv-intro h2 {
            font-size: 25px;
          }

          .bv-card {
            padding: 20px 1px 23px;
          }

          .bv-modal {
            padding: 21px;
          }
        }
      `}</style>

      {/* Top navigation */}
      <header className="bv-header">
        <div className="bv-brand">
          <div className="bv-logo">♧</div>
          <div>
            <div className="bv-brand-name">
              ZENVE VET<sup style={{ fontSize: 8 }}>™</sup>
            </div>
            <div className="bv-brand-sub">
              THE PROFESSIONAL NETWORK
            </div>
          </div>
        </div>

        <div className="bv-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search doctors, specialties, cities..."
            value={search}
            onFocus={() => setShowSearch(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSearch(true);
            }}
          />
          <span className="bv-country">INDIA</span>

          {showSearch && (
            <div className="bv-search-results">
              <strong>Search the network</strong>
              {search.trim() ? (
                <>
                  <p>Doctors matching “{search}”</p>
                  <p>Veterinary specialties</p>
                  <p>Professional communities</p>
                </>
              ) : (
                <>
                  <p>Search veterinary professionals</p>
                  <p>Explore specialties and cities</p>
                </>
              )}
              <button
                onClick={() => setShowSearch(false)}
                style={{
                  border: "none",
                  background: "#edf3ed",
                  color: "#07573c",
                  padding: "7px 10px",
                  marginTop: 7,
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        <div className="bv-header-right">
          <div className="bv-community">
            <span className="bv-dot" />
            Open community
          </div>
          <button
            className="bv-create"
            onClick={() => {
              setSubmitted(false);
              setShowProfile(true);
            }}
          >
            <span>＋</span>Create your profile
          </button>
        </div>
      </header>

      <div className="bv-layout">
        {/* Left sidebar */}
        <aside className="bv-sidebar">
          <div className="bv-eyebrow">Your professional world</div>

          <h2 className="bv-side-heading">
            Great minds.
            <br />
            Healthier tomorrows.
          </h2>

          <nav className="bv-nav">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`bv-nav-item ${
                  activeNav === item.label ? "active" : ""
                }`}
                onClick={() => handleNav(item.label)}
                title={item.label}
              >
                <span className="bv-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {activeNav === item.label && (
                  <span className="bv-active-dot" />
                )}
              </button>
            ))}
          </nav>

          <div className="bv-side-divider" />

          <div className="bv-eyebrow">Discover &amp; grow</div>

          {[
            ["♧", "Innovation & scholarships"],
            ["▤", "Clinical resources"],
            ["↗", "Professional learning"],
          ].map(([icon, label]) => (
            <button
              key={label}
              className="bv-discover"
              onClick={() => {
                setActiveNav(label);
              }}
            >
              <span>
                {icon} &nbsp; {label}
              </span>
              <span>↗</span>
            </button>
          ))}

          <div className="bv-side-promo">
            <div className="bv-eyebrow">Your next chapter</div>
            <strong>
              Your next chapter starts here.
            </strong>
            <p>
              Build your professional presence and connect with a growing
              veterinary community.
            </p>
            <button onClick={() => setShowProfile(true)}>
              Create your page ↗
            </button>
          </div>
        </aside>

        {/* Main page */}
        <main className="bv-main">
          <section className="bv-hero">
            <div className="bv-hero-content">
              <div className="bv-eyebrow">The Zenve advantage</div>
              <h1>
                More than a network.
                <br />
                A place to become.
              </h1>
              <p>
                Bring your expertise. Find your people.
                <br />
                Create what comes next for animal health.
              </p>
              <button
                className="bv-hero-btn"
                onClick={() => {
                  setSubmitted(false);
                  setShowProfile(true);
                }}
              >
                Create your free page <span>↗</span>
              </button>
            </div>
          </section>

          <section className="bv-intro">
            <div className="bv-eyebrow">
              Your membership, reimagined
            </div>
            <h2>
              Space for your work.
              <br />
              Support for your ambition.
            </h2>
            <p>₹0 membership · No login required</p>
          </section>

          <section className="bv-grid">
            {benefits.map((benefit, index) => (
              <article
                className="bv-card"
                key={benefit.title}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bv-card-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>

                {hoveredCard === index && (
                  <div className="bv-card-tooltip">
                    <strong>{benefit.title}</strong>
                    {benefit.more}
                  </div>
                )}
              </article>
            ))}
          </section>

          <section className="bv-bottom">
            <h2>Your work deserves a wider world.</h2>
            <button
              onClick={() => {
                setSubmitted(false);
                setShowProfile(true);
              }}
            >
              Create your free page ↗
            </button>
          </section>
        </main>
      </div>

      {/* Create profile popup */}
      {showProfile && createPortal((
        <div
          className="bv-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfile(false);
            }
          }}
        >
          <div
            className="bv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bv-modal-title"
          >
            <div className="bv-modal-head">
              <div>
                <div className="bv-eyebrow">
                  Join the professional network
                </div>
                <h2 id="bv-modal-title">
                  Make your professional mark.
                </h2>
                <div className="bv-modal-sub">
                  Start building your veterinary profile.
                </div>
              </div>

              <button
                className="bv-close"
                onClick={() => setShowProfile(false)}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="bv-success">
                <div className="bv-success-icon">✓</div>
                <h2>You're ready for the next step.</h2>
                <p>
                  Your form has been completed in this demo. Connect a
                  backend to save profile details and submit them to a
                  real service.
                </p>
                <button
                  className="bv-form-submit"
                  onClick={() => setShowProfile(false)}
                >
                  Back to benefits
                </button>
              </div>
            ) : (
              <form
                className="bv-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <label>
                  Full name
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label>
                  Professional email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label>
                  Professional role
                  <select defaultValue="" required>
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option>Veterinarian</option>
                    <option>Veterinary student</option>
                    <option>Veterinary researcher</option>
                    <option>Veterinary educator</option>
                    <option>Animal health professional</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Specialty / area of interest
                  <input
                    type="text"
                    placeholder="e.g. Small animal practice"
                  />
                </label>

                <label>
                  City
                  <input
                    type="text"
                    placeholder="Your city"
                    required
                  />
                </label>

                <label>
                  Tell us about yourself
                  <textarea
                    placeholder="Your experience, interests and professional goals..."
                  />
                </label>

                <button type="submit" className="bv-form-submit">
                  Create your free page ↗
                </button>

                <div
                  style={{
                    fontSize: 9,
                    color: "#858b83",
                    lineHeight: 1.7,
                    textAlign: "center",
                  }}
                >
                  Frontend demo only. Form details are not sent to a
                  server.
                </div>
              </form>
            )}
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
