
from apps.connections.models import Connection


def are_connected(user_a, user_b):
    user_a_id = getattr(user_a, "pk", user_a)
    user_b_id = getattr(user_b, "pk", user_b)

    if user_a_id == user_b_id:
        return False

    first_id, second_id = sorted((user_a_id, user_b_id))

    return Connection.objects.filter(
        user_a_id=first_id,
        user_b_id=second_id,
        status=Connection.Status.ACCEPTED,
    ).exists()
