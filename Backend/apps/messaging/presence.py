from collections import Counter

_connections = Counter()


def add(user_id):
    _connections[user_id] += 1
    return _connections[user_id] == 1


def remove(user_id):
    if _connections[user_id] <= 0:
        return False
    _connections[user_id] -= 1
    if _connections[user_id] == 0:
        del _connections[user_id]
        return True
    return False


def is_online(user_id):
    return _connections.get(user_id, 0) > 0