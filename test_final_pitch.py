# test_final_pitch.py
"""
Quick smoke‑test for /api/finalPitch with two STAR examples.

Usage
-----
$ python test_final_pitch.py --base https://abc123.ngrok-free.app

If --base is omitted the script defaults to http://localhost:3000.
"""
import argparse
import json
import sys
from textwrap import dedent

try:
    import requests
except ImportError:
    sys.exit("Please `pip install requests` first.")

def build_payload() -> dict:
    """Return a payload that satisfies your /api/finalPitch schema."""
    return {
        "roleName": "Data Analyst",
        "roleLevel": "APS6",
        "pitchWordLimit": 650,
        "relevantExperience": dedent(
            """\
            • 5 years analysing large datasets in the Australian Public Service
            • Advanced SQL, Python (pandas), and Tableau
            • Led analytics initiatives that improved decision‑making across multiple divisions
            """
        ),
        "roleDescription": "Provide data‑driven insights for policy teams.",
        "starExamples": [
            {
                "situation": {
                    "where-and-when-did-this-experience-occur": "Dept. of Health, 2022",
                    "briefly-describe-the-situation-or-challenge-you-faced": (
                        "Fragmented COVID‑19 testing data made reporting slow and error‑prone."
                    ),
                },
                "task": {
                    "what-was-your-responsibility-in-addressing-this-issue": (
                        "Consolidate disparate data sources into a single analysis pipeline."
                    ),
                    "what-constraints-or-requirements-did-you-need-to-consider": (
                        "Daily delivery deadlines and strict privacy rules."
                    ),
                },
                "action": {
                    "steps": [
                        {
                            "what-did-you-specifically-do-in-this-step": (
                                "Designed a schema that standardised test‑result formats."
                            ),
                            "how-did-you-do-it-tools-methods-or-skills": "Used Python/pandas; wrote ETL jobs.",
                            "what-was-the-outcome-of-this-step-optional": (
                                "Reduced manual data cleaning by 80 %."
                            ),
                        },
                        {
                            "what-did-you-specifically-do-in-this-step": (
                                "Automated dashboard updates in Tableau."
                            ),
                            "how-did-you-do-it-tools-methods-or-skills": "Leveraged Tableau REST API.",
                            "what-was-the-outcome-of-this-step-optional": (
                                "Same‑day reporting for executives."
                            ),
                        },
                    ]
                },
                "result": {
                    "what-positive-outcome-did-you-achieve": (
                        "Cut reporting time from 24 h to 30 min."
                    ),
                    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": (
                        "Enabled faster policy adjustments during pandemic peaks."
                    ),
                },
            },
            {
                "situation": {
                    "where-and-when-did-this-experience-occur": "Dept. of Education, 2021",
                    "briefly-describe-the-situation-or-challenge-you-faced": (
                        "Low survey response rates from regional schools."
                    ),
                },
                "task": {
                    "what-was-your-responsibility-in-addressing-this-issue": (
                        "Boost participation to obtain statistically significant data."
                    ),
                    "what-constraints-or-requirements-did-you-need-to-consider": (
                        "Limited budget and tight 4‑week deadline."
                    ),
                },
                "action": {
                    "steps": [
                        {
                            "what-did-you-specifically-do-in-this-step": (
                                "Performed logistic‑regression analysis to identify key barriers."
                            ),
                            "how-did-you-do-it-tools-methods-or-skills": "R + tidyverse.",
                        },
                        {
                            "what-did-you-specifically-do-in-this-step": (
                                "Created targeted email templates for under‑represented groups."
                            ),
                            "how-did-you-do-it-tools-methods-or-skills": "Used Mailchimp A/B testing.",
                        },
                    ]
                },
                "result": {
                    "what-positive-outcome-did-you-achieve": (
                        "Response rate climbed from 48 % to 78 %."
                    ),
                    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": (
                        "Provided reliable data that informed $12 M in funding decisions."
                    ),
                },
            },
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Smoke‑test /api/finalPitch.")
    parser.add_argument(
        "--base",
        default="http://localhost:3000",
        help="Base URL of your Next.js server (e.g. https://xyz.ngrok-free.app)",
    )
    args = parser.parse_args()

    url = f"{args.base.rstrip('/')}/api/finalPitch"
    payload = build_payload()

    print(f"POST {url}")
    resp = requests.post(url, json=payload, timeout=90)
    print(f"Status: {resp.status_code}\n")

    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
    except ValueError:
        print("Non‑JSON response:\n", resp.text)


if __name__ == "__main__":
    main()
