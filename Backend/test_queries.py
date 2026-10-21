from apps.common import queries

checks = {
    "Feed": lambda: list(queries.get_feed_posts(limit=3)),
    "Doctor profiles": lambda: list(queries.search_doctors(limit=3)),
    "Stories": lambda: list(queries.get_user_stories()[:3]),
    "Notifications": lambda: queries.get_user_notifications(1).count(),
    "Connections": lambda: queries.get_user_connections(1).count(),
    "Conversations": lambda: queries.get_user_conversations(1).count(),
}

for name, check in checks.items():
    try:
        result = check()
        print(f"PASS: {name} — {len(result) if isinstance(result, list) else result}")
    except Exception as exc:
        print(f"FAIL: {name} — {type(exc).__name__}: {exc}")
