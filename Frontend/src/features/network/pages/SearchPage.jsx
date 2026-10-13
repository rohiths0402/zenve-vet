
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Stethoscope,
  MapPin,
  BadgeCheck,
  ArrowUpRight,
  LoaderCircle,
  RotateCcw,
  FileText,
  PlayCircle,
  BookOpen,
  UserRound,
  X,
} from 'lucide-react'

const SPECIALTIES = [
  'Dermatology',
  'Surgery',
  'Livestock',
  'Equine',
  'Imaging',
  'Nutrition',
  'Wildlife',
  'Preventive',
]

const STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Gujarat',
  'Punjab',
  'Delhi',
  'Telangana',
  'Andhra Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
]

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Doctors', value: 'doctors' },
  { label: 'Cases', value: 'cases' },
  { label: 'Stories & videos', value: 'stories' },
]

function getItemType(item) {
  return String(item.type ?? item.category ?? '').toLowerCase()
}

function getItemTitle(item) {
  return item.name ?? item.title ?? 'Untitled'
}

function getItemDescription(item) {
  return item.bio ?? item.description ?? item.summary ?? ''
}

function getItemId(item) {
  return item.id ?? item.doctorId ?? item.caseId ?? item.postId
}

function getItemImage(item) {
  return item.imageUrl ?? item.profileImage ?? item.photoUrl ?? item.thumbnailUrl ?? ''
}

function isDoctor(item) {
  const type = getItemType(item)
  return type.includes('doctor') || type.includes('vet')
}

function isVerified(item) {
  return Boolean(item.verified ?? item.isVerified)
}

function normalizeResults(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return null
}

function getResultLocation(item) {
  if (item.location) return item.location
  const city = item.city ?? ''
  const state = item.state ?? item.stateName ?? ''
  if (city && state && !city.toLowerCase().includes(state.toLowerCase())) {
    return `${city}, ${state}`
  }
  return city || state
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const queryFromUrl = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(queryFromUrl)
  const [stateFilter, setStateFilter] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [takeawaysOnly, setTakeawaysOnly] = useState(false)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setQuery(queryFromUrl)
  }, [queryFromUrl])

  const loadResults = useCallback(async (signal) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()

      if (queryFromUrl.trim()) params.set('q', queryFromUrl.trim())
      if (stateFilter) params.set('state', stateFilter)
      if (specialty) params.set('specialty', specialty)
      if (activeTab !== 'all') params.set('type', activeTab)
      if (verifiedOnly) params.set('verified', 'true')
      if (takeawaysOnly) params.set('hasTakeaways', 'true')

      const queryString = params.toString()
      const endpoint = `/api/search${queryString ? `?${queryString}` : ''}`

      const response = await fetch(endpoint, {
        method: 'GET',
        signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Search API endpoint was not found. Backend integration may still be pending.'
            : `Search failed (HTTP ${response.status}).`,
        )
      }

      const data = await response.json()
      const items = normalizeResults(data)

      if (!items) {
        throw new Error('The search API returned an unexpected response format.')
      }

      setResults(items)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load search results.')
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [
    queryFromUrl,
    stateFilter,
    specialty,
    activeTab,
    verifiedOnly,
    takeawaysOnly,
  ])

  useEffect(() => {
    const controller = new AbortController()
    loadResults(controller.signal)
    return () => controller.abort()
  }, [loadResults, retryCount])

  function handleSearch(event) {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    const trimmedQuery = query.trim()

    if (trimmedQuery) nextParams.set('q', trimmedQuery)
    else nextParams.delete('q')

    setSearchParams(nextParams)
  }

  function resetFilters() {
    setStateFilter('')
    setSpecialty('')
    setVerifiedOnly(false)
    setTakeawaysOnly(false)
  }

  function clearSearch() {
    setQuery('')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    setSearchParams(nextParams)
  }

  function openResult(item) {
    const id = getItemId(item)
    if (id == null) return

    const type = getItemType(item)

    if (isDoctor(item)) {
      navigate(`/doctors/${id}`)
    } else if (type.includes('case')) {
      navigate(`/clinical-cases/${id}`)
    } else if (
      type.includes('story') ||
      type.includes('video') ||
      type.includes('post')
    ) {
      navigate(`/posts/${id}`)
    }
  }

  const visibleResults = results.filter((item) => {
    if (activeTab === 'doctors') return isDoctor(item)
    if (activeTab === 'cases') return getItemType(item).includes('case')
    if (activeTab === 'stories') {
      const type = getItemType(item)
      return type.includes('story') || type.includes('video') || type.includes('post')
    }
    return true
  })

  return (
    <main className="min-h-screen bg-[#F7F7F3] text-[#10251E]">
      <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-8 sm:px-8 lg:px-[59px] lg:pt-16">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C88A3D]">
            Discover
          </p>
          <h1 className="mt-5 text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl lg:text-[44px]">
            Find people, cases &amp; answers.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#65736A] sm:text-base">
            Search the veterinary community for professionals, clinical knowledge and shared experiences.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mt-9 flex flex-col gap-3 sm:mt-12 lg:flex-row">
          <div className="flex h-[51px] min-w-0 flex-1 items-center gap-3 rounded-md border border-[#DFDFD7] bg-white px-4 transition focus-within:border-[#07543E] focus-within:ring-2 focus-within:ring-[#07543E]/10">
            <Search size={21} className="shrink-0 text-[#66766E]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people, cases and specialties..."
              aria-label="Search people, cases and specialties"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8A958D]"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search text"
                onClick={clearSearch}
                className="rounded p-1 text-[#68766D] hover:bg-[#F1F3EF] hover:text-[#07543E]"
              >
                <X size={17} />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit search"
              className="rounded-md bg-[#07543E] p-2 text-white transition hover:bg-[#064330]"
            >
              <Search size={18} />
            </button>
          </div>

          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            aria-label="Filter by state"
            className="h-[51px] w-full rounded-md border border-[#DFDFD7] bg-white px-4 text-sm outline-none focus:border-[#07543E] sm:w-48 lg:w-[177px]"
          >
            <option value="">All states</option>
            {STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </form>

        <section className="mt-7 border-y border-[#DFDFD7] py-[15px]">
          <div className="flex flex-wrap items-center gap-2">
            {SPECIALTIES.map((item) => {
              const selected = specialty === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSpecialty((current) => current === item ? '' : item)}
                  className={`min-h-10 rounded-[3px] border px-[15px] text-sm transition ${
                    selected
                      ? 'border-[#07543E] bg-[#07543E] font-semibold text-white'
                      : 'border-[#DFDFD7] bg-white text-[#18251F] hover:border-[#07543E] hover:bg-[#EDF3EF]'
                  }`}
                >
                  {item}
                </button>
              )
            })}

            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[#DFDFD7] px-3.5 text-sm hover:bg-white">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="h-4 w-4 accent-[#07543E]"
              />
              <BadgeCheck size={16} />
              Verified only
            </label>

            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[#DFDFD7] px-3.5 text-sm hover:bg-white">
              <input
                type="checkbox"
                checked={takeawaysOnly}
                onChange={(event) => setTakeawaysOnly(event.target.checked)}
                className="h-4 w-4 accent-[#07543E]"
              />
              Has takeaways
            </label>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#52685C] underline underline-offset-4 hover:text-[#07543E]"
          >
            <RotateCcw size={13} />
            Clear filters
          </button>
        </section>

        <nav aria-label="Search result categories" className="flex min-h-[68px] flex-wrap items-stretch gap-1 border-b border-[#DFDFD7]">
          {TABS.map(({ label, value }) => {
            const selected = activeTab === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveTab(value)}
                className={`relative flex items-center px-4 text-sm transition sm:px-6 ${
                  selected ? 'font-medium text-[#07543E]' : 'text-[#27332C] hover:text-[#07543E]'
                }`}
              >
                {label}
                {selected && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#07543E]" />}
              </button>
            )
          })}
        </nav>

        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-medium tracking-tight">
              {TABS.find((tab) => tab.value === activeTab)?.label} results
            </h2>
            {!loading && !error && (
              <span className="text-sm text-[#6C776F]">
                {visibleResults.length} {visibleResults.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3" role="status" aria-live="polite">
              <LoaderCircle size={30} className="animate-spin text-[#07543E]" />
              <p className="text-sm text-[#65736A]">Finding relevant results...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-[#E2D9CD] bg-white px-6 py-12 text-center">
              <p className="font-medium">We couldn&apos;t load the results.</p>
              <p className="mt-2 text-sm text-[#6C776F]">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#07543E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#064330]"
              >
                <RotateCcw size={15} />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && visibleResults.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-[#D9DDD4] bg-white px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0E9] text-[#07543E]">
                {activeTab === 'cases' ? <FileText size={24} /> : activeTab === 'stories' ? <BookOpen size={24} /> : <Stethoscope size={25} />}
              </div>
              <h3 className="mt-4 text-lg font-medium">
                {queryFromUrl ? 'No matching results' : 'No results available yet'}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6C776F]">
                {queryFromUrl
                  ? 'Try a different search term or clear some filters.'
                  : 'No results were returned by the search API. Try another filter or check back after integration.'}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-md border border-[#D9DDD4] px-4 py-2 text-sm font-medium transition hover:bg-[#F7F7F3]"
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && visibleResults.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleResults.map((item, index) => {
                const title = getItemTitle(item)
                const type = getItemType(item)
                const id = getItemId(item)
                const doctor = isDoctor(item)
                const verified = isVerified(item)
                const image = getItemImage(item)
                const location = getResultLocation(item)
                const specialtyLabel = item.specialty ?? item.specialization ?? ''

                return (
                  <article
                    key={id ?? `${type}-${title}-${index}`}
                    className="group min-w-0 overflow-hidden rounded-[7px] border border-[#E0E0D8] bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#103C2B]/5"
                  >
                    <div className="relative flex h-[110px] items-center justify-between bg-[#07543E] px-7">
                      <Stethoscope size={42} strokeWidth={1.3} className="text-[#A5A96A]/55" />
                      {location && (
                        <span className="max-w-[60%] truncate text-xs tracking-wide text-[#F1C66C]">
                          {location}
                        </span>
                      )}
                      {verified && (
                        <span className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-white">
                          <BadgeCheck size={14} />
                          Verified
                        </span>
                      )}
                      {image && (
                        <img
                          src={image}
                          alt={`${title} thumbnail`}
                          loading="lazy"
                          className="absolute bottom-[-47px] left-7 h-[94px] w-[94px] rounded-full border-[5px] border-white bg-[#F0F1EB] object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>

                    <div className="p-6">
                      {image ? (
                        <div className="h-9" />
                      ) : (
                        <div className="flex h-9 items-start">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#E7F0E9] text-[#07543E]">
                            {doctor ? <UserRound size={20} /> : type.includes('case') ? <FileText size={20} /> : <PlayCircle size={20} />}
                          </div>
                        </div>
                      )}

                      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[#C58C54]">
                        {doctor ? 'Veterinary professional' : type || 'Community result'}
                        {doctor && !verified ? ' · Not verified' : ''}
                      </p>

                      <h3 className="mt-3 break-words text-xl font-medium tracking-tight">{title}</h3>

                      {specialtyLabel && (
                        <p className="mt-1 text-sm text-[#49675A]">{specialtyLabel}</p>
                      )}

                      {location && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6C776F]">
                          <MapPin size={14} />
                          {location}
                        </p>
                      )}

                      {getItemDescription(item) && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6C776F]">
                          {getItemDescription(item)}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => openResult(item)}
                        disabled={id == null}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#07543E] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        View {doctor ? 'profile' : 'result'}
                        <ArrowUpRight size={16} />
                      </button>
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
