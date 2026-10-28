# Supabase Phone OTP Setup: MSG91 & Twilio (Production & Local Dev)

This guide documents how to configure Phone OTP authentication for **RaddiBhaav** in both local development and production environments.

---

## 1. Local Development Testing

RaddiBhaav comes with a built-in testing workflow for instant OTP testing without burning SMS credits or waiting for network delivery.

### Option A: UI Built-in Test Credentials (Default)
1. On the Login screen (`/auth`), click **"Fill Test Credentials"**.
2. Mobile Number: `+91 98765 43210`
3. Verification Code: `123456`
4. Works in both live Supabase instances and offline mock demo mode.

### Option B: Supabase Dashboard Test Phone Numbers
If connecting to a live Supabase project during development:
1. Open your **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Phone**.
2. Scroll to **Test Phone Numbers**.
3. Click **Add phone number**:
   - **Phone**: `+919876543210`
   - **OTP**: `123456`
4. Click **Save**. Any OTP request to this number bypasses SMS dispatch and immediately accepts `123456`.

---

## 2. Production Setup: MSG91 (Recommended for India)

Because RaddiBhaav operates in India, **MSG91** is the industry standard due to direct Indian carrier routes, low latency, and TRAI DLT compliance.

### Step 1: TRAI DLT Registration (Mandatory in India)
1. Register your business on an Indian Telecom DLT portal (e.g. [Jio DLT](https://trueconnect.jio.com) or [Vilpower](https://www.vilpower.in)).
2. Obtain your **Principal Entity ID (PE ID)**.
3. Register your **Header / Sender ID** (6 alphabetic characters, e.g. `RADDBH`).
4. Register your **Transactional SMS Template**:
   ```text
   Your RaddiBhaav verification code is {#var#}. Valid for 10 minutes. Please do not share this OTP with anyone.
   ```
5. Note down your approved **Template ID** (19-digit number).

### Step 2: Configure MSG91 Dashboard
1. Log in to [MSG91 Console](https://control.msg91.com/).
2. Under **OTP Service**, create or map your DLT Template ID to an MSG91 Template.
3. Obtain your **Auth Key** from MSG91 API Settings.

### Step 3: Configure in Supabase Dashboard
1. Go to **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Phone**.
2. Toggle **Enable Phone Provider** to `ON`.
3. Select **SMS Provider**: `MSG91`.
4. Fill in:
   - **MSG91 Auth Key**: `Your_MSG91_Authkey`
   - **MSG91 Sender ID**: `RADDBH`
   - **MSG91 Template ID**: `Your_19_Digit_DLT_Template_ID`
   - **OTP Expiration**: `600` seconds (10 minutes)
5. Click **Save**.

---

## 3. Production Setup: Twilio

If you are using Twilio for international SMS delivery:

### Step 1: Twilio Account & Credentials
1. Create a [Twilio Account](https://www.twilio.com/).
2. From the Twilio Console, copy:
   - **Account SID**
   - **Auth Token**
3. Buy a phone number or configure a **Messaging Service SID** that supports SMS termination to Indian mobile numbers (+91).

> [!IMPORTANT]
> If sending to Indian numbers via Twilio, you must still register your DLT Entity ID and Template ID within the Twilio Console under **Regulatory Compliance -> India DLT**, otherwise telecom operators in India will reject the SMS.

### Step 2: Configure in Supabase Dashboard
1. Go to **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Phone**.
2. Select **SMS Provider**: `Twilio`.
3. Enter:
   - **Twilio Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Twilio Auth Token**: `your_twilio_auth_token`
   - **Twilio Message Service SID** or **Twilio Phone Number**: `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxx` or `+1XXXXXXXXXX`
4. Set SMS Template:
   ```text
   Your RaddiBhaav OTP is {{ .Code }}. Valid for 10 minutes.
   ```
5. Click **Save**.

---

## 4. Next.js Environment Configuration

Update your `.env.local` file with your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Project Credentials (from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

---

## 5. Security & Rate Limiting Checklist
- [x] Strict Row Level Security (RLS) active on all tables.
- [x] Contact numbers hidden until an offer is accepted (`has_accepted_deal()`).
- [x] KYC documents stored in private Storage bucket `kyc-documents` with signed URLs.
- [x] Dealer access restricted to KYC-approved accounts.
- [x] Max 3 OTP requests per phone number every 10 minutes (configured in Supabase Auth -> Rate Limits).
