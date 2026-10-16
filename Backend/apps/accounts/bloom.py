
import hashlib
import math
from threading import Lock


class UsernameBloomFilter:
    """
    Fast in-process username membership filter.

    False positives are possible. Database checks and unique
    constraints remain authoritative.
    """

    def __init__(self, expected_items=100_000, false_positive_rate=0.01):
        expected_items = max(1, expected_items)

        self.size = max(
            8,
            int(
                -expected_items
                * math.log(false_positive_rate)
                / (math.log(2) ** 2)
            ),
        )
        self.hash_count = max(
            1,
            int((self.size / expected_items) * math.log(2)),
        )
        self.bits = bytearray((self.size + 7) // 8)
        self.lock = Lock()

    def _positions(self, value):
        value = value.strip().casefold().encode("utf-8")
        digest = hashlib.sha256(value).digest()

        first = int.from_bytes(digest[:16], "big")
        second = int.from_bytes(digest[16:], "big") or 1

        for i in range(self.hash_count):
            yield (first + i * second) % self.size

    def add(self, value):
        with self.lock:
            for position in self._positions(value):
                self.bits[position // 8] |= 1 << (position % 8)

    def might_contain(self, value):
        with self.lock:
            return all(
                self.bits[position // 8] & (1 << (position % 8))
                for position in self._positions(value)
            )


_filter = None
_filter_lock = Lock()


def get_username_filter():
    global _filter

    if _filter is None:
        with _filter_lock:
            if _filter is None:
                from django.contrib.auth import get_user_model

                User = get_user_model()
                bloom = UsernameBloomFilter()

                for username in User.objects.values_list(
                    "username", flat=True
                ).iterator():
                    if username:
                        bloom.add(username)

                _filter = bloom

    return _filter
