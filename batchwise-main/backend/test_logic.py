
import sys
import os
import unittest

# Add backend to path to allow import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import calculate_new_balance

class TestPromotionLogic(unittest.TestCase):
    
    def test_scenario_a_exact_payment(self):
        # Scenario A: Paid 10k, Fee 10k -> Carry 0
        carry = calculate_new_balance(current_total=10000, current_paid=10000, new_fee=25000)
        self.assertEqual(carry, 0)
        print("✅ Scenario A (Exact) Passed")

    def test_scenario_b_extra_payment(self):
        # Scenario B: Paid 12k, Fee 10k -> Carry 2k
        carry = calculate_new_balance(current_total=10000, current_paid=12000, new_fee=25000)
        self.assertEqual(carry, 2000)
        print("✅ Scenario B (Extra) Passed")

    def test_scenario_c_debt_clean_slate(self):
        # Scenario C: Paid 8k, Fee 10k -> Debt 2k -> Carry 0 (Clean Slate)
        carry = calculate_new_balance(current_total=10000, current_paid=8000, new_fee=25000)
        self.assertEqual(carry, 0)
        print("✅ Scenario C (Debt) Passed")

    def test_new_fee_irrelevant_for_carry(self):
        # The new fee doesn't affect the carry amount, only the future balance
        carry = calculate_new_balance(10000, 12000, 50000)
        self.assertEqual(carry, 2000)

if __name__ == '__main__':
    unittest.main()
