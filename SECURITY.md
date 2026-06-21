# Security Policy (SECURITY.md)

This document outlines the security policy for ASTRA (Advanced Space Telemetry & Retrieval Agent) and explains how to report security vulnerabilities, supported versions, and the core security invariants implemented in the system.

---

## 🛡️ Supported Versions

We actively support and patch security vulnerabilities on the following versions:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **v1.x** | ✅ Yes | Current main branch and active telemetry development core. |
| **v0.x** | ❌ No | Early prototype releases (pre-release). Please upgrade to v1.x. |

---

## 🔍 Reporting a Vulnerability

We take the security of our orbital command and telemetry systems very seriously. If you identify a security vulnerability in the ASTRA codebase, API gateway, or database integration, **please do not open a public GitHub issue.** Instead, follow this reporting process:

1.  **Draft Report**: Document the vulnerability, including detailed steps to reproduce, code snippets (e.g., matching exploit payloads), and potential impact.
2.  **Submit Privately**: Email your findings directly to the maintainers at **security@astra-command.net** (or submit via GitHub's private vulnerability reporting system if enabled).
3.  **Acknowledge & Triage**: We will acknowledge receipt of your report within **24 hours** and provide an estimated timeline for triaging and patching.
4.  **Coordinated Disclosure**: We aim to resolve all reported vulnerabilities within **30 days**. We will work with you to coordinate a public disclosure timeline once a patch has been rolled out.

---

## ⚡ Core Security Invariants

ASTRA implements a strict security posture across all system boundaries to safeguard data integrity and telemetry operations. The primary mechanisms are summarized below:

### 1. Data Invariants & Access Control
*   **User Isolation**: Access to any document or query matching `/users/{userId}/...` is strictly locked. Users must be authenticated, and their session ID must match the request route. Cross-tenant reads/writes are blocked.
*   **API Key Authorization**: All external client requests to `/api/v1/context/generate` require a Bearer token.
*   **Data Validation Checks**: Schema validation constraints are applied at the database layer (Supabase Row Level Security or local SQLite filters) to verify payload constraints (e.g., maximum description lengths, score boundaries, alphanumeric ID formats).

### 2. The "Dirty Dozen" Exploit Payloads Guard
The system is designed and tested to reject the following exploit vectors (documented in [security_spec.md](security_spec.md)):
*   **Cross-Tenant Spoofing**: Attempting to read/write data in another user's space.
*   **Schema Expansion Attacks**: Injecting unmapped properties (e.g., `isAdmin: true` or shadow fields) to bypass privilege boundaries.
*   **Value Poisoning**: Submitting excessive string lengths (denial of wallet/storage exhaust attacks) or wrong data types.
*   **Out-of-Bounds Metrics**: Attempting to write numeric metrics (like crew vital scores or telemetry values) outside acceptable bounds.
*   **Identity Spoofing**: Attempting to sign API payloads using invalid, malformed, or unverified IDs.
*   **Immutable Violations**: Attempting to modify immutable properties like record IDs during updates.

---

## 🛡️ Telemetry & System Hardening Best Practices

When deploying ASTRA in production environments, ensure you follow these hardening guidelines:
*   **Supabase RLS**: Enable Row Level Security (RLS) on all database tables in Supabase (see [supabase_schema.sql](supabase_schema.sql) for table definitions).
*   **API Key Rotation**: Periodically rotate and delete inactive API keys using the ASTRA Developer Console UI.
*   **Secure Environment Variables**: Never commit `.env.local` to git. Ensure production credentials are encrypted in your hosting platform (Vercel, Google Cloud Run, etc.).
