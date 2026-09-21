# Security Specification: Signora Bloom Atelier

## 1. Data Invariants
1. `site_content`: The website content document (`/site_content/{contentId}`) represents the live digital storefront configuration (hero slides, collections, products catalog, and editorial sections). Public visitors have read-only access to view the active catalog.
2. Updates and writes to `site_content` require verified administrator credentials (`gdrifat2@gmail.com` with verified email or a registered admin document in `/admins/{adminId}`).
3. Every `site_content` document must contain valid required blocks: `brand`, `hero`, `collections`, `editorial`, `products`, and `footer`.
4. The collections and products arrays must be bounded (collections <= 50, products <= 200) to prevent Denial of Wallet and payload injection.
5. All document ID variables must conform to `isValidId` (`^[a-zA-Z0-9_\\-]+$` with size <= 128).

## 2. The Dirty Dozen Test Payloads
1. **Ghost Field / Identity Spoofing**: An unauthenticated attacker attempts to write an unauthorized `site_content` document. (Expected: PERMISSION_DENIED)
2. **Unverified Email Injection**: A user with email `gdrifat2@gmail.com` but `email_verified: false` attempts to write `site_content`. (Expected: PERMISSION_DENIED)
3. **Array Overflow Attack**: An attacker attempts to submit a `products` array with 5,000 items to exhaust memory and read quota. (Expected: PERMISSION_DENIED)
4. **Document ID Poisoning**: An attacker targets an oversized document path with special injection characters `/site_content/../../../admin`. (Expected: PERMISSION_DENIED)
5. **Missing Required Structure**: An attacker submits a partial `site_content` without `brand` or `hero`. (Expected: PERMISSION_DENIED)
6. **Malicious Admin Document Escalation**: An unprivileged user attempts to create a document in `/admins/{uid}` granting themselves `SUPER_ADMIN`. (Expected: PERMISSION_DENIED)
7. **Blanket Collection Deletion**: An unauthenticated caller attempts to delete `/site_content/current`. (Expected: PERMISSION_DENIED)
8. **Invalid Schema Injection**: An attacker replaces the `brand` map with an arbitrary executable string. (Expected: PERMISSION_DENIED)
9. **Admin Listing Scraping**: An unauthenticated user attempts to list the `/admins` collection to harvest staff emails. (Expected: PERMISSION_DENIED)
10. **Type Poisoning on Hero**: An attacker passes a boolean for `hero` instead of a map structure. (Expected: PERMISSION_DENIED)
11. **Negative Array Sizing**: An attacker creates a malformed request with invalid sub-objects. (Expected: PERMISSION_DENIED)
12. **Catch-All Probe**: An attacker attempts to read or write to an undefined collection like `/secret_keys/{id}`. (Expected: PERMISSION_DENIED)
