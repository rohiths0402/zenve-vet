
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  Stethoscope,
  ArrowUpRight,
  UserRound,
  LoaderCircle,
  Users,
  RotateCcw,
  BadgeCheck,
  Plus,
} from 'lucide-react'

function getDoctorName(doctor) {
  return doctor.name ?? doctor.fullName ?? doctor.doctorName ?? 'Doctor'
}

function getDoctorImage(doctor) {
  return (
    doctor.imageUrl ??
    doctor.profileImage ??
    doctor.photoUrl ??
    doctor.profilePicture ??
    doctor.avatarUrl ??
    ''
  )
}

function getDoctorLocation(doctor) {
  return (
    doctor.location ||
    [doctor.city, doctor.state ?? doctor.stateName]
      .filter(Boolean)
      .join(', ') ||
    ''
  )
}

function isDoctorVerified(doctor) {
  return Boolean(doctor.verified ?? doctor.isVerified)
}

function DoctorAvatar({ image, name }) {
  const [imageError, setImageError] = useState(false)

  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="absolute bottom-[-40px] left-5 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[#E7F0E9] text-[#07543E] shadow-sm sm:bottom-[-40px] sm:left-6 sm:h-[80px] sm:w-[80px]">
      {image && !imageError ? (
        <img
          src={image}
          alt={`${name} profile`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E7F0E9]">
          {initials ? (
            <span className="text-lg font-semibold">{initials}</span>
          ) : (
            <UserRound size={32} strokeWidth={1.4} />
          )}
        </div>
      )}
    </div>
  )
}

export default function NetworkPage() {
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [connectedDoctors, setConnectedDoctors] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadDoctors() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/doctors', {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to load doctors (${response.status})`)
        }

        const result = await response.json()

        const list = Array.isArray(result)
          ? result
          : result.doctors ?? result.data ?? result.content

        if (!Array.isArray(list)) {
          throw new Error('Invalid doctors API response')
        }

        setDoctors(list)
      } catch (err) {
        if (err.name === 'AbortError') return

        setDoctors([])
        setError(
          err.message || 'Unable to load doctor profiles. Please try again.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDoctors()

    return () => controller.abort()
  }, [])

  const filteredDoctors = doctors.filter((doctor) => {
    const text = [
      doctor.name,
      doctor.fullName,
      doctor.doctorName,
      doctor.specialty,
      doctor.specialization,
      doctor.city,
      doctor.state,
      doctor.stateName,
      doctor.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(search.trim().toLowerCase())
  })

  function handleConnect(doctor) {
    const doctorId = doctor.id ?? doctor.doctorId ?? doctor.slug

    if (doctorId == null) return

    setConnectedDoctors((previous) =>
      previous.includes(String(doctorId))
        ? previous.filter((id) => id !== String(doctorId))
        : [...previous, String(doctorId)]
    )
  }

  function handleViewPage(doctor) {
    const id = doctor.slug ?? doctor.id ?? doctor.doctorId

    if (id == null) return

    navigate(`/doctors/${encodeURIComponent(id)}`, {
      state: { doctor },
    })
  }

  return (
    <main className="min-h-screen bg-[#F7F7F3] text-[#10251E]">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-14">
        {/* Header */}
        <header className="border-t border-[#E1E0D8] pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B28A43]">
            A community without boundaries
          </p>

          <h1 className="mt-5 text-3xl font-normal tracking-[-0.035em] sm:text-5xl">
            Find your kind of brilliant.
          </h1>

          <p className="mt-4 text-sm text-[#68766D] sm:text-base">
            Veterinary perspectives from every corner of India.
          </p>
        </header>

        {/* Search */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-md border border-[#DFDFD7] bg-white px-4 transition focus-within:border-[#07543E]">
            <Search size={18} className="shrink-0 text-[#68766D]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, specialty or city"
              aria-label="Search doctors"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#A2A8A2]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search text"
                className="text-xl text-[#68766D] hover:text-[#07543E]"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSearch('')}
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#DFDFD7] px-5 text-sm transition hover:bg-white"
          >
            <RotateCcw size={15} />
            Clear search
          </button>
        </div>

        {/* Network cards */}
        <section className="mt-8 border-t border-[#DFDFD7] pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#68766D]">
              {loading
                ? 'Loading professionals...'
                : `${filteredDoctors.length} professional ${
                    filteredDoctors.length === 1 ? 'profile' : 'profiles'
                  }`}
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex min-h-64 items-center justify-center gap-3">
              <LoaderCircle
                className="animate-spin text-[#07543E]"
                size={25}
              />
              <span className="text-sm">Loading vet network...</span>
            </div>
          )}

          {/* API error state */}
          {!loading && error && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-red-200 bg-white p-8 text-center"
            >
              <p className="font-medium text-red-700">
                Unable to load doctor profiles
              </p>
              <p className="mt-2 break-words text-sm text-[#68766D]">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-md bg-[#07543E] px-4 py-2 text-sm text-white transition hover:bg-[#064431]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty API response */}
          {!loading && !error && doctors.length === 0 && (
            <div className="mt-6 rounded-md border border-[#DFDFD7] bg-white p-8 text-center">
              <Users className="mx-auto text-[#07543E]" size={30} />
              <h2 className="mt-3 font-medium">
                No doctor profiles available
              </h2>
              <p className="mt-2 text-sm text-[#68766D]">
                The API returned no doctor profiles.
              </p>
            </div>
          )}

          {/* No search matches */}
          {!loading &&
            !error &&
            doctors.length > 0 &&
            filteredDoctors.length === 0 && (
              <div className="mt-6 rounded-md border border-[#DFDFD7] bg-white p-10 text-center">
                <Users className="mx-auto text-[#07543E]" size={30} />

                <h2 className="mt-3 font-medium">
                  No professional profiles found
                </h2>

                <p className="mt-2 text-sm text-[#68766D]">
                  Try searching another name, specialty or city.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="mt-4 text-sm font-medium text-[#07543E] underline underline-offset-4"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

          {/* API doctor profiles only */}
          {!loading && !error && filteredDoctors.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doctor, index) => {
                const id = doctor.id ?? doctor.doctorId ?? doctor.slug
                const name = getDoctorName(doctor)
                const image = getDoctorImage(doctor)
                const specialty =
                  doctor.specialty ?? doctor.specialization ?? ''
                const location = getDoctorLocation(doctor)
                const verified = isDoctorVerified(doctor)
                const isConnected =
                  id != null && connectedDoctors.includes(String(id))

                return (
                  <article
                    key={id ?? `${name}-${index}`}
                    className="group min-w-0 overflow-hidden rounded-md border border-[#E0E0D8] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#B7D0C2] hover:shadow-lg"
                  >
                    {/* Banner */}
                    <div className="relative flex h-[94px] items-center justify-between bg-[#07543E] px-5 sm:h-[100px] sm:px-6">
                      <Stethoscope
                        size={38}
                        strokeWidth={1.25}
                        className="absolute left-5 top-5 text-[#D8B56B]/60 sm:left-6"
                      />

                      <span className="ml-auto max-w-[60%] truncate text-[10px] font-medium tracking-[0.08em] text-[#F1C66C]">
                        {location.split(',')[0] || 'India'}
                      </span>

                      {/* Circular doctor photo */}
                      <DoctorAvatar image={image} name={name} />
                    </div>

                    {/* Details */}
                    <div className="px-5 pb-5 pt-[56px] sm:px-6 sm:pt-[58px]">
                      <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[#B28A43]">
                        {verified ? (
                          <>
                            <BadgeCheck size={13} />
                            Verified professional
                          </>
                        ) : (
                          'Not verified'
                        )}
                      </p>

                      <h2 className="mt-3 break-words text-lg font-medium tracking-[-0.025em] text-[#10251E] sm:text-xl">
                        {name}
                      </h2>

                      <p className="mt-2 min-h-5 text-xs leading-5 text-[#07543E]">
                        {specialty || 'Veterinary professional'}
                      </p>

                      <p className="mt-2 flex min-h-5 items-start gap-2 text-xs leading-5 text-[#68766D]">
                        <MapPin
                          size={14}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{location || 'Location not provided'}</span>
                      </p>

                      {/* View page + Connect button */}
                      <div className="mt-5 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={id == null}
                          onClick={() => handleViewPage(doctor)}
                          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-sm border border-[#DFDFD7] bg-[#F8F7F3] px-2 text-xs font-medium text-[#10251E] transition hover:border-[#07543E] hover:bg-[#E8F0EB] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View page
                          <ArrowUpRight
                            size={16}
                            className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </button>

                        <button
                          type="button"
                          aria-label={
                            isConnected
                              ? `Remove connection with ${name}`
                              : `Connect with ${name}`
                          }
                          title={
                            isConnected
                              ? 'Connected (local state only)'
                              : 'Connect'
                          }
                          disabled={id == null}
                          onClick={() => handleConnect(doctor)}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isConnected
                              ? 'border-[#07543E] bg-[#E7F0E9] text-[#07543E]'
                              : 'border-transparent bg-white text-[#10251E] hover:border-[#DFDFD7] hover:bg-[#E8F0EB] hover:text-[#07543E]'
                          }`}
                        >
                          {isConnected ? (
                            <span className="text-lg font-medium">✓</span>
                          ) : (
                            <Plus size={20} strokeWidth={1.6} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
