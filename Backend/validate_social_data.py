import json
from pathlib import Path

path = Path("data/zenve_vet_complete_social_preview_v4_online_media.json")
data = json.loads(path.read_text(encoding="utf-8"))

users = {x["id"] for x in data["users"]}
posts = {x["id"] for x in data["posts"]}
conversations = {x["id"] for x in data["conversations"]}
messages = {x["id"] for x in data["messages"]}

checks = {
    "doctorProfiles -> users": [
        (x["userId"], users) for x in data["doctorProfiles"]
    ],
    "posts -> users": [
        (x["authorId"], users) for x in data["posts"]
    ],
    "postMedia -> posts": [
        (x["postId"], posts) for x in data["postMedia"]
    ],
    "clinicalCases -> posts": [
        (x["postId"], posts) for x in data["clinicalCases"]
    ],
    "likes -> users": [
        (x["userId"], users) for x in data["postLikes"]
    ],
    "likes -> posts": [
        (x["postId"], posts) for x in data["postLikes"]
    ],
    "comments -> users": [
        (x["userId"], users) for x in data["postComments"]
    ],
    "comments -> posts": [
        (x["postId"], posts) for x in data["postComments"]
    ],
    "connectionRequests -> users": [
        (uid, users)
        for x in data["connectionRequests"]
        for uid in (x["senderId"], x["recipientId"])
    ],
    "connections -> users": [
        (uid, users)
        for x in data["connections"]
        for uid in (x["user1Id"], x["user2Id"])
    ],
    "participants -> conversations": [
        (x["conversationId"], conversations)
        for x in data["conversationParticipants"]
    ],
    "participants -> users": [
        (x["userId"], users) for x in data["conversationParticipants"]
    ],
    "messages -> conversations": [
        (x["conversationId"], conversations) for x in data["messages"]
    ],
    "messages -> users": [
        (x["senderId"], users) for x in data["messages"]
    ],
    "notifications -> users": [
        (uid, users)
        for x in data["notifications"]
        for uid in (x["userId"], x["actorId"])
        if uid is not None
    ],
}

print("JSON VALIDATION")
print("===============")

errors = 0
for label, references in checks.items():
    missing = [value for value, valid_ids in references if value not in valid_ids]
    print(f"{label}: {'OK' if not missing else 'MISSING REFERENCES: ' + str(len(missing))}")
    if missing:
        print("  Examples:", missing[:5])
        errors += len(missing)

print("\nDuplicate IDs:")
for collection in (
    "users", "doctorProfiles", "posts", "postMedia",
    "clinicalCases", "connectionRequests", "connections",
    "conversations", "conversationParticipants", "messages",
    "notifications", "postLikes", "postComments",
):
    ids = [x["id"] for x in data[collection]]
    duplicates = len(ids) - len(set(ids))
    print(f"{collection}: {duplicates}")
    errors += duplicates

print(f"\nRESULT: {'PASS' if errors == 0 else 'FAIL'} ({errors} issues)")
