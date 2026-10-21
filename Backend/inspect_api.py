from pathlib import Path

files = [
    "apps/posts/urls.py",
    "apps/posts/views.py",
    "apps/accounts/urls.py",
    "apps/accounts/views.py",
    "apps/connections/urls.py",
    "apps/connections/views.py",
    "apps/messaging/urls.py",
    "apps/messaging/views.py",
    "apps/notifications/urls.py",
    "apps/notifications/views.py",
    "apps/stories/urls.py",
    "apps/stories/views.py",
]

for name in files:
    path = Path(name)
    print(f"\n{'=' * 20} {name} {'=' * 20}")
    if path.exists():
        print(path.read_text(encoding="utf-8-sig"))
    else:
        print("FILE NOT FOUND")
