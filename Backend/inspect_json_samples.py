import json
from pathlib import Path

path = Path("data/zenve_vet_complete_social_preview_v4_online_media.json")
data = json.loads(path.read_text(encoding="utf-8"))

collections = [
    "users",
    "doctorProfiles",
    "posts",
    "postMedia",
    "clinicalCases",
    "connectionRequests",
    "connections",
    "conversations",
    "conversationParticipants",
    "messages",
    "notifications",
    "postLikes",
    "postComments",
]

for name in collections:
    records = data.get(name, [])
    print(f"\n===== {name}: {len(records)} records =====")
    if records:
        print(json.dumps(records[0], indent=2, ensure_ascii=False))
