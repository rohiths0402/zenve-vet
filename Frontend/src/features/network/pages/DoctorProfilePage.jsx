
import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  Globe,
  ImagePlus,
  Link2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Share2,
  Stethoscope,
  Trash2,
  Users,
} from 'lucide-react'
import './DoctorProfilePage.css'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

function getAccessToken() {
  return localStorage.getItem('zenveAccessToken')
}

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ''
  )
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function getName(profile) {
  const user = profile?.user || {}

  return String(
    firstValue(
      profile?.fullName,
      profile?.full_name,
      profile?.name,
      user.fullName,
      user.full_name,
      [user.first_name, user.last_name].filter(Boolean).join(' '),
      user.username,
      profile?.username,
      profile?.email,
      user.email,
      'Veterinary professional'
    )
  )
}

function normalizeProfile(data) {
  const profile = data?.profile || data?.doctor_profile || data || {}
  const user =
    data?.user ||
    profile?.user ||
    data?.profile?.user ||
    data?.doctor_profile?.user ||
    {}

  return {
    ...profile,

    // Keep the account ID distinct from the doctor-profile ID.
    id: firstValue(profile?.id, data?.id, null),
    user,
    user_id: firstValue(
      user?.id,
      data?.user_id,
      profile?.user_id,
      null
    ),

    full_name: getName({ ...profile, user }),
    professional_title: firstValue(
      profile?.professional_title,
      profile?.title,
      profile?.job_title,
      'Veterinarian'
    ),
    email: firstValue(profile?.email, user?.email, ''),
    username: firstValue(profile?.username, user?.username, ''),
    specialty: firstValue(profile?.specialty, user?.specialty, ''),
    city: firstValue(profile?.city, user?.city, ''),
    state: firstValue(profile?.state, user?.state, ''),
    about: firstValue(profile?.bio, profile?.about, user?.bio, ''),
    profile_photo_url: firstValue(
      profile?.profile_photo_url,
      user?.profile_photo_url,
      ''
    ),
    banner_image_url: firstValue(
      profile?.banner_image_url,
      user?.banner_image_url,
      ''
    ),
    profile_picture: firstValue(
      profile?.profile_photo_url,
      profile?.profile_picture,
      profile?.profilePicture,
      profile?.avatar_url,
      profile?.avatar,
      user?.profile_photo_url,
      ''
    ),
    banner: firstValue(
      profile?.banner_image_url,
      profile?.banner,
      profile?.banner_image,
      ''
    ),
    website: firstValue(profile?.website, ''),
    experience: firstValue(profile?.experience, ''),
    hospital: firstValue(profile?.hospital, profile?.clinic, ''),
    qualifications: asArray(profile?.qualifications),
    interests: asArray(profile?.interests),
    clinics: asArray(profile?.clinics),
    connections_count: Number(profile?.connections_count ?? 0),
    posts: asArray(profile?.posts),
    cases: asArray(profile?.cases),
    videos: asArray(profile?.videos),
    connections: asArray(profile?.connections),
    is_verified: Boolean(
      profile?.is_verified ?? profile?.isVerified
    ),
  }
}

function extractList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('About')
  const [connecting, setConnecting] = useState(false)
  const [connectionRequested, setConnectionRequested] = useState(false)
  const [openingMessage, setOpeningMessage] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState('')

  const [editForm, setEditForm] = useState({
    full_name: '',
    professional_title: '',
    city: '',
    experience: '',
    qualifications: '',
    state: '',
    specialty: '',
    bio: '',
    website: '',
  })

  const [imageFiles, setImageFiles] = useState({
    profile: null,
    banner: null,
  })

  const [imagePreviews, setImagePreviews] = useState({
    profile: '',
    banner: '',
  })

  const isOwnProfile = !id || id === 'me'

  // Load profile and the author's published content.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      setError('')
      setContentError('')
      setContentLoading(false)

      try {
        const token = getAccessToken()

        if (isOwnProfile && !token) {
          throw new Error('Please sign in to view your profile.')
        }

        const endpoint = isOwnProfile
          ? `${API_BASE_URL}/accounts/profile/`
          : `${API_BASE_URL}/accounts/doctors/${encodeURIComponent(id)}/`

        const response = await fetch(endpoint, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            data.detail ||
              `Unable to load profile (${response.status}).`
          )
        }

        if (cancelled) return

        const normalized = normalizeProfile(data)
        setDoctor(normalized)

        const username = normalized.username || (!isOwnProfile ? id : '')

        if (!username) return

        setContentLoading(true)

        try {
          const types = ['post', 'case', 'video']

          const responses = await Promise.all(
            types.map((type) =>
              fetch(
                `${API_BASE_URL}/posts/?author=${encodeURIComponent(username)}&type=${encodeURIComponent(type)}`,
                {
                  headers: {
                    Accept: 'application/json',
                    ...(token
                      ? { Authorization: `Bearer ${token}` }
                      : {}),
                  },
                }
              )
            )
          )

          const failed = responses.find((item) => !item.ok)

          if (failed) {
            throw new Error(
              `Unable to load profile content (HTTP ${failed.status}).`
            )
          }

          const contentData = await Promise.all(
            responses.map((item) => item.json())
          )

          if (!cancelled) {
            setDoctor((current) => {
              if (!current) return current

              return {
                ...current,
                posts: extractList(contentData[0]),
                cases: extractList(contentData[1]),
                videos: extractList(contentData[2]),
              }
            })
          }
        } catch (contentErr) {
          if (!cancelled) {
            setContentError(
              contentErr.message ||
                'Unable to load posts, cases and videos.'
            )
          }
        } finally {
          if (!cancelled) setContentLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load the profile.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [id, isOwnProfile])

  // Every array is guarded so incomplete API data cannot crash rendering.
  const completionItems = useMemo(() => {
    if (!doctor) return []

    return [
      {
        label: 'Profile photo',
        complete: Boolean(doctor.profile_picture),
      },
      {
        label: 'Story (bio)',
        complete: Boolean(doctor.about),
      },
      {
        label: 'Website',
        complete: Boolean(doctor.website),
      },
      {
        label: 'Location',
        complete: Boolean(doctor.city && doctor.state),
      },
      {
        label: 'Qualifications',
        complete: asArray(doctor.qualifications).length > 0,
      },
      {
        label: 'Verified badge',
        complete: Boolean(doctor.is_verified),
      },
    ]
  }, [doctor])

  const completion = completionItems.length
    ? Math.round(
        (completionItems.filter((item) => item.complete).length /
          completionItems.length) *
          100
      )
    : 0

  function showNotice(message) {
    setNotice(message)
  }

  function openEditProfile() {
    if (!doctor) return

    setEditForm({
      full_name: doctor.full_name || '',
      professional_title: doctor.professional_title || 'Veterinarian',
      city: doctor.city || '',
      experience: doctor.experience || '',
      qualifications: asArray(doctor.qualifications).join(', '),
      state: doctor.state || '',
      specialty: doctor.specialty || '',
      bio: doctor.about || '',
      website: doctor.website || '',
    })

    setImageFiles({ profile: null, banner: null })

    setImagePreviews({
      profile: doctor.profile_picture || '',
      banner: doctor.banner || '',
    })

    setEditError('')
    setEditOpen(true)
  }

  // Handle the profile-completion prompt from Topbar.
  useEffect(() => {
    if (
      searchParams.get('completeProfile') !== '1' ||
      loading ||
      !doctor ||
      !isOwnProfile
    ) {
      return
    }

    const profileIsIncomplete = Boolean(
      !doctor.specialty?.trim() ||
        !doctor.city?.trim() ||
        !doctor.state?.trim() ||
        !doctor.about?.trim() ||
        !doctor.website?.trim()
    )

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('completeProfile')
    setSearchParams(nextParams, { replace: true })

    if (profileIsIncomplete) openEditProfile()
  }, [searchParams, setSearchParams, loading, doctor, isOwnProfile])

  function handleEditChange(event) {
    const { name, value } = event.target

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const { name, files } = event.target
    const file = files?.[0]

    if (!file) return

    const type =
      name === 'profile_photo_file' ? 'profile' : 'banner'

    if (!file.type.startsWith('image/')) {
      setEditError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError('Image size must be 5 MB or less.')
      event.target.value = ''
      return
    }

    setEditError('')

    setImageFiles((current) => ({
      ...current,
      [type]: file,
    }))

    setImagePreviews((current) => {
      const previous = current[type]

      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous)
      }

      return {
        ...current,
        [type]: URL.createObjectURL(file),
      }
    })
  }

  async function saveProfile(event) {
    event.preventDefault()

    const token = getAccessToken()

    if (!token) {
      setEditError('Your session has expired. Please sign in again.')
      return
    }

    setSavingProfile(true)
    setEditError('')

    try {
      const hasImages = Boolean(imageFiles.profile || imageFiles.banner)

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const fields = {
        full_name: editForm.full_name.trim(),
        professional_title: editForm.professional_title.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        specialty: editForm.specialty.trim(),
        experience: editForm.experience.trim(),
        qualifications: editForm.qualifications.trim(),
        bio: editForm.bio.trim(),
        website: editForm.website.trim(),
      }

      let body

      if (hasImages) {
        body = new FormData()

        Object.entries(fields).forEach(([key, value]) => {
          body.append(key, value)
        })

        if (imageFiles.profile) {
          body.append('profile_photo_file', imageFiles.profile)
        }

        if (imageFiles.banner) {
          body.append('banner_image_file', imageFiles.banner)
        }
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(fields)
      }

      const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers,
        body,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const details = Object.entries(data || {})
          .map(([field, errors]) => {
            const message = Array.isArray(errors)
              ? errors.join(', ')
              : String(errors)

            return `${field}: ${message}`
          })
          .join('\n')

        throw new Error(
          data.detail ||
            details ||
            `Unable to save profile (HTTP ${response.status}).`
        )
      }

      if (data.profile_photo_url) {
        localStorage.setItem(
          'zenveProfilePhotoUrl',
          data.profile_photo_url
        )
      }

      window.dispatchEvent(new Event('zenve-profile-updated'))

      setDoctor((current) =>
        normalizeProfile({ ...current, ...data })
      )

      setImageFiles({ profile: null, banner: null })
      setEditOpen(false)
      showNotice('Profile updated successfully.')
    } catch (err) {
      setEditError(err.message || 'Unable to update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleConnect() {
    const token = getAccessToken()

    if (!token) {
      showNotice('Please sign in to send a connection request.')
      return
    }

    const username = doctor?.username || (!isOwnProfile ? id : '')

    if (!username) {
      showNotice('This doctor profile does not have a username.')
      return
    }

    setConnecting(true)
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/connections/requests/`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail =
          data.detail ||
          data.non_field_errors?.join?.(', ') ||
          Object.entries(data)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            )
            .join(' ')

        throw new Error(
          detail ||
            `Connection request failed (HTTP ${response.status}).`
        )
      }

      setConnectionRequested(true)

      showNotice(
        data.detail ||
          data.message ||
          'Connection request sent successfully.'
      )
    } catch (err) {
      showNotice(err.message || 'Unable to send connection request.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleMessage() {
    const token = getAccessToken()

    if (!token) {
      showNotice('Please sign in to message this doctor.')
      return
    }

    // recipientId must be the Django User ID, not a separate profile ID.
    const recipientId =
      doctor?.user?.id ??
      doctor?.user_id ??
      null

    if (!recipientId) {
      console.error('Profile data missing recipient account ID:', doctor)
      showNotice(
        'The profile API does not provide this doctor’s account ID.'
      )
      return
    }

    setOpeningMessage(true)
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/messaging/conversations/`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientId: Number(recipientId),
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail =
          data.detail ||
          data.non_field_errors?.join?.(', ') ||
          Object.entries(data)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            )
            .join(' ')

        throw new Error(
          detail ||
            `Unable to open conversation (HTTP ${response.status}).`
        )
      }

      const conversationId =
        data.id ??
        data.conversation_id ??
        data.conversation?.id ??
        data.data?.id

      if (!conversationId) {
        console.error('Conversation API response:', data)
        throw new Error(
          'The messaging API did not return a conversation ID.'
        )
      }

      // Existing MessagesPage reads the conversation from ?to=.
      navigate(`/messages?to=${encodeURIComponent(conversationId)}`)
    } catch (err) {
      showNotice(
        err.message || 'Unable to open a conversation with this doctor.'
      )
    } finally {
      setOpeningMessage(false)
    }
  }

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showNotice('Profile link copied.')
    } catch {
      showNotice(`Profile link: ${window.location.href}`)
    }
  }

  if (loading) {
    return (
      <main className="doctor-profile-page">
        <div className="doctor-profile-loading">
          <span className="doctor-profile-spinner" />
          Loading your professional page…
        </div>
      </main>
    )
  }

  if (error || !doctor) {
    return (
      <main className="doctor-profile-page">
        <section className="doctor-profile-state">
          <h1>Unable to load profile</h1>
          <p>{error || 'No profile data was returned by the server.'}</p>

          <button
            type="button"
            className="dp-button dp-button--primary"
            onClick={() => navigate('/network')}
          >
            Back to community
          </button>
        </section>
      </main>
    )
  }

  const initials = String(doctor.full_name || 'Veterinary professional')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const location = [doctor.city, doctor.state].filter(Boolean).join(', ')

  function renderContent() {
    const posts = asArray(doctor?.posts)
    const cases = asArray(doctor?.cases)
    const videos = asArray(doctor?.videos)
    const connections = asArray(doctor?.connections)
    const clinics = asArray(doctor?.clinics)

    if (activeTab === 'Posts') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">COMMUNITY JOURNAL</p>
          <h2>Perspectives from practice.</h2>

          {contentLoading && (
            <p className="dp-muted">Loading posts…</p>
          )}

          {contentError && (
            <p className="dp-muted" role="alert">{contentError}</p>
          )}

          {!contentLoading && posts.length === 0 ? (
            <p className="dp-muted">
              No posts are available for this profile yet.
            </p>
          ) : (
            posts.map((post, index) => (
              <article className="dp-content-item" key={post.id || index}>
                <h3>{post.title || 'Community post'}</h3>
                <p>
                  {post.caption ||
                    post.content ||
                    post.body ||
                    post.text ||
                    ''}
                </p>

                {(post.media_url || post.thumbnail_url) && (
                  <img
                    className="dp-content-media"
                    src={post.media_url || post.thumbnail_url}
                    alt={post.title || 'Post media'}
                    loading="lazy"
                  />
                )}
              </article>
            ))
          )}
        </section>
      )
    }

    if (activeTab === 'Cases') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">CLINICAL KNOWLEDGE</p>
          <h2>Cases from practice.</h2>

          {contentLoading && (
            <p className="dp-muted">Loading clinical cases…</p>
          )}

          {contentError && (
            <p className="dp-muted" role="alert">{contentError}</p>
          )}

          {!contentLoading && cases.length === 0 ? (
            <p className="dp-muted">
              No clinical cases have been shared yet.
            </p>
          ) : (
            cases.map((item, index) => (
              <article className="dp-content-item" key={item.id || index}>
                <h3>{item.title || item.name || 'Clinical case'}</h3>
                <p>
                  {item.caption ||
                    item.description ||
                    item.summary ||
                    item.content ||
                    ''}
                </p>

                {(item.media_url || item.thumbnail_url) && (
                  <img
                    className="dp-content-media"
                    src={item.media_url || item.thumbnail_url}
                    alt={item.title || 'Clinical case media'}
                    loading="lazy"
                  />
                )}
              </article>
            ))
          )}
        </section>
      )
    }

    if (activeTab === 'Videos') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">WATCH AND LEARN</p>
          <h2>Videos from the community.</h2>

          {contentLoading && (
            <p className="dp-muted">Loading videos…</p>
          )}

          {contentError && (
            <p className="dp-muted" role="alert">{contentError}</p>
          )}

          {!contentLoading && videos.length === 0 ? (
            <p className="dp-muted">
              No videos are available for this profile yet.
            </p>
          ) : (
            videos.map((video, index) => (
              <article className="dp-content-item" key={video.id || index}>
                <h3>{video.title || 'Professional video'}</h3>
                <p>
                  {video.caption ||
                    video.description ||
                    video.content ||
                    ''}
                </p>

                {(video.media_url || video.thumbnail_url) && (
                  <a
                    href={video.media_url || video.thumbnail_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="dp-content-media"
                      src={video.thumbnail_url || video.media_url}
                      alt={video.title || 'Video thumbnail'}
                      loading="lazy"
                    />
                  </a>
                )}

                {video.url && (
                  <a href={video.url} target="_blank" rel="noreferrer">
                    Watch video
                  </a>
                )}
              </article>
            ))
          )}
        </section>
      )
    }

    if (activeTab === 'Connections') {
      return (
        <section className="dp-section dp-connections-section">
          <p className="dp-eyebrow">PROFESSIONAL NETWORK</p>
          <h2>{doctor.full_name}'s connections</h2>

          {connections.length > 0 ? (
            <div className="dp-connections-grid">
              {connections.map((connection, index) => {
                const person =
                  connection.doctor ||
                  connection.profile ||
                  connection.user ||
                  connection

                const name =
                  person.full_name ||
                  person.fullName ||
                  person.name ||
                  person.username ||
                  'Veterinary Doctor'

                const image =
                  person.profile_photo_url ||
                  person.profile_picture ||
                  person.avatar ||
                  person.profile_image ||
                  ''

                const personId =
                  person.username || person.id || person.pk

                return (
                  <article
                    className="dp-connection-card"
                    key={personId || index}
                  >
                    <div className="dp-connection-avatar">
                      {image ? (
                        <img src={image} alt={name} />
                      ) : (
                        <span>{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="dp-connection-info">
                      <h3>{name}</h3>
                      <p>
                        {person.specialty ||
                          person.specialization ||
                          'Veterinary Professional'}
                      </p>
                      <p className="dp-connection-location">
                        {[person.city, person.state]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>

                    {personId && (
                      <button
                        type="button"
                        className="dp-button"
                        onClick={() =>
                          navigate(
                            `/doctors/${encodeURIComponent(personId)}`
                          )
                        }
                      >
                        View profile
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="dp-empty-state">
              <Users size={28} />
              <h3>No connections yet</h3>
            </div>
          )}
        </section>
      )
    }

    return (
      <>
        <section className="dp-section">
          <p className="dp-eyebrow">BEHIND THE PRACTICE</p>
          <h2>A little about my world.</h2>

          <p className="dp-story">
            {doctor.about ||
              'Your professional story will appear here when you add a biography.'}
          </p>

          <div className="dp-tags">
            {doctor.specialty && <span>{doctor.specialty}</span>}
            <span>Collaborative care</span>
            <span>Animal wellbeing</span>
          </div>
        </section>

        {isOwnProfile && (
          <section className="dp-completion">
            <div className="dp-completion__heading">
              <span>PAGE STRENGTH</span>
              <strong>{completion}%</strong>
            </div>

            <div
              className="dp-progress"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${completion}%` }} />
            </div>

            <div className="dp-completion__items">
              {completionItems.map((item) => (
                <span
                  key={item.label}
                  className={item.complete ? 'is-complete' : ''}
                >
                  {item.complete ? <Check size={14} /> : <Plus size={14} />}
                  {item.label}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="dp-button dp-button--wide"
              onClick={openEditProfile}
            >
              Complete my page
            </button>
          </section>
        )}

        <section className="dp-section dp-clinics">
          <p className="dp-eyebrow">MY CLINICS</p>
          <h2>Where I practise.</h2>

          {clinics.length > 0 ? (
            <div className="dp-clinic-grid">
              {clinics.map((clinic, index) => (
                <article
                  className="dp-clinic-card"
                  key={clinic.id || index}
                >
                  <BriefcaseBusiness size={22} />
                  <h3>{clinic.name || clinic.title || 'Clinic'}</h3>
                  <p>{clinic.city || clinic.address || ''}</p>
                </article>
              ))}
            </div>
          ) : doctor.hospital ? (
            <article className="dp-clinic-card">
              <BriefcaseBusiness size={22} />
              <h3>{doctor.hospital}</h3>
              <p>{location}</p>
            </article>
          ) : isOwnProfile ? (
            <button
              type="button"
              className="dp-add-clinic"
              onClick={() =>
                showNotice(
                  'Clinic creation needs to be connected to your clinics API.'
                )
              }
            >
              <Plus size={23} />
              Add your clinic page
            </button>
          ) : (
            <p className="dp-muted">
              No clinic information has been added.
            </p>
          )}
        </section>

        <section className="dp-section dp-journal">
          <p className="dp-eyebrow">MY CLINICAL JOURNAL</p>
          <h2>Perspectives from practice.</h2>
          <p className="dp-muted">
            New perspectives will appear here as they are shared.
          </p>
        </section>
      </>
    )
  }

  return (
    <main className="doctor-profile-page">
      <button
        type="button"
        className="dp-back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={15} />
        Back to the community
      </button>

      <section className="dp-banner">
        {doctor.banner ? (
          <img src={doctor.banner} alt="" />
        ) : (
          <div className="dp-banner__fallback">
            <span>THE PRACTICE OF POSSIBILITY</span>
            <h1>
              Care with purpose.
              <br />
              Progress with compassion.
            </h1>
          </div>
        )}

        <div className="dp-banner__shade" />

        {isOwnProfile && (
          <button
            type="button"
            className="dp-banner__edit"
            onClick={openEditProfile}
          >
            <ImagePlus size={16} /> Banner & journey
          </button>
        )}
      </section>

      <section className="dp-identity">
        <div className="dp-avatar">
          {doctor.profile_picture ? (
            <img src={doctor.profile_picture} alt="" />
          ) : (
            initials || 'V'
          )}
        </div>

        <div className="dp-identity__info">
          <p className="dp-eyebrow">INDEPENDENT PROFESSIONAL PAGE</p>
          <h1>{doctor.full_name}</h1>

          {doctor.username && (
            <p className="dp-username">@{doctor.username}</p>
          )}

          <p className="dp-location">
            <MapPin size={16} />
            {location || 'Location not added'}
            <span className="dp-location__divider">|</span>
            <Stethoscope size={16} />
            {doctor.specialty || 'Veterinary professional'}
            {doctor.is_verified && <BadgeCheck size={16} />}
          </p>
        </div>

        <div className="dp-actions">
          {isOwnProfile ? (
            <>
              <button
                type="button"
                className="dp-button dp-button--primary"
                onClick={openEditProfile}
              >
                <Pencil size={16} /> Edit page
              </button>

              <button
                type="button"
                className="dp-button"
                onClick={() =>
                  showNotice('Verification requests are not connected yet.')
                }
              >
                <BadgeCheck size={17} /> Get verified
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`dp-button dp-button--primary${
                  connectionRequested ? ' dp-button--requested' : ''
                }`}
                onClick={handleConnect}
                disabled={connecting || connectionRequested}
                aria-live="polite"
              >
                {connectionRequested ? (
                  <Check size={16} />
                ) : (
                  <Users size={16} />
                )}
                {connecting
                  ? 'Sending…'
                  : connectionRequested
                    ? 'Requested'
                    : 'Connect'}
              </button>

              <button
                type="button"
                className="dp-button dp-button--message"
                onClick={handleMessage}
                disabled={openingMessage}
              >
                <MessageCircle size={16} />
                {openingMessage ? 'Opening…' : 'Message'}
              </button>
            </>
          )}

          <button
            type="button"
            className="dp-button"
            onClick={shareProfile}
          >
            <Share2 size={16} /> Share page
          </button>
        </div>
      </section>

      {notice && (
        <div className="dp-notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <nav className="dp-tabs" aria-label="Profile sections">
        {['About', 'Posts', 'Cases', 'Videos', 'Connections'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="dp-body">
        <div className="dp-main">{renderContent()}</div>

        <aside className="dp-sidebar">
          <section className="dp-glance">
            <h2>At a glance</h2>

            <div className="dp-glance__item">
              <Stethoscope />
              <div>
                <span>CLINICAL INTEREST</span>
                <strong>{doctor.specialty || 'Not added yet'}</strong>
              </div>
            </div>

            <div className="dp-glance__item">
              <MapPin />
              <div>
                <span>BASED IN</span>
                <strong>{location || 'Location not added'}</strong>
              </div>
            </div>

            <div className="dp-glance__item">
              <Users />
              <div>
                <span>COMMUNITY</span>
                <strong>
                  {Number(doctor.connections_count || 0)} connections
                </strong>
              </div>
            </div>

            <div className="dp-glance__item">
              <Globe />
              <div>
                <span>PROFESSIONAL PRESENCE</span>

                {doctor.website ? (
                  <a
                    href={doctor.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doctor.website}
                    <Link2 size={13} />
                  </a>
                ) : (
                  <strong>Zenve Vet network</strong>
                )}
              </div>
            </div>

            <p className="dp-glance__note">
              {doctor.is_verified
                ? 'Professional profile verified.'
                : 'Self-created community profile. Credentials have not been verified.'}
            </p>

            {isOwnProfile && (
              <button
                type="button"
                className="dp-delete"
                onClick={() =>
                  showNotice(
                    'Profile deletion is disabled until a secure backend delete flow is implemented.'
                  )
                }
              >
                <Trash2 size={16} /> Delete profile
              </button>
            )}
          </section>
        </aside>
      </div>

      {editOpen && (
        <div
          className="dp-edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingProfile
            ) {
              setEditOpen(false)
            }
          }}
        >
          <section
            className="dp-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dp-edit-title"
          >
            <header className="dp-edit-heading">
              <div>
                <p className="dp-eyebrow">MAKE IT YOURS</p>
                <h2 id="dp-edit-title">Edit profile</h2>
                <p className="dp-edit-subtitle">
                  Update your profile photos, professional details and clinic location.
                </p>
              </div>

              <button
                type="button"
                className="dp-edit-close"
                onClick={() => setEditOpen(false)}
                disabled={savingProfile}
                aria-label="Close edit profile"
              >
                ×
              </button>
            </header>

            <form className="dp-edit-form" onSubmit={saveProfile}>
              <section className="dp-edit-section">
                <h3>Profile images</h3>

                <div className="dp-upload-grid">
                  <label className="dp-upload-card">
                    <span className="dp-upload-icon">
                      <ImagePlus size={26} />
                    </span>

                    <span className="dp-upload-copy">
                      <strong>Profile image</strong>
                      <small>JPG, PNG or WebP</small>
                      <span>
                        <Camera size={15} /> Upload image
                      </span>
                    </span>

                    <input
                      name="profile_photo_file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />

                    {imagePreviews.profile && (
                      <img
                        src={imagePreviews.profile}
                        alt="Profile preview"
                        className="dp-image-preview dp-image-preview--profile"
                      />
                    )}
                  </label>

                  <label className="dp-upload-card">
                    <span className="dp-upload-icon">
                      <ImagePlus size={26} />
                    </span>

                    <span className="dp-upload-copy">
                      <strong>Banner image</strong>
                      <small>Recommended: wide landscape image</small>
                      <span>
                        <Camera size={15} /> Upload image
                      </span>
                    </span>

                    <input
                      name="banner_image_file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />

                    {imagePreviews.banner && (
                      <img
                        src={imagePreviews.banner}
                        alt="Banner preview"
                        className="dp-image-preview dp-image-preview--banner"
                      />
                    )}
                  </label>
                </div>

                <p className="dp-upload-help">
                  Choose images up to 5 MB each. Selected images preview here before saving.
                </p>
              </section>

              <section className="dp-edit-section">
                <h3>Professional details</h3>

                <div className="dp-edit-grid">
                  <label>
                    Full name
                    <input
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                      maxLength={150}
                      placeholder="Your name"
                    />
                  </label>

                  <label>
                    Professional title
                    <input
                      name="professional_title"
                      value={editForm.professional_title}
                      onChange={handleEditChange}
                      maxLength={120}
                      placeholder="Veterinarian"
                    />
                  </label>

                  <label>
                    City
                    <input
                      name="city"
                      value={editForm.city}
                      onChange={handleEditChange}
                      maxLength={120}
                      placeholder="City"
                    />
                  </label>

                  <label>
                    State
                    <input
                      name="state"
                      value={editForm.state}
                      onChange={handleEditChange}
                      maxLength={120}
                      placeholder="State"
                    />
                  </label>

                  <label>
                    Specialty
                    <input
                      name="specialty"
                      value={editForm.specialty}
                      onChange={handleEditChange}
                      maxLength={120}
                      placeholder="e.g. Small animal surgery"
                    />
                  </label>

                  <label>
                    Experience
                    <input
                      name="experience"
                      value={editForm.experience}
                      onChange={handleEditChange}
                      maxLength={80}
                      placeholder="e.g. 5 years"
                    />
                  </label>

                  <label className="dp-edit-full">
                    Qualifications
                    <input
                      name="qualifications"
                      value={editForm.qualifications}
                      onChange={handleEditChange}
                      maxLength={500}
                      placeholder="BVSc, MVSc..."
                    />
                  </label>

                  <label className="dp-edit-full">
                    About you
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      rows={4}
                      maxLength={5000}
                      placeholder="Tell the community about your practice and interests."
                    />
                  </label>

                  <label className="dp-edit-full">
                    Website
                    <input
                      name="website"
                      type="url"
                      value={editForm.website}
                      onChange={handleEditChange}
                      placeholder="https://example.com"
                    />
                  </label>
                </div>
              </section>

              {editError && (
                <p className="dp-edit-error" role="alert">
                  {editError}
                </p>
              )}

              <footer className="dp-edit-actions">
                <button
                  type="button"
                  className="dp-button"
                  onClick={() => setEditOpen(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dp-button dp-button--primary"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    'Saving…'
                  ) : (
                    <>
                      <Check size={16} /> Save changes
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
