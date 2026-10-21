from django.contrib.auth import get_user_model
from apps.posts.models import Post

User = get_user_model()

print("=== Users outside old demo domain ===")
for user in User.objects.exclude(
    email__endswith="@demo.zenvevet.internal"
).order_by("id"):
    print(user.id, user.username, user.email)

print("\n=== Posts without old demo markers ===")
for post in Post.objects.exclude(
    caption__startswith="[DEMO-SEED-"
).order_by("id")[:30]:
    print(post.id, post.author.username, post.content_type, post.caption[:100])

print("\nTotal posts without old demo markers:",
      Post.objects.exclude(caption__startswith="[DEMO-SEED-").count())
