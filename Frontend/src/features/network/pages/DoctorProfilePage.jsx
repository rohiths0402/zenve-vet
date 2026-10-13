
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Stethoscope,
  BadgeCheck,
  Mail,
  Phone,
  UserRound,
  Plus,
  Link2,
  MessageCircle,
  LoaderCircle,
} from 'lucide-react'

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('About')
  const [error, setError] = useState('')
  const [showMessageButton, setShowMessageButton] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProfile() {
      if (!id) {
        setError('Doctor ID is missing.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      setDoctor(null)

      try {
        const response = await fetch(
          `/api/doctors/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'Doctor profile not found.'
              : `Unable to load profile (${response.status}).`
          )
        }

        const result = await response.json()
        const profile = result.doctor ?? result.data ?? result

        if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
          throw new Error('Invalid doctor profile API response.')
        }

        setDoctor(profile)
      } catch (err) {
        if (err.name === 'AbortError') return

        setDoctor(null)
        setError(
          err.message ||
            'Unable to load this profile. Please check the API connection.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => controller.abort()
  }, [id])

  const name =
    doctor?.name ??
    doctor?.fullName ??
    doctor?.doctorName ??
    'Doctor'

  const image =
    doctor?.imageUrl ??
    doctor?.profileImage ??
    doctor?.photoUrl ??
    doctor?.profilePicture ??
    doctor?.avatarUrl ??
    ''

  const specialty =
    doctor?.specialty ?? doctor?.specialization ?? ''

  const location =
    doctor?.location ??
    [doctor?.city, doctor?.state ?? doctor?.stateName]
      .filter(Boolean)
      .join(', ')

  const bio =
    doctor?.bio ?? doctor?.about ?? doctor?.description ?? ''

  const verified = Boolean(
    doctor?.verified ?? doctor?.isVerified
  )

  const tabs = ['About', 'Posts', 'Cases', 'Videos']

  function openChat() {
    if (!doctor) return

    navigate('/chat', {
      state: {
        doctor: {
          ...doctor,
          id: doctor.id ?? doctor.doctorId ?? id,
          name,
          specialty,
          location,
          imageUrl: image,
        },
      },
    })
  }

  async function shareProfile() {
    try {
      const profileUrl = window.location.href

      if (navigator.share) {
        await navigator.share({
          title: name,
          url: profileUrl,
        })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl)
        window.alert('Profile link copied!')
      } else {
        window.prompt('Copy this profile link:', profileUrl)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Unable to share profile:', err)
      }
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center gap-3 bg-[#F7F7F3]">
        <LoaderCircle
          size={22}
          className="animate-spin text-[#07543E]"
        />
        <p className="text-sm text-[#52685C]">
          Loading doctor profile...
        </p>
      </main>
    )
  }

  if (error || !doctor) {
    return (
      <main className="min-h-screen bg-[#F7F7F3] p-6 sm:p-8">
        <button
          type="button"
          onClick={() => navigate('/network')}
          className="mb-6 flex items-center gap-2 text-sm text-[#07543E]"
        >
          <ArrowLeft size={16} />
          Back to network
        </button>

        <div className="mx-auto max-w-3xl border border-[#DFDFD7] bg-white p-6 sm:p-8">
          <h1 className="text-xl font-medium">
            Unable to display profile
          </h1>

          <p className="mt-3 break-words text-sm text-[#68766D]">
            {error || 'Doctor profile not found.'}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-md bg-[#07543E] px-4 py-2.5 text-sm text-white transition hover:bg-[#064431]"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F7F3] text-[#18231E]">
      <div className="mx-auto max-w-[1240px] px-5 py-7 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/network')}
          className="mb-6 flex items-center gap-2 text-xs text-[#52665C] transition hover:text-[#07543E]"
        >
          <ArrowLeft size={15} />
          Back to the community
        </button>

        {/* Profile banner */}
        <section className="relative h-[230px] overflow-hidden bg-[#17392D] sm:h-[255px]">
          <img
            src="https://zenvevet.lovable.app/assets/clinical-case-D1xD0hpo.jpg"
            alt="Veterinary care"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#102F24]/95 via-[#102F24]/65 to-transparent" />

          <div className="relative px-6 pt-12 sm:px-10">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#D8B56B]">
              The practice of possibility
            </p>

            <h2 className="mt-5 text-2xl leading-tight text-white sm:text-3xl">
              Care with purpose.
              <br />
              Progress with compassion.
            </h2>
          </div>
        </section>

        {/* Profile details */}
        <section className="flex flex-col gap-5 border-b border-[#DEDFD7] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <div className="-mt-4 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E8EEE8] text-[#07543E]">
              {image && !imageError ? (
                <img
                  src={image}
                  alt={name}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <div className="min-w-0 pt-4">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#B28A43]">
                Professional page
              </p>

              <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-medium sm:text-3xl">
                {name}
                {verified && (
                  <BadgeCheck
                    size={18}
                    className="text-[#07543E]"
                  />
                )}
              </h1>

              <p className="mt-2 text-sm text-[#07543E]">
                {specialty || 'Veterinary professional'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#68766D]">
                <MapPin size={14} />
                {location || 'Location not provided'}
                <span>·</span>
                Veterinary professional
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMessageButton(true)}
              aria-expanded={showMessageButton}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#07543E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#064431]"
            >
              <Plus size={16} />
              Connect
            </button>

            <div
              aria-hidden={!showMessageButton}
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showMessageButton
                  ? 'max-w-[160px] translate-x-0 opacity-100'
                  : 'max-w-0 -translate-x-3 opacity-0'
              }`}
            >
              <button
                type="button"
                tabIndex={showMessageButton ? 0 : -1}
                onClick={openChat}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#176B5B] bg-white px-5 py-2.5 text-sm font-medium text-[#176B5B] transition hover:bg-[#DDF3ED]"
              >
                <MessageCircle size={16} />
                Message
              </button>
            </div>

            <button
              type="button"
              onClick={shareProfile}
              className="inline-flex items-center justify-center gap-2 border border-[#DCDDD5] px-4 py-2.5 text-xs transition hover:bg-white"
            >
              <Link2 size={15} />
              Share page
            </button>
          </div>
        </section>

        {/* Tabs */}
        <nav
          aria-label="Doctor profile sections"
          className="flex gap-8 overflow-x-auto border-b border-[#DEDFD7]"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`relative shrink-0 py-4 text-xs ${
                activeTab === tab
                  ? 'font-semibold text-[#07543E]'
                  : 'text-[#52665C]'
              }`}
            >
              {tab}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#07543E]" />
              )}
            </button>
          ))}
        </nav>

        {/* About tab */}
        {activeTab === 'About' ? (
          <div className="grid gap-5 pt-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="border border-[#E3E3DC] bg-white p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#B28A43]">
                Behind the practice
              </p>

              <h2 className="mt-3 text-2xl font-medium">
                A little about my world.
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#68736B]">
                {bio || 'No biography has been provided for this profile.'}
              </p>

              {Array.isArray(doctor.clinicalInterests) &&
                doctor.clinicalInterests.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-sm font-medium">
                      Clinical interests
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {doctor.clinicalInterests.map((interest, index) => (
                        <span
                          key={`${String(
                            typeof interest === 'string'
                              ? interest
                              : interest?.name ?? index
                          )}-${index}`}
                          className="rounded-full bg-[#EAF0EA] px-3 py-2 text-xs text-[#285342]"
                        >
                          {typeof interest === 'string'
                            ? interest
                            : interest?.name ?? 'Interest'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </section>

            {/* Professional details */}
            <aside className="border border-[#E3E3DC] bg-white p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#B28A43]">
                At a glance
              </p>

              <h2 className="mt-3 text-2xl font-medium">
                Professional details
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <Stethoscope
                    size={17}
                    className="mt-1 shrink-0 text-[#07543E]"
                  />
                  <div>
                    <p className="text-xs text-[#758077]">
                      Clinical interest
                    </p>
                    <p className="mt-1 text-sm">
                      {specialty || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin
                    size={17}
                    className="mt-1 shrink-0 text-[#07543E]"
                  />
                  <div>
                    <p className="text-xs text-[#758077]">
                      Based in
                    </p>
                    <p className="mt-1 text-sm">
                      {location || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <BadgeCheck
                    size={17}
                    className="mt-1 shrink-0 text-[#07543E]"
                  />
                  <div>
                    <p className="text-xs text-[#758077]">
                      Verification status
                    </p>
                    <p className="mt-1 text-sm">
                      {verified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>

                {doctor.email && (
                  <div className="flex gap-3">
                    <Mail
                      size={17}
                      className="mt-1 shrink-0 text-[#07543E]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-[#758077]">Email</p>
                      <a
                        href={`mailto:${doctor.email}`}
                        className="mt-1 break-all text-sm text-[#07543E]"
                      >
                        {doctor.email}
                      </a>
                    </div>
                  </div>
                )}

                {doctor.phone && (
                  <div className="flex gap-3">
                    <Phone
                      size={17}
                      className="mt-1 shrink-0 text-[#07543E]"
                    />
                    <div>
                      <p className="text-xs text-[#758077]">Phone</p>
                      <a
                        href={`tel:${doctor.phone}`}
                        className="mt-1 text-sm text-[#07543E]"
                      >
                        {doctor.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <section className="mt-6 border border-[#E3E3DC] bg-white p-8 text-center">
            <h2 className="text-xl font-medium">{activeTab}</h2>
            <p className="mt-3 text-sm text-[#758077]">
              This section is ready for the existing{' '}
              {activeTab.toLowerCase()} content integration.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
