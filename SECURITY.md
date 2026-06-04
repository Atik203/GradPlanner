# Security Policy

## Supported Versions

We actively update and patch the main branch of GradPlanner. Security updates are applied to the latest stable versions of our client and server stacks.

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

---

## Reporting a Vulnerability

If you identify a security vulnerability in GradPlanner (especially regarding authentication, database filters, or session handling), please do **not** file a public issue on GitHub. Instead, follow these steps:

1.  **Email Disclosures:** Send a detailed report to `security@gradplanner.com` describing the vulnerability.
2.  **Report Contents:** Include:
    *   Steps to reproduce the vulnerability (including payloads or API sequences).
    *   Estimated severity (e.g. CSRF, SQL Injection, Privilege Escalation).
    *   Browser/environment versions tested.
3.  **Triage Timeline:** We aim to acknowledge your report within 48 hours and provide a resolved patch or timeline within 7 days.
4.  **Responsible Disclosure:** We request that you do not publish the vulnerability details until a fix has been merged to production to safeguard student data.
