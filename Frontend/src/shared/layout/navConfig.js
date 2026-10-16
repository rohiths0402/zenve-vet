import {
  House,
  Stethoscope,
  PlaySquare,
  Users,
  CalendarDays,
  Bookmark,
  Gift,
  Megaphone,
  Settings,
  CircleHelp,
} from 'lucide-react'

export const navConfig = [
  {
    label: 'Home / Feed',
    path: '/feed',
    icon: House,
    group: 'main',
  },
  {
    label: 'Clinical Cases',
    path: '/clinical-cases',
    icon: Stethoscope,
    group: 'main',
  },
  {
    label: 'Short Videos',
    path: '/short-videos',
    icon: PlaySquare,
    group: 'main',
  },
  {
    label: 'Vet Network',
    path: '/network',
    icon: Users,
    group: 'main',
  },
  {
    label: 'Events',
    path: '/events',
    icon: CalendarDays,
    group: 'main',
  },
  {
    label: 'Saved Items',
    path: '/saved',
    icon: Bookmark,
    group: 'more',
  },
  {
    label: 'Member Benefits',
    path: '/benefits',
    icon: Gift,
    group: 'more',
  },
  {
    label: 'Advertise',
    path: '/advertise',
    icon: Megaphone,
    group: 'more',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    group: 'more',
  },
  {
    label: 'Help & Support',
    path: '/help',
    icon: CircleHelp,
    group: 'more',
  },
]
