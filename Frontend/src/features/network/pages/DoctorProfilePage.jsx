import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  const profile = data?.profile || data?.user || data
  const user = profile?.user || {}

  return {
    ...profile,
    id: firstValue(profile?.id, user.id, null),
    full_name: getName(profile),
    email: firstValue(profile?.email, user.email, ''),
    username: firstValue(profile?.username, user.username, ''),
    specialty: firstValue(profile?.specialty, ''),
    city: firstValue(profile?.city, ''),
    state: firstValue(profile?.state, ''),
    about: firstValue(profile?.bio, profile?.about, ''),
    profile_photo_url: firstValue(profile?.profile_photo_url, ''),
    banner_image_url: firstValue(profile?.banner_image_url, ''),
    profile_picture: firstValue(
      profile?.profile_photo_url,
      profile?.profile_picture,
      profile?.profilePicture,
      profile?.avatar_url,
      profile?.avatar,
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
    qualifications: Array.isArray(profile?.qualifications)
      ? profile.qualifications
      : [],
    interests: Array.isArray(profile?.interests)
      ? profile.interests
      : [],
    clinics: Array.isArray(profile?.clinics) ? profile.clinics : [],
    connections_count: Number(profile?.connections_count ?? 0),
    posts: Array.isArray(profile?.posts) ? profile.posts : [],
    cases: Array.isArray(profile?.cases) ? profile.cases : [],
    videos: Array.isArray(profile?.videos) ? profile.videos : [],
    is_verified: Boolean(profile?.is_verified ?? profile?.isVerified),
  }
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('About')

  const [editOpen, setEditOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState('')

  const [editForm, setEditForm] = useState({
    city: '',
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

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      setError('')

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
            data.detail || `Unable to load profile (${response.status}).`
          )
        }

        if (!cancelled) {
          setDoctor(normalizeProfile(data))
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

  const completionItems = useMemo(() => {
    if (!doctor) return []

    return [
      {
        label: 'Profile photo',
        complete: Boolean(doctor.profile_picture),
      },
      { label: 'Story (bio)', complete: Boolean(doctor.about) },
      { label: 'Website', complete: Boolean(doctor.website) },
      {
        label: 'Location',
        complete: Boolean(doctor.city && doctor.state),
      },
      {
        label: 'Qualifications',
        complete: doctor.qualifications.length > 0,
      },
      { label: 'Verified badge', complete: doctor.is_verified },
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
    setEditForm({
      city: doctor.city || '',
      state: doctor.state || '',
      specialty: doctor.specialty || '',
      bio: doctor.about || '',
      website: doctor.website || '',
    })

    setImageFiles({
      profile: null,
      banner: null,
    })

    setImagePreviews({
      profile: doctor.profile_picture || '',
      banner: doctor.banner || '',
    })

    setEditError('')
    setEditOpen(true)
  }

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

    setImagePreviews((current) => ({
      ...current,
      [type]: URL.createObjectURL(file),
    }))
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
      /*
       * The existing profile API accepts JSON and image URLs.
       * Selected files need a multipart upload endpoint before
       * they can be permanently saved.
       */
      if (imageFiles.profile || imageFiles.banner) {
        setEditError(
          'Image previews work, but file uploads are not connected to the backend yet. Save your text changes separately.'
        )
        setSavingProfile(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: editForm.city.trim(),
          state: editForm.state.trim(),
          specialty: editForm.specialty.trim(),
          bio: editForm.bio.trim(),
          website: editForm.website.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const details = Object.entries(data || {})
          .map(([field, errors]) => {
            const message = Array.isArray(errors)
              ? errors.join(', ')
              : errors

            return `${field}: ${message}`
          })
          .join('\n')

        throw new Error(
          data.detail ||
            details ||
            `Unable to save profile (HTTP ${response.status}).`
        )
      }

      setDoctor((current) =>
        normalizeProfile({
          ...current,
          ...data,
        })
      )

      setEditOpen(false)
      showNotice('Profile updated successfully.')
    } catch (err) {
      setEditError(err.message || 'Unable to update your profile.')
    } finally {
      setSavingProfile(false)
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

  const initials = doctor.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const location = [doctor.city, doctor.state].filter(Boolean).join(', ')

  function renderContent() {
    if (activeTab === 'Posts') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">COMMUNITY JOURNAL</p>
          <h2>Perspectives from practice.</h2>

          {doctor.posts.length ? (
            doctor.posts.map((post, index) => (
              <article className="dp-content-item" key={post.id || index}>
                <h3>{post.title || 'Community post'}</h3>
                <p>{post.content || post.body || post.text || ''}</p>
              </article>
            ))
          ) : (
            <p className="dp-muted">
              No posts are available for this profile yet.
            </p>
          )}
        </section>
      )
    }

    if (activeTab === 'Cases') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">CLINICAL KNOWLEDGE</p>
          <h2>Cases from practice.</h2>

          {doctor.cases.length ? (
            doctor.cases.map((item, index) => (
              <article className="dp-content-item" key={item.id || index}>
                <h3>{item.title || item.name || 'Clinical case'}</h3>
                <p>{item.description || item.summary || ''}</p>
              </article>
            ))
          ) : (
            <p className="dp-muted">
              No clinical cases have been shared yet.
            </p>
          )}
        </section>
      )
    }

    if (activeTab === 'Videos') {
      return (
        <section className="dp-section">
          <p className="dp-eyebrow">WATCH AND LEARN</p>
          <h2>Videos from the community.</h2>

          {doctor.videos.length ? (
            doctor.videos.map((video, index) => (
              <article className="dp-content-item" key={video.id || index}>
                <h3>{video.title || 'Professional video'}</h3>
                <p>{video.description || ''}</p>

                {video.url && (
                  <a href={video.url} target="_blank" rel="noreferrer">
                    Watch video
                  </a>
                )}
              </article>
            ))
          ) : (
            <p className="dp-muted">
              No videos are available for this profile yet.
            </p>
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

          {doctor.clinics.length ? (
            <div className="dp-clinic-grid">
              {doctor.clinics.map((clinic, index) => (
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

              <button
                type="button"
                className="dp-button"
                onClick={openEditProfile}
              >
                <Camera size={16} /> Banner & journey
              </button>

              <button
                type="button"
                className="dp-button"
                onClick={() =>
                  showNotice('Phone alerts are not configured yet.')
                }
              >
                <Bell size={16} /> Phone alerts
              </button>
            </>
          ) : (
            <button
              type="button"
              className="dp-button dp-button--primary"
              onClick={() =>
                showNotice(
                  'Connection requests need to be connected to the connections API.'
                )
              }
            >
              <Users size={16} /> Connect
            </button>
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
        {['About', 'Posts', 'Cases', 'Videos'].map((tab) => (
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
                <strong>{doctor.connections_count} connections</strong>
              </div>
            </div>

            <div className="dp-glance__item">
              <Globe />
              <div>
                <span>PROFESSIONAL PRESENCE</span>

                {doctor.website ? (
                  <a href={doctor.website} target="_blank" rel="noreferrer">
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
            <div className="dp-edit-heading">
              <div>
                <p className="dp-eyebrow">YOUR PROFESSIONAL PAGE</p>
                <h2 id="dp-edit-title">Edit profile</h2>
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
            </div>

            <form onSubmit={saveProfile}>
              <div className="dp-edit-grid">
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
                  City
                  <input
                    name="city"
                    value={editForm.city}
                    onChange={handleEditChange}
                    maxLength={120}
                    placeholder="Your city"
                  />
                </label>

                <label>
                  State
                  <input
                    name="state"
                    value={editForm.state}
                    onChange={handleEditChange}
                    maxLength={120}
                    placeholder="Your state"
                  />
                </label>

                <label>
                  Website
                  <input
                    name="website"
                    type="url"
                    value={editForm.website}
                    onChange={handleEditChange}
                    placeholder="https://example.com"
                  />
                </label>

                <label className="dp-edit-full">
                  Professional bio
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    rows={5}
                    maxLength={5000}
                    placeholder="Tell the community about your practice and interests."
                  />
                </label>

                <label className="dp-edit-full">
                  Profile photo
                  <input
                    name="profile_photo_file"
                    type="file"
                    accept="image/*"
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

                <label className="dp-edit-full">
                  Banner image
                  <input
                    name="banner_image_file"
                    type="file"
                    accept="image/*"
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

              {editError && (
                <p className="dp-edit-error" role="alert">
                  {editError}
                </p>
              )}

              <div className="dp-edit-actions">
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
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}