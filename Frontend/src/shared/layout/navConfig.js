import {
  Compass, Users, BriefcaseMedical, Video, MessageCircle,
  Search, Award, Megaphone, Lightbulb,
} from 'lucide-react'

/** Single source of truth for sidebar links. Add/rename items here, nowhere else. */
export const NAV_PRIMARY = [
  { key: 'feed',     label: 'Feed',            to: '/',               icon: Compass, end: true },
  { key: 'network',  label: 'Vet network',     to: '/network',        icon: Users },
  { key: 'clinical', label: 'Clinical cases',  to: '/clinical-cases', icon: BriefcaseMedical },
  { key: 'reels',    label: 'Short videos',    to: '/reels',          icon: Video },
  { key: 'messages', label: 'Messages',        to: '/messages',       icon: MessageCircle },
  { key: 'search',   label: 'Search',          to: '/search',         icon: Search },
  { key: 'benefits', label: 'Member benefits', to: '/benefits',       icon: Award },
  { key: 'advertise',label: 'Advertise',       to: '/advertise',      icon: Megaphone },
]

export const NAV_DISCOVER = [
  { key: 'innovation', label: 'Innovation & scholarships', to: '/innovation', icon: Lightbulb },
]
