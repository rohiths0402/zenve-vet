import { useState } from 'react'
import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import EmptyState from '../components/EmptyState'
import useMessaging from '../hooks/useMessaging'
import { getProfile } from '../services/messageService'
import RegistrationModal from '../../auth/components/RegistrationModal'
import SignInModal from '../../auth/components/SignInModal'
import '../messages.css'

export default function MessagesPage() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  const profile = getProfile()
  const chat = useMessaging()

  function handleOpenRegistration() {
    setShowSignIn(false)
    setShowRegistration(true)
  }

  function handleOpenSignIn() {
    setShowRegistration(false)
    setShowSignIn(true)
  }

  function handleCloseAuth() {
    setShowRegistration(false)
    setShowSignIn(false)
  }

  if (!profile) {
    return (
      <>
        <EmptyState onCreate={handleOpenRegistration} />

        {showRegistration && (
          <RegistrationModal
            onClose={handleCloseAuth}
            onSignIn={handleOpenSignIn}
          />
        )}

        {showSignIn && (
          <SignInModal
            onClose={handleCloseAuth}
            onRegister={handleOpenRegistration}
          />
        )}
      </>
    )
  }
  if (chat.loading) {
    return (
      <div className="msg-loading" role="status">
        Loading conversations...
      </div>
    )
  }

  return (
    <>
      <div className="msg-shell">
        <ConversationList
          items={chat.visible}
          presence={chat.presence}
          activeId={chat.activeId}
          query={chat.query}
          onQuery={chat.setQuery}
          onSelect={chat.select}
          filter={chat.filter}
          onFilter={chat.setFilter}
          unreadCount={chat.unreadCount}
        />

        <ChatWindow
          doctor={chat.active}
          meta={chat.activeMeta}
          live={chat.activePresence}
          messages={chat.messages}
          onSend={chat.send}
          onError={chat.flash}
          onAction={chat.act}
        />
      </div>

      {chat.notice && (
        <p className="msg-toast" role="status">
          {chat.notice}
        </p>
      )}
    </>
  )
}

// Development-only sample data — uncomment only when testing locally.
// localStorage.setItem(
//   'zenvet_profile',
//   JSON.stringify({ id: 'me', name: 'Dr. Chandran' })
// )
//
// localStorage.setItem(
//   'zenvet_connections',
//   JSON.stringify([
//     {
//       id: 'd1',
//       name: 'Dr. Arjun Mehta',
//       specialty: 'Veterinary Surgery',
//       city: 'Mumbai',
//       state: 'Maharashtra',
//       example: true,
//     },
//     {
//       id: 'd2',
//       name: 'Dr. Ananya Sharma',
//       specialty: 'Small Animal Medicine',
//       example: true,
//     },
//   ])
// )