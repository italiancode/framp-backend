# 📝 Framp Waitlist API

> 📌 This doc is written to be **super clear** so even if you're new to APIs, you'll get it.

---

## 📍 Where to Send the Data

- **Local development (testing)**:

  ```
  http://localhost:3000/api/waitlist
  ```

- **Live app (production)** – replace this with your deployed domain:
  ```
  https://framp.app/api/waitlist
  ```

---

## 📤 What to Send

You need to send a `POST` request with some user details.

> `POST` means you're sending data to the server (not just viewing a page like a normal link).

### ✅ Data to Include (JSON Format):

```json
{
  "email": "user@example.com", // Required
  "name": "Framp User", // Optional
  "wallet": "0x1234abc...", // Optional
  "referral": "invite-code-123" // Optional
}
```

- ✅ `email`: The only required field
- `name`: Their full name or nickname (optional)
- `wallet`: Their wallet address (optional for now)
- `referral`: Referral code or username (optional)

---

## 📦 Example Code (Frontend)

You can use this in React, Vanilla JS, or any frontend framework:

```js
fetch("/api/waitlist", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@example.com",
    name: "Big Dream",
    wallet: "0xABCDEF1234",
    referral: "sol-bro-420",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
  });
```

---

## ✅ What You’ll Get Back

- If the signup works:

```json
{
  "message": "Signed up successfully"
}
```

- If something went wrong (like they already signed up):

```json
{
  "error": "User already exists"
}
```

---

## 🧠 Smart Stuff the Backend Handles Automatically

- We **automatically record**:
  - The user’s IP address 🌐
  - Their device info 📱 (called "user agent")
- You **don’t** have to send those from the frontend.

---

## 🔐 Security & Best Practices

- Always use `https://` in production
- Don’t expose any secret keys on the frontend
- Consider adding email confirmation later (we're building that next)

---
