import { useEffect, useRef, useState } from "react";



import {



  ArrowDownRight,



  ArrowLeft,



  ArrowRight,



  ArrowUpRight,



  BadgeCheck,



  Bell,



  BriefcaseMedical,



  Camera,



  Check,



  ChevronDown,



  CircleHelp,



  ClipboardList,



  Copy,



  FileText,



  Globe,



  Heart,



  Image as ImageIcon,



  Link as LinkIcon,



  MapPin,



  MessageCircle,



  MoreHorizontal,



  Plus,



  Share2,



  ShieldCheck,



  Stethoscope,



  Trash2,



  UserRound,



  Video,



  X,



} from "lucide-react";



import { getMyProfile, updateMyProfile } from "../../../services/profileService";



const initialProfile = {



  name: "Muzammil",



  specialty: "Veterinary Dermatology",



  location: "Tirupattur",



  role: "Veterinary professional",



  bio: "HI",



  website: "",



  interests: [



    "Veterinary Dermatology",



    "Collaborative care",



    "Animal wellbeing",



  ],



  profileImage: "",



  bannerImage: "/assets/clinical-case-D1xD0hpo.jpg",



};







const initialClinics = [];







const tabs = [



  { label: "About", icon: UserRound },



  { label: "Posts", icon: FileText },



  { label: "Cases", icon: ClipboardList },



  { label: "Videos", icon: Video },



];







const checklist = [



  { label: "Profile photo", icon: Camera },



  { label: "Story (bio)", icon: FileText },



  { label: "Website", icon: Globe },



  { label: "Location", icon: MapPin },



  { label: "Gallery", icon: ImageIcon },



  { label: "Verified badge", icon: BadgeCheck },



];















function SectionHeading({ eyebrow, title, action, onAction }) {



  return (



    <div className="mb-5 flex items-center justify-between gap-3">



      <div>



        {eyebrow && (



          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">



            {eyebrow}



          </p>



        )}



        <h2 className="text-lg font-semibold tracking-tight text-[#24352f] sm:text-xl">



          {title}



        </h2>



      </div>







      {action && (



        <button



          type="button"



          onClick={onAction}



          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dce8e2] bg-white px-3 py-2 text-xs font-semibold text-[#315c4e] transition hover:border-emerald-600 hover:bg-emerald-50"



        >



          <Plus size={15} />



          {action}



        </button>



      )}



    </div>



  );



}







function Modal({ title, subtitle, onClose, children, wide = false }) {



  return (



    <div



      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#152720]/50 p-4 backdrop-blur-sm"



      onMouseDown={(event) => {



        if (event.target === event.currentTarget) onClose();



      }}



    >



      <div



        className={`my-auto w-full ${wide ? "max-w-2xl" : "max-w-lg"



          } rounded-3xl border border-[#e4ebe7] bg-white p-5 shadow-2xl sm:p-7`}



      >



        <div className="mb-6 flex items-start justify-between gap-4">



          <div>



            <h2 className="text-xl font-semibold text-[#24352f]">{title}</h2>



            {subtitle && (



              <p className="mt-1 text-sm leading-6 text-slate-500">



                {subtitle}



              </p>



            )}



          </div>







          <button



            type="button"



            onClick={onClose}



            aria-label="Close modal"



            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"



          >



            <X size={19} />



          </button>



        </div>







        {children}



      </div>



    </div>



  );



}







function Field({ label, value, onChange, placeholder, multiline = false }) {



  const classes =



    "w-full rounded-xl border border-[#dfe8e3] bg-[#fbfdfc] px-4 py-3 text-sm text-[#263832] outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";







  return (



    <label className="block">



      <span className="mb-2 block text-xs font-semibold text-[#40574d]">



        {label}



      </span>







      {multiline ? (



        <textarea



          value={value}



          onChange={(event) => onChange(event.target.value)}



          placeholder={placeholder}



          rows={4}



          className={`${classes} resize-y`}



        />



      ) : (



        <input



          value={value}



          onChange={(event) => onChange(event.target.value)}



          placeholder={placeholder}



          className={classes}



        />



      )}



    </label>



  );



}







function EmptyState({ icon: Icon, title, description, action, onAction }) {



  return (



    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9e5de] bg-[#fbfdfc] px-5 py-10 text-center">



      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f4ed] text-emerald-800">



        <Icon size={24} strokeWidth={1.7} />



      </div>







      <h3 className="text-base font-semibold text-[#263832]">{title}</h3>







      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">



        {description}



      </p>







      {action && (



        <button



          type="button"



          onClick={onAction}



          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#176b5b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115748]"



        >



          <Plus size={16} />



          {action}



        </button>



      )}



    </div>



  );



}







function SidebarCard({ children, className = "" }) {



  return (



    <section



      className={`rounded-2xl border border-[#e5ece7] bg-white p-5 shadow-[0_3px_18px_rgba(30,60,45,0.025)] ${className}`}



    >



      {children}



    </section>



  );



}







function GlanceItem({ icon: Icon, label, value, muted = false }) {



  return (



    <div className="flex items-start gap-3 py-3">



      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6f1] text-[#367562]">



        <Icon size={17} strokeWidth={1.8} />



      </div>







      <div className="min-w-0 flex-1">



        <p className="text-[11px] font-medium text-slate-500">{label}</p>



        <p



          className={`mt-1 break-words text-sm font-semibold ${muted ? "text-slate-400" : "text-[#2e4439]"



            }`}



        >



          {value}



        </p>



      </div>



    </div>



  );



}







export default function MyProfilePage() {



  const [profile, setProfile] = useState(initialProfile);



  const [clinics, setClinics] = useState(initialClinics);

  const [profileLoading, setProfileLoading] = useState(true);

  const [profileError, setProfileError] = useState("");



  const [activeTab, setActiveTab] = useState("About");







  const [modal, setModal] = useState("");



  const [showAlerts, setShowAlerts] = useState(false);



  const [notice, setNotice] = useState("");



  const [newInterest, setNewInterest] = useState("");







  const [clinicForm, setClinicForm] = useState({



    name: "",



    location: "",



    role: "",



  });







  const [editForm, setEditForm] = useState(initialProfile);



  const [bannerPreview, setBannerPreview] = useState("");



  const [profilePreview, setProfilePreview] = useState("");







  useEffect(() => {

    let isMounted = true;



    const loadProfile = async () => {

      setProfileLoading(true);

      setProfileError("");

      try {

        const response = await getMyProfile();

        const data = response?.profile ?? response?.data?.profile ?? response?.data ?? response;

        if (!isMounted || !data || typeof data !== "object") return;



        const nextProfile = {

          ...initialProfile,

          ...data,

          interests: Array.isArray(data.interests) ? data.interests : initialProfile.interests,

        };

        setProfile(nextProfile);

        setEditForm(nextProfile);

      } catch (error) {

        if (isMounted) {

          setProfileError(error?.message || "Unable to load profile from the server.");

          notify("Unable to load profile. Check backend connection.");

        }

      } finally {

        if (isMounted) setProfileLoading(false);

      }

    };



    loadProfile();

    return () => { isMounted = false; };

  }, []);



  const profileInputRef = useRef(null);



  const bannerInputRef = useRef(null);







  const notify = (message) => {



    setNotice(message);



    window.setTimeout(() => setNotice(""), 3000);



  };







  const openEditModal = () => {



    setEditForm({



      ...profile,



      interests: [...profile.interests],



    });



    setNewInterest("");



    setModal("edit");



  };







  const saveProfile = async (event) => {

    event.preventDefault();

    const payload = {

      ...editForm,

      profileImage: profilePreview || profile.profileImage,

      bannerImage: bannerPreview || profile.bannerImage,

    };



    try {

      const response = await updateMyProfile(payload);

      const data = response?.profile ?? response?.data?.profile ?? response?.data ?? response;

      const savedProfile =

        data && typeof data === "object" && !Array.isArray(data)

          ? { ...payload, ...data }

          : payload;



      setProfile(savedProfile);

      setEditForm(savedProfile);

      setProfilePreview("");

      setBannerPreview("");

      setModal("");

      setProfileError("");

      notify("Profile updated successfully.");

    } catch (error) {

      notify(error?.message || "Unable to save profile. Please try again.");

    }

  };







  const addInterest = () => {



    const value = newInterest.trim();







    if (!value) return;







    if (



      editForm.interests.some(



        (interest) => interest.toLowerCase() === value.toLowerCase()



      )



    ) {



      setNewInterest("");



      return;



    }







    setEditForm((previous) => ({



      ...previous,



      interests: [...previous.interests, value],



    }));







    setNewInterest("");



  };







  const removeInterest = (interestToRemove) => {



    setEditForm((previous) => ({



      ...previous,



      interests: previous.interests.filter(



        (interest) => interest !== interestToRemove



      ),



    }));



  };







  const handleImageChange = (event, type) => {



    const file = event.target.files?.[0];







    if (!file) return;







    if (!file.type.startsWith("image/")) {



      notify("Please choose a valid image file.");



      event.target.value = "";



      return;



    }







    if (file.size > 5 * 1024 * 1024) {



      notify("Image size must be 5 MB or less.");



      event.target.value = "";



      return;



    }







    const previewUrl = URL.createObjectURL(file);







    if (type === "profile") {



      setProfilePreview(previewUrl);



    } else {



      setBannerPreview(previewUrl);



    }







    notify("Image preview updated. Save your profile to apply it.");



  };







  const addClinic = (event) => {



    event.preventDefault();







    if (!clinicForm.name.trim() || !clinicForm.location.trim()) {



      notify("Please enter the clinic name and location.");



      return;



    }







    setClinics((previous) => [



      ...previous,



      {



        id: Date.now(),



        name: clinicForm.name.trim(),



        location: clinicForm.location.trim(),



        role: clinicForm.role.trim() || "Veterinary professional",



      },



    ]);







    setClinicForm({ name: "", location: "", role: "" });



    setModal("");



    notify("Clinic added to your local profile.");



  };







  const shareProfile = async () => {



    const url = window.location.href;







    try {



      if (navigator.share) {



        await navigator.share({



          title: `${profile.name} | Zenve Vet`,



          text: "Connect with me on Zenve Vet.",



          url,



        });



      } else if (navigator.clipboard?.writeText) {



        await navigator.clipboard.writeText(url);



        notify("Profile link copied.");



      } else {



        notify("Copy the profile URL from your browser address bar.");



      }



    } catch (error) {



      if (error?.name !== "AbortError") {



        notify("Unable to share right now.");



      }



    }



  };







  const resetProfile = () => {



    setProfile(initialProfile);



    setClinics([]);



    setProfilePreview("");



    setBannerPreview("");



    setShowAlerts(false);



    setActiveTab("About");



    setModal("");



    notify("Demo profile reset.");



  };







  const renderTabContent = () => {



    if (activeTab === "Posts") {



      return (



        <EmptyState



          icon={FileText}



          title="Your story starts here."



          description="Share updates, ideas, and useful perspectives with the veterinary community."



          action="Create a post"



          onAction={() => notify("Post creation is a demo action.")}



        />



      );



    }







    if (activeTab === "Cases") {



      return (



        <EmptyState



          icon={ClipboardList}



          title="No clinical cases yet."



          description="Your clinical cases will appear here when you add them to your profile."



          action="Add a case"



          onAction={() => notify("Case creation is a demo action.")}



        />



      );



    }







    if (activeTab === "Videos") {



      return (



        <EmptyState



          icon={Video}



          title="No videos shared yet."



          description="Share educational videos and clinical insights with your community."



          action="Add a video"



          onAction={() => notify("Video upload is a demo action.")}



        />



      );



    }







    return (



      <div className="space-y-7">



        <section>



          <SectionHeading



            eyebrow="Introduction"



            title="A little about my world."



            action="Edit"



            onAction={openEditModal}



          />







          <p className="whitespace-pre-wrap text-sm leading-7 text-[#65766d]">



            {profile.bio || "Add a little introduction about yourself."}



          </p>







          <div className="mt-5 flex flex-wrap gap-2">



            {profile.interests.map((interest) => (



              <span



                key={interest}



                className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe2] bg-[#f3f9f5] px-3.5 py-2 text-xs font-medium text-[#426b59]"



              >



                <span className="h-1.5 w-1.5 rounded-full bg-[#4c9875]" />



                {interest}



              </span>



            ))}



          </div>



        </section>







        <div className="h-px bg-[#e8eee9]" />







        <section>



          <SectionHeading



            eyebrow="Professional practice"



            title="Where I practise."



            action="Add your clinic"



            onAction={() => setModal("clinic")}



          />







          {clinics.length === 0 ? (



            <div className="rounded-2xl border border-dashed border-[#dbe7df] bg-[#fbfdfc] px-5 py-7 text-center">



              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f4ed] text-[#34735d]">



                <BriefcaseMedical size={20} />



              </div>







              <p className="text-sm font-semibold text-[#31483b]">



                Add your clinic



              </p>







              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">



                Let your community know where you practise and how they can



                connect with you.



              </p>







              <button



                type="button"



                onClick={() => setModal("clinic")}



                className="mt-4 text-xs font-semibold text-emerald-800 hover:underline"



              >



                + Add clinic details



              </button>



            </div>



          ) : (



            <div className="space-y-3">



              {clinics.map((clinic) => (



                <div



                  key={clinic.id}



                  className="flex items-start gap-3 rounded-2xl border border-[#e3ece6] p-4"



                >



                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f4ed] text-[#34735d]">



                    <BriefcaseMedical size={19} />



                  </div>







                  <div className="min-w-0 flex-1">



                    <p className="font-semibold text-[#2b4236]">



                      {clinic.name}



                    </p>



                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">



                      <MapPin size={13} />



                      {clinic.location}



                    </p>



                    <p className="mt-1 text-xs text-slate-500">



                      {clinic.role}



                    </p>



                  </div>







                  <button



                    type="button"



                    aria-label={`Remove ${clinic.name}`}



                    onClick={() =>



                      setClinics((previous) =>



                        previous.filter((item) => item.id !== clinic.id)



                      )



                    }



                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"



                  >



                    <Trash2 size={16} />



                  </button>



                </div>



              ))}



            </div>



          )}



        </section>







        <div className="h-px bg-[#e8eee9]" />







        <section>



          <SectionHeading



            eyebrow="Clinical journal"



            title="Perspectives from practice."



          />







          <EmptyState



            icon={BookOpenIcon}



            title="Your journal is waiting."



            description="Thoughts, lessons, and reflections from your clinical journey will live here."



            action="Write a reflection"



            onAction={() => notify("Journal editor is a demo action.")}



          />



        </section>



      </div>



    );



  };







  return (



    <div className="min-h-screen bg-[#f7f9f7] text-[#263832]">

      {profileLoading && (

        <div className="mx-auto max-w-[1440px] px-4 pt-3 text-sm text-slate-500 sm:px-6 lg:px-10">

          Loading profile...

        </div>

      )}

      {!profileLoading && profileError && (

        <div className="mx-auto max-w-[1440px] px-4 pt-3 text-sm text-amber-700 sm:px-6 lg:px-10">

          {profileError} Showing the current profile defaults until the API is available.

        </div>

      )}



      {/* Toast */}



      {notice && (



        <div className="fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 shadow-xl">



          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">



            <Check size={14} />



          </div>



          <p className="flex-1 text-sm text-[#31483b]">{notice}</p>



          <button



            type="button"



            onClick={() => setNotice("")}



            aria-label="Dismiss notification"



            className="text-slate-400 hover:text-slate-700"



          >



            <X size={16} />



          </button>



        </div>



      )}







      <input



        ref={profileInputRef}



        type="file"



        accept="image/*"



        className="hidden"



        onChange={(event) => handleImageChange(event, "profile")}



      />







      <input



        ref={bannerInputRef}



        type="file"



        accept="image/*"



        className="hidden"



        onChange={(event) => handleImageChange(event, "banner")}



      />







      {/* Main page container */}



      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">



        {/* Breadcrumb */}



        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">



          <button



            type="button"



            onClick={() => window.history.back()}



            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-emerald-800"



          >



            <ArrowLeft size={15} />



            Back



          </button>







          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">



            <span>Zenve Vet</span>



            <span>/</span>



            <span className="text-emerald-800">My profile</span>



          </div>



        </div>







        {/* Profile hero */}



        <section className="overflow-hidden rounded-[26px] border border-[#e2eae4] bg-white shadow-[0_5px_30px_rgba(28,62,43,0.04)]">



          {/* Banner */}



          <div className="relative h-48 overflow-hidden bg-[#dbe9df] sm:h-60 lg:h-[280px]">



            {bannerPreview || profile.bannerImage ? (



              <img



                src={bannerPreview || profile.bannerImage}



                alt="Profile banner"



                className="absolute inset-0 h-full w-full object-cover"



              />



            ) : (



              <div className="absolute inset-0 bg-gradient-to-br from-[#dcece1] via-[#c2ded0] to-[#8dbca6]" />



            )}







            <div className="absolute inset-0 bg-gradient-to-r from-[#153e30]/75 via-[#153e30]/25 to-transparent" />







            <div className="absolute inset-0 flex flex-col justify-center px-6 py-6 sm:px-10 lg:px-12">



              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 sm:text-xs">



                The practice of possibility



              </p>







              <h1 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">



                Care with purpose.



                <br />



                Progress with compassion.



              </h1>







              <p className="mt-4 max-w-md text-xs leading-5 text-white/80 sm:text-sm">



                A professional space for connection, collaboration, and better



                animal wellbeing.



              </p>



            </div>







            <button



              type="button"



              onClick={() => bannerInputRef.current?.click()}



              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/40 sm:right-6 sm:top-6"



            >



              <Camera size={14} />



              Change banner



            </button>



          </div>







          {/* Profile details */}



          <div className="px-5 pb-5 sm:px-8 sm:pb-7 lg:px-10">



            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">



              <div className="-mt-10 flex min-w-0 flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">



                <div className="group relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">



                  {profilePreview || profile.profileImage ? (



                    <img



                      src={profilePreview || profile.profileImage}



                      alt={profile.name}



                      className="h-full w-full rounded-[25px] border-4 border-white bg-white object-cover shadow-md"



                    />



                  ) : (



                    <div className="flex h-full w-full items-center justify-center rounded-[25px] border-4 border-white bg-[#176b5b] text-3xl font-semibold text-white shadow-md">



                      {profile.name.charAt(0).toUpperCase()}



                    </div>



                  )}







                  <button



                    type="button"



                    onClick={() => profileInputRef.current?.click()}



                    aria-label="Change profile photo"



                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[#315c4e] shadow transition hover:bg-emerald-50"



                  >



                    <Camera size={15} />



                  </button>



                </div>







                <div className="min-w-0 pb-1 pt-1 sm:pb-2 sm:pt-0">



                  <div className="flex flex-wrap items-center gap-2">



                    <h2 className="text-2xl font-semibold tracking-tight text-[#24352f] sm:text-3xl">



                      {profile.name}



                    </h2>







                    <span className="rounded-full border border-[#e1ebe4] bg-[#f3f8f4] px-2.5 py-1 text-[10px] font-semibold text-[#557161]">



                      Not verified



                    </span>



                  </div>







                  <p className="mt-2 text-sm font-medium text-[#4f7060]">



                    {profile.specialty}



                  </p>







                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">



                    <span className="inline-flex items-center gap-1.5">



                      <MapPin size={14} />



                      {profile.location || "Add your location"}



                    </span>







                    <span className="inline-flex items-center gap-1.5">



                      <Stethoscope size={14} />



                      {profile.role}



                    </span>



                  </div>



                </div>



              </div>







              {/* Actions */}



              <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:pb-2">



                <button



                  type="button"



                  onClick={openEditModal}



                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#176b5b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#105747]"



                >



                  <UserRound size={15} />



                  Edit page



                </button>







                <button



                  type="button"



                  onClick={() => setModal("verify")}



                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce8e0] bg-white px-4 py-2.5 text-xs font-semibold text-[#315c4e] transition hover:bg-[#f1f8f3]"



                >



                  <ShieldCheck size={15} />



                  Get verified



                </button>







                <button



                  type="button"



                  onClick={() => bannerInputRef.current?.click()}



                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce8e0] bg-white px-4 py-2.5 text-xs font-semibold text-[#315c4e] transition hover:bg-[#f1f8f3]"



                >



                  <ImageIcon size={15} />



                  Banner & journey



                </button>







                <button



                  type="button"



                  onClick={() => setShowAlerts((previous) => !previous)}



                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${showAlerts



                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"



                      : "border-[#dce8e0] bg-white text-[#315c4e] hover:bg-[#f1f8f3]"



                    }`}



                >



                  <Bell size={15} />



                  Phone alerts



                  {showAlerts && <Check size={14} />}



                </button>







                <button



                  type="button"



                  onClick={shareProfile}



                  aria-label="Share profile"



                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce8e0] bg-white text-[#315c4e] transition hover:bg-[#f1f8f3]"



                >



                  <Share2 size={16} />



                </button>



              </div>



            </div>







            {showAlerts && (



              <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">



                <Bell size={18} className="mt-0.5 shrink-0 text-emerald-800" />



                <div>



                  <p className="text-sm font-semibold text-emerald-950">



                    Phone alerts enabled in this demo



                  </p>



                  <p className="mt-1 text-xs leading-5 text-emerald-800/80">



                    This is a local UI toggle only. It does not configure



                    device notifications or send anything to a backend.



                  </p>



                </div>



              </div>



            )}







            {/* Tabs */}



            <div className="mt-7 flex gap-1 overflow-x-auto border-b border-[#e7ede8]">



              {tabs.map(({ label, icon: Icon }) => {



                const active = activeTab === label;







                return (



                  <button



                    key={label}



                    type="button"



                    onClick={() => setActiveTab(label)}



                    className={`relative inline-flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium transition ${active



                        ? "text-[#176b5b]"



                        : "text-slate-500 hover:text-[#315c4e]"



                      }`}



                  >



                    <Icon size={16} />



                    {label}







                    {active && (



                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#176b5b]" />



                    )}



                  </button>



                );



              })}



            </div>



          </div>



        </section>







        {/* Main grid */}



        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_350px]">



          {/* Left column */}



          <div className="min-w-0 rounded-[24px] border border-[#e3ebe5] bg-white p-5 shadow-[0_4px_25px_rgba(30,60,45,0.025)] sm:p-7 lg:p-8">



            {renderTabContent()}



          </div>







          {/* Right column */}



          <aside className="space-y-5">



            {/* Page strength */}



            <SidebarCard>



              <div className="flex items-start justify-between gap-3">



                <div>



                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">



                    Your profile



                  </p>



                  <h2 className="mt-2 text-lg font-semibold text-[#263832]">



                    Page strength



                  </h2>



                </div>







                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[4px] border-[#e5eee7] text-xs font-bold text-[#426b59]">



                  0%



                </div>



              </div>







              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e9f0eb]">



                <div className="h-full w-0 rounded-full bg-[#176b5b]" />



              </div>







              <p className="mt-3 text-xs leading-5 text-slate-500">



                Build your professional presence, one step at a time.



              </p>







              <div className="mt-5 space-y-1">



                {checklist.map(({ label, icon: Icon }) => (



                  <div



                    key={label}



                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#f7faf8]"



                  >



                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f5f1] text-[#789184]">



                      <Icon size={15} />



                    </span>







                    <span className="flex-1 text-xs font-medium text-[#53685c]">



                      {label}



                    </span>







                    <span className="h-4 w-4 rounded-full border border-[#dce6df]" />



                  </div>



                ))}



              </div>







              <button



                type="button"



                onClick={openEditModal}



                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#105747]"



              >



                Complete my page



                <ArrowRight size={16} />



              </button>



            </SidebarCard>







            {/* At a glance */}



            <SidebarCard>



              <div className="mb-2 flex items-center justify-between">



                <h2 className="text-base font-semibold text-[#263832]">



                  At a glance



                </h2>







                <MoreHorizontal size={19} className="text-slate-400" />



              </div>







              <div className="divide-y divide-[#edf1ed]">



                <GlanceItem



                  icon={Stethoscope}



                  label="Clinical interest"



                  value={profile.specialty || "Not added"}



                />







                <GlanceItem



                  icon={MapPin}



                  label="Based in"



                  value={profile.location || "Not added"}



                />







                <GlanceItem



                  icon={Heart}



                  label="Community"



                  value="0 connections"



                />







                <GlanceItem



                  icon={Globe}



                  label="Professional presence"



                  value="Zenve Vet network"



                />



              </div>







              <div className="mt-4 rounded-xl border border-[#f0e6cb] bg-[#fffbef] p-3.5">



                <div className="flex items-start gap-2.5">



                  <ShieldCheck



                    size={17}



                    className="mt-0.5 shrink-0 text-[#a17a25]"



                  />







                  <div>



                    <p className="text-xs font-semibold text-[#795d25]">



                      Credentials not verified



                    </p>



                    <p className="mt-1 text-[11px] leading-5 text-[#8d774a]">



                      Your professional credentials have not been verified



                      yet.



                    </p>







                    <button



                      type="button"



                      onClick={() => setModal("verify")}



                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#795d25] hover:underline"



                    >



                      Learn more



                      <ArrowUpRight size={13} />



                    </button>



                  </div>



                </div>



              </div>



            </SidebarCard>







            {/* Helpful links */}



            <SidebarCard>



              <h2 className="text-sm font-semibold text-[#263832]">



                Need a hand?



              </h2>







              <p className="mt-2 text-xs leading-5 text-slate-500">



                Make your professional profile more useful to your veterinary



                community.



              </p>







              <button



                type="button"



                onClick={() => notify("Profile guide is a demo action.")}



                className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#e4ece6] px-3.5 py-3 text-left text-xs font-semibold text-[#426b59] transition hover:bg-[#f5faf6]"



              >



                <span className="flex items-center gap-2">



                  <CircleHelp size={16} />



                  Profile guide



                </span>



                <ArrowRight size={15} />



              </button>







              <button



                type="button"



                onClick={() => setModal("delete")}



                className="mt-2 flex w-full items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-medium text-red-600 transition hover:bg-red-50"



              >



                <Trash2 size={15} />



                Delete profile



              </button>



            </SidebarCard>



          </aside>



        </div>







        {/* Footer */}



        <footer className="flex flex-col items-center justify-between gap-3 px-2 py-8 text-center sm:flex-row sm:text-left">



          <p className="text-[11px] text-slate-400">



            © {new Date().getFullYear()} Zenve Vet. Built for better animal



            wellbeing.



          </p>







          <div className="flex items-center gap-4 text-[11px] text-slate-400">



            <button



              type="button"



              onClick={() => notify("Privacy information is not connected.")}



              className="hover:text-emerald-800"



            >



              Privacy



            </button>



            <button



              type="button"



              onClick={() => notify("Help centre is a demo action.")}



              className="hover:text-emerald-800"



            >



              Help centre



            </button>



          </div>



        </footer>



      </main>







      {/* Edit profile modal */}



      {modal === "edit" && (



        <Modal



          title="Edit your profile"



          subtitle="Introduce yourself and update your professional details."



          onClose={() => setModal("")}



          wide



        >



          <form onSubmit={saveProfile} className="space-y-5">



            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">



              <Field



                label="Display name"



                value={editForm.name}



                onChange={(value) =>



                  setEditForm((previous) => ({ ...previous, name: value }))



                }



                placeholder="Your name"



              />







              <Field



                label="Professional role"



                value={editForm.role}



                onChange={(value) =>



                  setEditForm((previous) => ({ ...previous, role: value }))



                }



                placeholder="Veterinary professional"



              />







              <Field



                label="Clinical interest"



                value={editForm.specialty}



                onChange={(value) =>



                  setEditForm((previous) => ({



                    ...previous,



                    specialty: value,



                  }))



                }



                placeholder="Veterinary Dermatology"



              />







              <Field



                label="Location"



                value={editForm.location}



                onChange={(value) =>



                  setEditForm((previous) => ({ ...previous, location: value }))



                }



                placeholder="City or town"



              />



            </div>







            <Field



              label="Your story"



              value={editForm.bio}



              onChange={(value) =>



                setEditForm((previous) => ({ ...previous, bio: value }))



              }



              placeholder="Tell the community a little about yourself..."



              multiline



            />







            <Field



              label="Website (optional)"



              value={editForm.website}



              onChange={(value) =>



                setEditForm((previous) => ({ ...previous, website: value }))



              }



              placeholder="https://yourwebsite.com"



            />







            <div>



              <label className="mb-2 block text-xs font-semibold text-[#40574d]">



                Clinical interests and topics



              </label>







              <div className="flex flex-wrap gap-2">



                {editForm.interests.map((interest) => (



                  <span



                    key={interest}



                    className="inline-flex items-center gap-2 rounded-full border border-[#dcebe2] bg-[#f3f9f5] py-1.5 pl-3 pr-2 text-xs text-[#426b59]"



                  >



                    {interest}



                    <button



                      type="button"



                      onClick={() => removeInterest(interest)}



                      aria-label={`Remove ${interest}`}



                      className="rounded-full p-0.5 hover:bg-emerald-100"



                    >



                      <X size={13} />



                    </button>



                  </span>



                ))}



              </div>







              <div className="mt-3 flex gap-2">



                <input



                  value={newInterest}



                  onChange={(event) => setNewInterest(event.target.value)}



                  onKeyDown={(event) => {



                    if (event.key === "Enter") {



                      event.preventDefault();



                      addInterest();



                    }



                  }}



                  placeholder="Add an interest"



                  className="min-w-0 flex-1 rounded-xl border border-[#dfe8e3] bg-[#fbfdfc] px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"



                />







                <button



                  type="button"



                  onClick={addInterest}



                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce8e0] px-3 py-2 text-xs font-semibold text-[#315c4e] hover:bg-emerald-50"



                >



                  <Plus size={15} />



                  Add



                </button>



              </div>



            </div>







            <div className="flex flex-col-reverse gap-2 border-t border-[#e8eee9] pt-5 sm:flex-row sm:justify-end">



              <button



                type="button"



                onClick={() => setModal("")}



                className="rounded-full border border-[#dce8e0] px-5 py-2.5 text-sm font-semibold text-[#52665a] hover:bg-slate-50"



              >



                Cancel



              </button>







              <button



                type="submit"



                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#176b5b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#105747]"



              >



                <Check size={16} />



                Save changes



              </button>



            </div>



          </form>



        </Modal>



      )}







      {/* Add clinic modal */}



      {modal === "clinic" && (



        <Modal



          title="Add your clinic"



          subtitle="Add your practice details to your profile."



          onClose={() => setModal("")}



        >



          <form onSubmit={addClinic} className="space-y-4">



            <Field



              label="Clinic name"



              value={clinicForm.name}



              onChange={(value) =>



                setClinicForm((previous) => ({ ...previous, name: value }))



              }



              placeholder="Enter clinic name"



            />







            <Field



              label="Location"



              value={clinicForm.location}



              onChange={(value) =>



                setClinicForm((previous) => ({



                  ...previous,



                  location: value,



                }))



              }



              placeholder="City, town or address"



            />







            <Field



              label="Your role (optional)"



              value={clinicForm.role}



              onChange={(value) =>



                setClinicForm((previous) => ({ ...previous, role: value }))



              }



              placeholder="Veterinary doctor"



            />







            <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">



              <button



                type="button"



                onClick={() => setModal("")}



                className="rounded-full border border-[#dce8e0] px-5 py-2.5 text-sm font-semibold text-[#52665a] hover:bg-slate-50"



              >



                Cancel



              </button>







              <button



                type="submit"



                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#176b5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#105747]"



              >



                <Plus size={16} />



                Add clinic



              </button>



            </div>



          </form>



        </Modal>



      )}







      {/* Verification modal */}



      {modal === "verify" && (



        <Modal



          title="Get your profile verified"



          subtitle="Help the veterinary community recognise your professional credentials."



          onClose={() => setModal("")}



        >



          <div className="rounded-2xl border border-[#e2ece4] bg-[#f6faf7] p-5">



            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f1e8] text-[#176b5b]">



              <ShieldCheck size={25} />



            </div>







            <h3 className="mt-4 text-sm font-semibold text-[#263832]">



              Professional verification



            </h3>







            <p className="mt-2 text-sm leading-6 text-slate-500">



              Verification workflows are not connected in this frontend demo.



              In a production app, this step could collect the relevant



              professional credentials for review.



            </p>



          </div>







          <button



            type="button"



            onClick={() => {



              setModal("");



              notify("Verification is not connected to a backend.");



            }}



            className="mt-5 w-full rounded-full bg-[#176b5b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#105747]"



          >



            Got it



          </button>



        </Modal>



      )}







      {/* Delete profile modal */}



      {modal === "delete" && (



        <Modal



          title="Delete your demo profile?"



          subtitle="This action resets only the local mock profile shown on this page."



          onClose={() => setModal("")}



        >



          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">



            <div className="flex items-start gap-3">



              <Trash2 size={19} className="mt-0.5 text-red-600" />



              <div>



                <p className="text-sm font-semibold text-red-800">



                  This will reset local demo data



                </p>



                <p className="mt-1 text-xs leading-5 text-red-700/80">



                  No account or backend record will be deleted.



                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModal("")}



              className="rounded-full border border-[#dce8e0] px-5 py-2.5 text-sm font-semibold text-[#52665a] hover:bg-slate-50"



            >
              Cancel
            </button>

            <button



              type="button"



              onClick={resetProfile}



              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"



            >



              <Trash2 size={15} />



              Reset demo profile



            </button>



          </div>



        </Modal>



      )}



    </div>



  );



}







function BookOpenIcon(props) {
  return <FileText {...props} />;
}