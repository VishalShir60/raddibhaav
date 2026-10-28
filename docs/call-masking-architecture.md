# RaddiBhaav: Call Masking & Privacy Architecture

## Overview
Hyperlocal scrap collection marketplaces require balancing **user privacy** (preventing unsolicited spam, off-platform harassment, and direct bypassing) with **operational reliability** (allowing dealers to call for gate access, landmark directions, and payment confirmation).

---

## 1. Contact Privacy Lifecycle

| Marketplace Stage | Seller Visibility to Dealer | Dealer Visibility to Seller | Telecom Bridge Status |
| :--- | :--- | :--- | :--- |
| **Bidding Open** | Neighborhood only (e.g. *"Kothrud, Pune"*). Exact flat & phone hidden. | Business name, rating, distance, badges. Phone masked (`+91 98XXX XXXXX`). | **Locked / Inactive** |
| **Bid Accepted** | Exact address, landmark, direct phone & WhatsApp unlocked. | Direct phone & WhatsApp unlocked. | **Active Bridge** |
| **Pickup Completed** | Archived. | Archived. | **Terminated** |

---

## 2. Production Call Masking Architecture (Virtual DID Proxy)

In enterprise production deployments, RaddiBhaav integrates with Indian cloud telephony providers like **Exotel**, **Twilio India**, or **Knowlarity**:

```
[Seller Phone] <-----> [Exotel / Twilio Virtual Number] <-----> [Dealer Phone]
                             (Bridge Proxy API)
```

### Flow:
1. **Bridge Initiation**: When either party taps *"Call via App"*, an authenticated request is made to `POST /api/calls/bridge`:
   ```json
   {
     "pickup_id": "pickup-abc-123",
     "caller_role": "seller"
   }
   ```
2. **Virtual Number Assignment**: The server requests a temporary virtual number (DID) mapped to the two parties for 24 hours.
3. **Outbound Call Leg**: The telephony service calls Party A first, and once answered, bridges the call to Party B.
4. **Number Masking**: Neither party sees the other's personal SIM number; the caller ID on both screens displays the RaddiBhaav platform number (`+91 80XXXXXXXX`).
5. **Session Expiry**: Once the pickup is marked `completed` or `cancelled`, the virtual number mapping is released into the pool.

---

## 3. MVP Limitations & Pragmatic Approach

### Why Virtual Masking is Documented Rather than Live in MVP:
1. **TRAI Telecom Regulations**: Commercial call forwarding/bridging in India requires:
   - Enterprise registration with a licensed Access Service Provider (TSP/VNO).
   - DLT (Distributed Ledger Technology) scrub compliance.
   - KYC submission of corporate entity under DoT guidelines.
2. **Cost Structure**: Cloud telephony bridging costs approximately **₹0.50 to ₹0.85 per minute** (charged on two simultaneous legs). In an MVP testing phase where scrap transactions range between ₹200 and ₹800 with 100% commission waived, absorbing telephony toll charges on uncommitted leads is financially unsustainable.
3. **Hyperlocal Reality in India**: Dealers and sellers overwhelmingly prefer **WhatsApp location sharing** and direct audio calls for quick landmark directions (e.g., *"behind Ganpati Temple, 2nd floor"*).

### MVP Implementation:
- **Strict Pre-Acceptance Masking**: All telephone digits are replaced with `+91 98XXX XXXXX` in UI and redacted in client APIs.
- **Post-Acceptance Intent Gating**: Direct `tel:` and click-to-chat WhatsApp deep links are made available **strictly after** the household seller clicks "Accept Offer".
- **Dispute Protection**: If a dealer misbehaves, the seller has an instant "Report Dispute / Suspend Dealer" control in the active pickup view.
