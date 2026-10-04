import unittest

from services.rate_limit import SlidingWindowLimiter


class RateLimitTest(unittest.TestCase):
    def test_sliding_window_and_retry_after(self):
        limiter = SlidingWindowLimiter()
        self.assertIsNone(limiter.check("client", 2, 60, now=100))
        self.assertIsNone(limiter.check("client", 2, 60, now=110))
        self.assertEqual(limiter.check("client", 2, 60, now=120), 40)
        self.assertIsNone(limiter.check("client", 2, 60, now=171))

    def test_longer_window_is_not_pruned_by_another_policy(self):
        limiter = SlidingWindowLimiter()
        limiter.check("ml", 1, 600, now=100)
        limiter.check("dama", 1, 60, now=200)
        self.assertEqual(limiter.check("ml", 1, 600, now=201), 499)


if __name__ == "__main__":
    unittest.main()
