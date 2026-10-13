import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Send,
  LoaderCircle,
  MessageCircle,
} from 'lucide-react'

function normalizeDoctor(doctor, index = 0) {
  return {
    ...doctor,
    id: String(
      doctor.id ?? doctor.doctorId ?? doctor._id ?? `doctor-${index}`
    ),
    name: doctor.name ?? doctor.fullName ?? doctor.doctorName ?? 'Doctor',
    specialty:
      doctor.specialty ?? doctor.specialization ?? 'Veterinary Medicine',
    location:
      doctor.location ??
      [doctor.city, doctor.state ?? doctor.stateName]
        .filter(Boolean)
        .join(', '),
    image:
      doctor.image ??
      doctor.imageUrl ??
      doctor.profileImage ??
      doctor.photoUrl ??
      doctor.profilePicture ??
      doctor.avatarUrl ??
      '',
  }
}

function getInitials(name = 'Doctor') {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Avatar({ doctor }) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [doctor?.image])

  return (
    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DDE8DF] text-[10px] font-semibold text-[#176B5B]">
      {doctor?.image && !imageFailed ? (
        <img
          src={doctor.image}
          alt={doctor.name}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(doctor?.name)
      )}
    </div>
  )
}

export default function ChatPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const incomingDoctor = state?.doctor
    ? normalizeDoctor(state.doctor)
    : null

  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(incomingDoctor)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadDoctors() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/doctors', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error(
            `Unable to load doctors (${response.status}).`
          )
        }

        const result = await response.json()

        const list = Array.isArray(result)
          ? result
          : result.doctors ?? result.content ?? result.data ?? []

        if (!Array.isArray(list)) {
          throw new Error('Invalid doctors API response.')
        }

        const normalized = list.map(normalizeDoctor)
        setDoctors(normalized)

        if (incomingDoctor) {
          const matchingDoctor = normalized.find(
            (doctor) => doctor.id === incomingDoctor.id
          )

          setSelectedDoctor(matchingDoctor ?? incomingDoctor)
        } else {
          setSelectedDoctor((current) => {
            if (!current) return normalized[0] ?? null

            return (
              normalized.find(
                (doctor) => doctor.id === current.id
              ) ?? current
            )
          })
        }
      } catch (err) {
        if (err.name === 'AbortError') return

        setError(
          err.message || 'Unable to load doctors. Please try again.'
        )
        setDoctors([])

        if (!incomingDoctor) {
          setSelectedDoctor(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDoctors()

    return () => controller.abort()
  }, [incomingDoctor?.id])

  const selectedId = selectedDoctor?.id

  const messages = selectedId
    ? conversations[selectedId] ?? []
    : []

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase()

    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.specialty} ${doctor.location}`
        .toLowerCase()
        .includes(query)
    )
  }, [doctors, search])

  function sendMessage(event) {
    event.preventDefault()

    const text = draft.trim()

    if (!text || !selectedId) return

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setConversations((previous) => ({
      ...previous,
      [selectedId]: [
        ...(previous[selectedId] ?? []),
        message,
      ],
    }))

    setDoctors((previous) =>
      previous.map((doctor) =>
        doctor.id === selectedId
          ? { ...doctor, lastMessage: text }
          : doctor
      )
    )

    setDraft('')
  }

  return (
    <main className="min-h-screen bg-[#F7F7F4] sm:px-6 lg:px-10">
      <div className="mx-auto flex h-dvh min-h-[500px] max-w-[1440px] overflow-hidden border border-[#E0E0DA] bg-white sm:h-[calc(100dvh-32px)] sm:rounded-[19px]">

        {/* Sidebar */}
        <aside className="flex w-[42%] min-w-[150px] max-w-[300px] shrink-0 flex-col border-r border-[#DFDFD9] sm:w-[300px] sm:max-w-none">
          <div className="px-3 pb-3 pt-5 sm:px-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-[21px] font-semibold tracking-[-0.5px] text-[#111A16]">
                Messages
              </h1>

              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="rounded-full p-1 text-[#65736A] hover:bg-[#F0F2EE] sm:hidden"
              >
                <ArrowLeft size={17} />
              </button>
            </div>

            <div className="flex h-[42px] items-center gap-2 rounded-[4px] border border-[#DEDED8] px-3">
              <Search
                size={15}
                className="shrink-0 text-[#586960]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                aria-label="Search doctors"
                className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-[#A0A6A1]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3 sm:px-3">
            {loading && (
              <div className="flex items-center justify-center gap-2 px-2 py-6 text-xs text-[#65736A]">
                <LoaderCircle size={15} className="animate-spin" />
                Loading doctors...
              </div>
            )}

            {!loading && error && (
              <div className="px-2 py-5 text-center">
                <p className="text-xs text-[#B42318]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-medium text-[#176B5B] underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredDoctors.map((doctor) => {
                const active = doctor.id === selectedId
                const doctorMessages =
                  conversations[doctor.id] ?? []

                const lastMessage =
                  doctorMessages[doctorMessages.length - 1]?.text ??
                  doctor.lastMessage

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      setDraft('')
                    }}
                    className={`mb-2 flex w-full items-center gap-2.5 rounded-[13px] px-2 py-3 text-left transition sm:px-2.5 ${
                      active
                        ? 'bg-[#EAEEE8]'
                        : 'bg-white hover:bg-[#F6F7F4]'
                    }`}
                  >
                    <Avatar doctor={doctor} />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-[#111A16] sm:text-[14px]">
                        {doctor.name}
                      </span>

                      <span className="mt-1 block truncate text-[10px] text-[#65736A] sm:text-[11px]">
                        {lastMessage || doctor.specialty}
                      </span>
                    </span>
                  </button>
                )
              })}

            {!loading &&
              !error &&
              filteredDoctors.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-[#7A847D]">
                  {doctors.length
                    ? 'No doctors found'
                    : 'No doctors available'}
                </p>
              )}
          </div>
        </aside>

        {/* Chat window */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {selectedDoctor ? (
            <>
              <header className="flex min-h-[65px] shrink-0 items-center gap-2.5 border-b border-[#E0E0DA] px-3 sm:px-4">
                <Avatar doctor={selectedDoctor} />

                <div className="min-w-0">
                  <h2 className="truncate text-[13px] font-semibold text-[#111A16] sm:text-[14px]">
                    {selectedDoctor.name}
                  </h2>

                  <p className="mt-0.5 truncate text-[10px] text-[#65736A] sm:text-[11px]">
                    {selectedDoctor.specialty}
                    {selectedDoctor.location
                      ? ` · ${selectedDoctor.location}`
                      : ''}
                  </p>
                </div>
              </header>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-6">
                {messages.length === 0 ? (
                  <div className="m-auto max-w-sm text-center">
                    <MessageCircle
                      size={25}
                      className="mx-auto mb-3 text-[#176B5B]"
                    />

                    <p className="text-[12px] text-[#52616B]">
                      Start a conversation with {selectedDoctor.name}.
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-[#718096]">
                      Messages are currently stored only in this page.
                      Connect a messaging API to deliver them to the doctor.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] rounded-[15px] rounded-br-[4px] bg-[#176B5B] px-3.5 py-2.5 text-white">
                        <p className="whitespace-pre-wrap break-words text-[13px]">
                          {message.text}
                        </p>

                        <p className="mt-1 text-right text-[9px] text-white/70">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={sendMessage}
                className="flex min-h-[67px] shrink-0 items-center gap-2 border-t border-[#E0E0DA] px-3 py-3"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                  className="h-[42px] min-w-0 flex-1 rounded-full border border-[#E1E1DB] bg-[#F7F7F4] px-4 text-[13px] outline-none placeholder:text-[#89918A] focus:border-[#B7C8BC]"
                />

                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  title="Send message"
                  className="flex h-[35px] w-[35px] shrink-0 items-center justify-center border border-[#E8CD99] bg-[#FFF0D2] text-[#24352C] transition hover:bg-[#F9E2B5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} strokeWidth={1.6} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-5 text-center">
              <div>
                <MessageCircle
                  size={28}
                  className="mx-auto mb-3 text-[#176B5B]"
                />

                <h2 className="text-sm font-semibold text-[#26352D]">
                  Select a doctor
                </h2>

                <p className="mt-2 text-xs text-[#718096]">
                  Choose a doctor from the list to view the conversation.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}