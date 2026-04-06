#!/usr/bin/env python3
"""
Customer Intelligence Analysis Script
Analyzes individual customer data across all available data sources
"""

import sys
import pandas as pd
from pathlib import Path
from datetime import datetime
import json

class CustomerAnalyzer:
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.customer_email = None
        self.results = {}

    def load_data(self):
        """Load all customer data files"""
        self.data_files = {
            'master': 'master_customer_database.csv',
            'rfm': 'customer_rfm_analysis.csv',
            'gravity': 'customers_with_gravity_scores.csv',
            'chargeback': 'chargeback_risk_profile.csv',
            'tier1': 'tier1_inner_circle.csv',
            'tier2': 'tier2_core_loyalists.csv',
            'tier3': 'tier3_active_customers.csv',
            'tier4': 'tier4_cooling_customers.csv',
            'tier5': 'tier5_frozen.csv',
            'tier6': 'tier6_red_list.csv',
            'reactivation': 'reactivation_priority_targets.csv',
            'subscription': 'subscription_customers.csv',
            'stripe_transactions': 'all-stripe-transactions-since-0124.csv',
            'gocardless_transactions': 'all-gocardless-transactions-since-0823.csv',
        }

        self.dataframes = {}
        for key, filename in self.data_files.items():
            file_path = self.data_dir / filename
            if file_path.exists():
                try:
                    self.dataframes[key] = pd.read_csv(file_path)
                    print(f"✓ Loaded {filename}")
                except Exception as e:
                    print(f"✗ Error loading {filename}: {e}")
            else:
                print(f"⚠ File not found: {filename}")

    def find_customer(self, email):
        """Search for customer across all datasets"""
        self.customer_email = email.lower()
        print(f"\n{'='*80}")
        print(f"CUSTOMER ANALYSIS: {email}")
        print(f"{'='*80}\n")

        # Search in master database
        if 'master' in self.dataframes:
            df = self.dataframes['master']
            # Try different possible email column names
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                if mask.any():
                    self.results['master'] = df[mask].iloc[0].to_dict()
                    print("✓ Found in Master Customer Database")
                else:
                    print("✗ Not found in Master Customer Database")

        # Search in RFM analysis
        if 'rfm' in self.dataframes:
            df = self.dataframes['rfm']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                if mask.any():
                    self.results['rfm'] = df[mask].iloc[0].to_dict()
                    print("✓ Found in RFM Analysis")

        # Search in gravity scores
        if 'gravity' in self.dataframes:
            df = self.dataframes['gravity']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                if mask.any():
                    self.results['gravity'] = df[mask].iloc[0].to_dict()
                    print("✓ Found in Gravity Scores")

        # Check which tier the customer belongs to
        for tier_num in range(1, 7):
            tier_key = f'tier{tier_num}'
            if tier_key in self.dataframes:
                df = self.dataframes[tier_key]
                email_cols = [col for col in df.columns if 'email' in col.lower()]
                if email_cols:
                    mask = df[email_cols[0]].str.lower() == self.customer_email
                    if mask.any():
                        self.results[tier_key] = df[mask].iloc[0].to_dict()
                        self.results['customer_tier'] = tier_num
                        print(f"✓ Found in Tier {tier_num}")

        # Check subscription status
        if 'subscription' in self.dataframes:
            df = self.dataframes['subscription']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                if mask.any():
                    self.results['subscription'] = df[mask].iloc[0].to_dict()
                    print("✓ Found in Subscription Customers")

        # Check reactivation targets
        if 'reactivation' in self.dataframes:
            df = self.dataframes['reactivation']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                if mask.any():
                    self.results['reactivation'] = df[mask].iloc[0].to_dict()
                    print("✓ Found in Reactivation Priority Targets")

        # Search transactions
        self.find_transactions()

        return len(self.results) > 0

    def find_transactions(self):
        """Find all transactions for the customer"""
        transactions = []

        # Stripe transactions
        if 'stripe_transactions' in self.dataframes:
            df = self.dataframes['stripe_transactions']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                stripe_trans = df[mask].to_dict('records')
                if stripe_trans:
                    transactions.extend([{**t, 'source': 'Stripe'} for t in stripe_trans])
                    print(f"✓ Found {len(stripe_trans)} Stripe transactions")

        # GoCardless transactions
        if 'gocardless_transactions' in self.dataframes:
            df = self.dataframes['gocardless_transactions']
            email_cols = [col for col in df.columns if 'email' in col.lower()]
            if email_cols:
                mask = df[email_cols[0]].str.lower() == self.customer_email
                gc_trans = df[mask].to_dict('records')
                if gc_trans:
                    transactions.extend([{**t, 'source': 'GoCardless'} for t in gc_trans])
                    print(f"✓ Found {len(gc_trans)} GoCardless transactions")

        if transactions:
            self.results['transactions'] = transactions
            self.results['total_transactions'] = len(transactions)

    def generate_report(self):
        """Generate comprehensive customer report"""
        if not self.results:
            print("\n❌ Customer not found in any dataset")
            return

        print(f"\n{'='*80}")
        print("CUSTOMER PROFILE")
        print(f"{'='*80}\n")

        # Basic Info from Master Database
        if 'master' in self.results:
            print("📋 BASIC INFORMATION")
            print("-" * 40)
            master = self.results['master']
            for key, value in master.items():
                if pd.notna(value):
                    print(f"  {key}: {value}")
            print()

        # Tier Classification
        if 'customer_tier' in self.results:
            tier = self.results['customer_tier']
            tier_names = {
                1: "Inner Circle (High Value VIPs)",
                2: "Core Loyalists",
                3: "Active Customers",
                4: "Cooling Customers",
                5: "Frozen (Inactive)",
                6: "Red List (High Risk)"
            }
            print(f"🎯 CUSTOMER TIER: {tier} - {tier_names.get(tier, 'Unknown')}")
            print()

        # RFM Scores
        if 'rfm' in self.results:
            print("📊 RFM ANALYSIS")
            print("-" * 40)
            rfm = self.results['rfm']
            for key, value in rfm.items():
                if 'score' in key.lower() or 'recency' in key.lower() or 'frequency' in key.lower() or 'monetary' in key.lower():
                    print(f"  {key}: {value}")
            print()

        # Gravity Score
        if 'gravity' in self.results:
            print("⚖️  GRAVITY SCORE")
            print("-" * 40)
            gravity = self.results['gravity']
            for key, value in gravity.items():
                if 'gravity' in key.lower() or 'score' in key.lower():
                    print(f"  {key}: {value}")
            print()

        # Subscription Status
        if 'subscription' in self.results:
            print("💳 SUBSCRIPTION STATUS")
            print("-" * 40)
            sub = self.results['subscription']
            for key, value in sub.items():
                if pd.notna(value):
                    print(f"  {key}: {value}")
            print()

        # Reactivation Status
        if 'reactivation' in self.results:
            print("🔄 REACTIVATION PRIORITY")
            print("-" * 40)
            react = self.results['reactivation']
            for key, value in react.items():
                if pd.notna(value):
                    print(f"  {key}: {value}")
            print()

        # Transaction Summary
        if 'transactions' in self.results:
            print(f"💰 TRANSACTION HISTORY ({self.results['total_transactions']} total)")
            print("-" * 40)

            transactions = self.results['transactions']

            # Calculate transaction statistics
            amounts = []
            for trans in transactions:
                # Try to find amount field
                for key in trans.keys():
                    if 'amount' in key.lower() and pd.notna(trans[key]):
                        try:
                            amounts.append(float(trans[key]))
                        except:
                            pass

            if amounts:
                print(f"  Total Transactions: {len(transactions)}")
                print(f"  Total Amount: ${sum(amounts):,.2f}")
                print(f"  Average Amount: ${sum(amounts)/len(amounts):,.2f}")
                print(f"  Largest Transaction: ${max(amounts):,.2f}")
                print(f"  Smallest Transaction: ${min(amounts):,.2f}")

            print(f"\n  Recent Transactions (last 5):")
            for i, trans in enumerate(transactions[:5], 1):
                source = trans.get('source', 'Unknown')
                # Try to find date and amount
                date_val = None
                amount_val = None
                for key, val in trans.items():
                    if 'date' in key.lower() or 'created' in key.lower():
                        date_val = val
                    if 'amount' in key.lower() and amount_val is None:
                        amount_val = val

                print(f"    {i}. [{source}] {date_val or 'No date'} - ${amount_val or 'N/A'}")
            print()

        print(f"{'='*80}")
        print(f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*80}\n")

    def save_report(self, output_dir="reports"):
        """Save report to file"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # Save as JSON
        filename = f"{self.customer_email.replace('@', '_at_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = output_path / filename

        # Convert any non-serializable data
        results_serializable = {}
        for key, value in self.results.items():
            if isinstance(value, dict):
                results_serializable[key] = {k: str(v) if pd.isna(v) else v for k, v in value.items()}
            else:
                results_serializable[key] = value

        with open(filepath, 'w') as f:
            json.dump(results_serializable, f, indent=2, default=str)

        print(f"📄 Report saved to: {filepath}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_customer.py <customer_email>")
        print("Example: python3 analyze_customer.py customer@example.com")
        sys.exit(1)

    email = sys.argv[1]

    analyzer = CustomerAnalyzer()
    print("Loading customer data...")
    analyzer.load_data()

    if analyzer.find_customer(email):
        analyzer.generate_report()
        analyzer.save_report()
    else:
        print(f"\n❌ Customer {email} not found in any dataset")
        sys.exit(1)

if __name__ == "__main__":
    main()
