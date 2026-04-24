# API Contract: Contact Form

**Feature**: Legal & Compliance (Phase 2d)  
**Endpoint**: `POST /api/contact`  
**Authentication**: None required (Tier 0 — unauthenticated access)  
**Rate Limit**: 5 submissions per hour per IP address

---

## Request

### Endpoint

```
POST /api/contact
Content-Type: application/json
```

### Schema (Zod)

```typescript
const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less')
    .toLowerCase(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be 5000 characters or less')
    .trim(),
});

type ContactFormInput = z.infer<typeof contactFormSchema>;
```

### Example Request

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "message": "I have a question about the animation editor. How do I export my creation as a video?"
}
```

---

## Response

### Success Response (200 OK)

```typescript
{
  "success": true,
  "message": "Thank you for your message. We'll get back to you soon."
}
```

### Error Responses

#### 400 Bad Request — Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Name is required",
    "email": "Invalid email address",
    "message": "Message must be at least 10 characters"
  }
}
```

#### 429 Too Many Requests — Rate Limit Exceeded

```json
{
  "success": false,
  "message": "Too many submissions. Please try again in an hour."
}
```

#### 500 Internal Server Error — Email Service Failure

```json
{
  "success": false,
  "message": "An error occurred. Please try again later or contact us directly."
}
```

---

## Implementation Details

### Validation Flow

1. **Client-side** (form component): Validate via Zod schema before submit
2. **Server-side** (API route): Re-validate schema on POST handler
   - Generic error response to prevent data leakage (e.g., "An error occurred")
3. **Content Blocklist**: Check message against low-moderate blocklist (spam keywords, IP reputation optional)

### Email Delivery

1. **Service**: Supabase SMTP via `nodemailer`
2. **Destination**: Operator email address (configured in `.env.local`)
3. **Template**: Plain text email with name, sender email, message body
4. **No Storage**: Email sent only; no record kept in database

### Rate Limiting

- **Method**: IP-based (via `x-forwarded-for` header from Vercel)
- **Limit**: 5 submissions per IP per hour
- **Storage**: In-memory (Vercel Function runtime) or Redis if needed
- **Response**: 429 status + user-friendly message

---

## Submission Flow Diagram

```
User fills form
       ↓
[Client-side Zod validation]
       ↓
POST /api/contact
       ↓
[Rate limit check] → 429 if exceeded
       ↓
[Re-validate Zod schema] → 400 if invalid
       ↓
[Content blocklist check] → 400 if blocked
       ↓
[Send email via Supabase SMTP]
       ↓
200 OK (success = true)
       ↓
User sees confirmation message
```

---

## Testing Checklist

- [ ] Validate: name required, email required, message required
- [ ] Validate: email format (e.g., reject "invalid-email")
- [ ] Validate: message minimum 10 chars, maximum 5000 chars
- [ ] Rate limit: 6th submission within 1 hour returns 429
- [ ] Rate limit: IP address isolation (multiple IPs = separate limits)
- [ ] Email delivery: Test submission received at operator inbox
- [ ] Email content: Verify name, sender email, message body intact
- [ ] Error handling: Email service down → 500 with generic message
- [ ] Accessibility: Form labels, error announcements, keyboard navigation

---

## Environment Variables

```bash
# .env.local
SUPABASE_SMTP_USER=your-supabase-smtp-user
SUPABASE_SMTP_PASSWORD=your-supabase-smtp-password
SUPABASE_SMTP_HOST=smtp.supabase.io  # or your Supabase region
SUPABASE_SMTP_PORT=587
CONTACT_FORM_RECIPIENT_EMAIL=operator@example.com
```

**Note**: Supabase SMTP credentials are configured in Supabase project dashboard under Email Templates or SMTP settings.
