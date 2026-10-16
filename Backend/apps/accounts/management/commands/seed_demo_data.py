import random
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.accounts.models import DoctorProfile, Clinic
from apps.posts.models import Post, ClinicalCase

User = get_user_model()
DOMAIN = "demo.zenvevet.internal"
SEED = 20261016

FIRST = "Aarav Aadhya Aditi Aditya Akash Amara Ananya Arjun Avani Bhavya Chaitanya Dev Diya Esha Farhan Gauri Harini Ishaan Jaya Kabir Kavya Kiran Lakshmi Madhav Meera Mihir Mira Nandini Neel Nikhil Nisha Ojas Pallavi Parth Pranav Priya Rahul Rhea Rohan Saanvi Sahil Samira Sara Shreya Siddharth Tanvi Tara Uma Varun Vedika Vihaan Yash".split()
LAST = "Raman Iyer Sharma Nair Reddy Patel Menon Kapoor Desai Joshi Kulkarni Rao Mukherjee Das Pillai Khan Mehta Chopra Bose Verma Saxena Ghosh Shetty Bhat Singh Naidu Thomas Fernandes Chatterjee Mishra".split()
CITIES = [
 ("Chennai","Tamil Nadu"),("Coimbatore","Tamil Nadu"),("Bengaluru","Karnataka"),
 ("Mysuru","Karnataka"),("Hyderabad","Telangana"),("Visakhapatnam","Andhra Pradesh"),
 ("Vijayawada","Andhra Pradesh"),("Kochi","Kerala"),("Thiruvananthapuram","Kerala"),
 ("Pune","Maharashtra"),("Mumbai","Maharashtra"),("Nagpur","Maharashtra"),
 ("Ahmedabad","Gujarat"),("Jaipur","Rajasthan"),("New Delhi","Delhi"),
 ("Gurugram","Haryana"),("Kolkata","West Bengal"),("Bhubaneswar","Odisha"),
 ("Lucknow","Uttar Pradesh"),("Indore","Madhya Pradesh"),
]
SPECIALTIES = [
 "Small Animal Medicine","Veterinary Surgery","Veterinary Dermatology",
 "Veterinary Cardiology","Animal Dentistry","Wildlife Medicine","Livestock Health",
 "Equine Medicine","Avian Medicine","Veterinary Radiology","Emergency and Critical Care",
 "Animal Nutrition","Veterinary Ophthalmology","Preventive Medicine","Feline Medicine",
 "Canine Rehabilitation","Exotic Pet Medicine","Reproductive Health",
]
BIOS = [
 "Veterinary professional focused on evidence-based care, clear client education, and animal wellbeing.",
 "Companion-animal clinician interested in preventive health, gentle handling, and practical case discussions.",
 "Veterinarian sharing learning notes on diagnostics, recovery, nutrition, and responsible animal care.",
 "Committed to compassionate veterinary medicine, continuing education, and collaborative case reviews.",
 "Working to make veterinary care approachable through client communication and welfare-first practice.",
]
POSTS = [
 "A calm examination starts with observing the animal before beginning the physical exam. Small details can guide the next diagnostic step.",
 "Today’s learning note: match the diagnostic plan to the patient’s history, clinical findings, and welfare needs.",
 "Pet-care reminder: keep preventive visits regular and bring a list of medications, diet changes, and recent symptoms.",
 "Case discussion: structured history-taking and careful reassessment help the team make informed decisions.",
 "Behind every good recovery is a team, a clear plan, and consistent follow-up.",
 "Clinical learning moment: explain the purpose of each test and document findings clearly for continuity of care.",
 "Animal welfare tip: reduce stress during handling, allow acclimatisation when possible, and use a patient-centred approach.",
 "A good clinical discussion includes differentials, evidence, patient comfort, and a follow-up plan.",
 "Changes in appetite, activity, breathing, or behaviour deserve attention. Seek veterinary advice rather than relying on online guesses.",
 "Today I’m reflecting on the value of prevention, early assessment, and clear communication in veterinary practice.",
]
CASE_TITLES = ["Preventive-care review","Canine dermatology discussion","Feline appetite assessment","Senior pet mobility review","Dental health case discussion","Nutrition and body-condition review","Post-operative follow-up planning","Emergency triage learning note"]
CLINICS = ["Paws & Care Veterinary Clinic","Companion Animal Health Centre","Greenfield Veterinary Practice","KindPaws Animal Hospital","Community Veterinary Care","Healthy Tails Veterinary Centre"]
PET_IMAGES = [
 "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80",
 "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80",
]
VIDEOS = [
 "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
 "https://videos.pexels.com/video-files/3195395/3195395-hd_1920_1080_25fps.mp4",
 "https://videos.pexels.com/video-files/3195396/3195396-hd_1920_1080_25fps.mp4",
]
PASSWORD = "DemoVet123!ChangeMe"

class Command(BaseCommand):
    help = "Seed 100 fictional veterinary demo users, profiles, clinics and pet posts."
    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete only previously seeded demo accounts first.")

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["reset"]:
            n = User.objects.filter(email__endswith=f"@{DOMAIN}").count()
            User.objects.filter(email__endswith=f"@{DOMAIN}").delete()
            self.stdout.write(f"Deleted {n} prior demo accounts.")

        created_users = created_profiles = created_clinics = created_posts = created_cases = 0
        for i in range(100):
            username = f"demo_vet_{i+1:03d}"
            first, last = FIRST[i % len(FIRST)], LAST[(i*7) % len(LAST)]
            city, state = CITIES[i % len(CITIES)]
            specialty = SPECIALTIES[(i*3) % len(SPECIALTIES)]
            email = f"{username}@{DOMAIN}"
            user, new_user = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "first_name": first, "last_name": last, "is_active": True},
            )
            if new_user:
                user.set_password(PASSWORD)
                user.save(update_fields=["password"])
                created_users += 1

            avatar = f"https://i.pravatar.cc/400?img={(i % 70)+1}"
            gallery = [PET_IMAGES[i % len(PET_IMAGES)], PET_IMAGES[(i+1) % len(PET_IMAGES)]]
            profile, new_profile = DoctorProfile.objects.get_or_create(
                user=user,
                defaults={
                    "city": city, "state": state, "specialty": specialty,
                    "bio": BIOS[i % len(BIOS)],
                    "profile_photo_url": avatar,
                    "banner_image_url": PET_IMAGES[(i+2) % len(PET_IMAGES)],
                    "website": "https://example.com",
                    "gallery": gallery,
                    "is_verified": i % 4 == 0,
                    "phone_alerts_enabled": True,
                },
            )
            if new_profile:
                created_profiles += 1
            else:
                # Fill empty profile fields without overwriting existing values.
                for field, value in {
                    "city": city, "state": state, "specialty": specialty,
                    "bio": BIOS[i % len(BIOS)], "profile_photo_url": avatar,
                    "banner_image_url": PET_IMAGES[(i+2) % len(PET_IMAGES)],
                    "website": "https://example.com", "gallery": gallery,
                }.items():
                    if not getattr(profile, field):
                        setattr(profile, field, value)
                profile.save()

            _, new_clinic = Clinic.objects.get_or_create(
                profile=profile, name=f"{CLINICS[i % len(CLINICS)]} {i+1:03d}",
                defaults={
                    "address": f"{i+10}, Veterinary Road", "city": city, "state": state,
                    "phone": f"+91-90000-{i+1:05d}", "website": "https://example.com",
                },
            )
            created_clinics += int(new_clinic)

            # Every user receives at least one image-backed pet-related post.
            key = f"[DEMO-SEED-{i+1:03d}-POST]"
            post, new_post = Post.objects.get_or_create(
                author=user, caption__startswith=key,
                defaults={
                    "content_type": "post",
                    "caption": f"{key} {POSTS[i % len(POSTS)]}",
                    "media_url": PET_IMAGES[i % len(PET_IMAGES)],
                    "thumbnail_url": PET_IMAGES[(i+1) % len(PET_IMAGES)],
                    "is_published": True,
                },
            )
            created_posts += int(new_post)

            # Half the users also receive a video post.
            if i % 2 == 0:
                vkey = f"[DEMO-SEED-{i+1:03d}-VIDEO]"
                _, made = Post.objects.get_or_create(
                    author=user, caption__startswith=vkey,
                    defaults={
                        "content_type": "video",
                        "caption": f"{vkey} Short educational animal-care clip for veterinary learning. Verify clinical decisions against current guidance and the individual patient.",
                        "media_url": VIDEOS[(i//2) % len(VIDEOS)],
                        "thumbnail_url": PET_IMAGES[(i+3) % len(PET_IMAGES)],
                        "is_published": True,
                    },
                )
                created_posts += int(made)

            # A third of users get a clinical case with its required related record.
            if i % 3 == 0:
                ckey = f"[DEMO-SEED-{i+1:03d}-CASE]"
                case_post, made = Post.objects.get_or_create(
                    author=user, caption__startswith=ckey,
                    defaults={
                        "content_type": "case",
                        "caption": f"{ckey} {CASE_TITLES[(i//3) % len(CASE_TITLES)]}: fictional educational discussion for the veterinary community.",
                        "media_url": PET_IMAGES[(i+4) % len(PET_IMAGES)],
                        "thumbnail_url": PET_IMAGES[(i+4) % len(PET_IMAGES)],
                        "is_published": True,
                    },
                )
                created_posts += int(made)
                _, case_made = ClinicalCase.objects.get_or_create(
                    post=case_post,
                    defaults={
                        "case_title": CASE_TITLES[(i//3) % len(CASE_TITLES)],
                        "case_summary": "Fictional demo case for UI testing only; not a real patient record or treatment recommendation.",
                        "findings": "Demo findings: history, examination, and appropriate diagnostics should be reviewed by the attending veterinarian.",
                        "treatment": "Demo placeholder: care must be determined by a qualified veterinarian for the individual patient.",
                        "consent_confirmed": True,
                    },
                )
                created_cases += int(case_made)

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: new users={created_users}, profiles={created_profiles}, "
            f"clinics={created_clinics}, posts={created_posts}, clinical cases={created_cases}."
        ))
        self.stdout.write(f"New demo-user password: {PASSWORD} (local development only)")
        self.stdout.write(f"Demo email domain: @{DOMAIN}; media URLs are stored in MySQL, files are hosted externally.")
