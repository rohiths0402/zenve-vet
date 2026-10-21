from django.contrib.auth import get_user_model
from apps.posts.models import Post
import json
from pathlib import Path

User = get_user_model()
data = json.loads(
    Path("data/zenve_vet_complete_social_preview_v4_online_media.json")
    .read_text(encoding="utf-8")
)

json_users = data["users"]
usernames = [u["username"] for u in json_users]
emails = [u["email"] for u in json_users]

existing_usernames = set(
    User.objects.filter(username__in=usernames)
    .values_list("username", flat=True)
)
existing_emails = set(
    User.objects.filter(email__in=emails)
    .values_list("email", flat=True)
)

print("JSON users:", len(json_users))
print("Username conflicts:", len(existing_usernames))
print("Email conflicts:", len(existing_emails))
print("Conflicting usernames:", sorted(existing_usernames)[:20])
print(
    "Conflicting emails:",
    sorted(existing_emails)[:20],
)
print(
    "Old seeded posts:",
    Post.objects.filter(caption__startswith="[DEMO-SEED-").count(),
)
print(
    "Users from old seeder:",
    User.objects.filter(email__endswith="@demo.zenvevet.internal").count(),
)
