# WhatsApp Mode Integration Guide

## Overview

WhatsApp mode provides a free alternative to Telegram for interacting with ForgeCli through WhatsApp. This implementation uses **Baileys**, a free WhatsApp Web automation library that doesn't require a business account.

⚠️ **Important Security Notice**: Baileys operates in a grey area regarding WhatsApp's ToS. Use responsibly to avoid account restrictions. This is for personal/development use only.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Dependencies Installation](#dependencies-installation)
3. [File Structure](#file-structure)
4. [Implementation Steps](#implementation-steps)
5. [Key Differences](#key-differences)
6. [Important Notes](#important-notes)
7. [Code Examples](#code-examples)

---

## Environment Variables

### Required Setup

Add the following to your `.env` file:

```env
# WhatsApp Configuration (Baileys)
WHATSAPP_OWNER_ID=<your-phone-number>  # e.g., 919876543210 (without +, include country code)
FIRECRAWL_API_KEY=<your-key>           # Optional, for web tools in responses
```

### Phone Number Format

- **Format**: `countrycode+number` (without the `+` sign)
- **Examples**:
  - India: `919876543210`
  - USA: `12025551234`
  - UK: `441632960000`
- **How to find**: Open WhatsApp, Settings → Account → Phone number

---

## Dependencies Installation

```bash
# Install required packages
bun add @whiskeysockets/baileys qrcode-terminal

# Install type definitions
bun add -D @types/qrcode-terminal
```

### Dependency Descriptions

| Package | Purpose |
|---------|---------|
| `@whiskeysockets/baileys` | WhatsApp Web automation library for message handling |
| `qrcode-terminal` | Display QR code in terminal for WhatsApp login |
| `@types/qrcode-terminal` | TypeScript type definitions for QRCode Terminal |

---

## File Structure

Create the following files in `modes/whatsapp/`:

```
modes/whatsapp/
├── index.ts              # Entry point & Baileys initialization
├── handlers.ts           # Message and callback handlers
├── auth.ts               # Owner verification logic
├── constants.ts          # Welcome messages and templates
├── agent-run.ts          # Ask/Agent/Plan execution (adapted from Telegram)
├── approval-session.ts   # Change approval workflow (reuse from Telegram)
├── plan-session.ts       # Plan selection UI (reuse from Telegram)
├── text.ts               # Text utilities (reuse from Telegram)
└── Whatsapp.md          # This documentation file
```

### Files to Reuse from Telegram

These files can be copied/adapted directly from `modes/telegram/`:
- `approval-session.ts` — Change approval workflow (same logic)
- `plan-session.ts` — Step selection UI (same logic)
- `text.ts` — Text utilities (same functionality)

---

## Implementation Steps

### Step 1: Update `tui/wakeup.ts`

Uncomment the WhatsApp import and enable the mode selection:

```typescript
import { runWhatsappMode } from "../modes/whatsapp/index.ts";

// In the runwakeup() function:
if(mode === "whatsapp") {
  await runWhatsappMode();
}
```

### Step 2: Create File: `modes/whatsapp/index.ts`

Main entry point that initializes Baileys, handles QR code login, and manages connection lifecycle.

**Responsibilities:**
- Initialize Baileys socket
- Display QR code for WhatsApp login
- Handle connection updates
- Register message handlers
- Manage graceful shutdown

**Key Features:**
- Auth state saved in `.auth_baileys/` folder
- QR code displayed in terminal for scanning with WhatsApp
- Auto-reconnection on disconnection
- Proper cleanup on SIGINT/SIGTERM signals

### Step 3: Create File: `modes/whatsapp/handlers.ts`

Message dispatcher that processes incoming WhatsApp messages and routes them to appropriate handlers.

**Responsibilities:**
- Listen for incoming messages
- Parse command format (`/ask`, `/agent`, `/plan`, `/help`)
- Verify owner authorization
- Route to appropriate handler function

**Supported Commands:**
- `/ask <question>` — Read-only codebase analysis
- `/agent <task>` — Full AI execution with approval
- `/plan <goal>` — Generate step-by-step plan
- `/start` or `/help` — Show welcome message

**Key Differences from Telegram:**
- WhatsApp doesn't support inline keyboards/buttons
- Use text-based menus for selections
- Messages limited to ~1024 characters
- No markdown formatting support

### Step 4: Create File: `modes/whatsapp/auth.ts`

Simple ownership validation to ensure only the bot owner can invoke commands.

**Logic:**
- Extract phone number from WhatsApp JID (message sender ID)
- Compare with `WHATSAPP_OWNER_ID` environment variable
- Return true/false for authorization

### Step 5: Create File: `modes/whatsapp/constants.ts`

Define static messages and templates used throughout the bot.

**Contains:**
- Welcome message with command descriptions
- Help text
- Response templates

### Step 6: Create File: `modes/whatsapp/agent-run.ts`

Core execution engine adapted from Telegram version.

**Functions:**
- `runAsk(sock, sender, question)` — Read-only AI analysis
- `runAgent(sock, sender, goal)` — Full AI execution with approval
- `runPlanSteps(sock, sender, plan, steps)` — Execute selected plan steps

**Adaptations from Telegram:**
- Replace `ctx` parameter with `sock` (WASocket) + `sender` (phone JID)
- Replace `ctx.reply()` with `sock.sendMessage(sender, { text: message })`
- Reduce text clipping from 4000 to 1024 characters

### Step 7: Create File: `modes/whatsapp/text.ts`

Utility functions for text processing and formatting.

**Functions:**
- `clip(text, max)` — Truncate text to max length with ellipsis
- `replyMd(sock, jid, text)` — Send formatted message with auto-clipping
- `commandArg(fullText, name)` — Extract argument from command

**Note:** WhatsApp doesn't support markdown, so formatting is limited to plain text.

### Step 8: Create File: `modes/whatsapp/approval-session.ts`

Change review and approval workflow. Can be copied from `modes/telegram/approval-session.ts`.

**Responsibilities:**
- Group pending changes by file vs. shell commands
- Generate approval summary
- Show code diffs
- Handle user accept/reject decisions

**Adaptations:**
- Replace Telegram button callbacks with text-based commands
- Adjust for WhatsApp's UI limitations

### Step 9: Create File: `modes/whatsapp/plan-session.ts`

Plan UI and step selection management. Can be copied from `modes/telegram/plan-session.ts`.

**Responsibilities:**
- Render plan with step descriptions
- Track selected steps
- Generate selection UI

**Adaptations:**
- Use text-based menu instead of inline buttons
- Implement step selection via numbered options

---

## Key Differences

### Comparison Table

| Aspect | Telegram | WhatsApp (Baileys) |
|--------|----------|-------------------|
| **Cost** | Free | Free |
| **Setup** | Bot Token from BotFather | QR Code scan |
| **Account Type** | Bot account | Personal account |
| **Buttons** | Inline keyboards supported | Text-based menus only |
| **Message Limit** | 4000 characters | ~1024 characters |
| **Markdown** | Full support | Not supported |
| **Web Hooks** | Required | Not required |
| **ToS Compliance** | Official | Grey area (automation) |
| **Stability** | Very stable | May break on WhatsApp updates |
| **Session Data** | In-memory | `.auth_baileys/` folder |

### UI Limitations

WhatsApp doesn't support interactive buttons like Telegram. Implement workarounds:

**For Plan Selection:**
```
📋 Plan: Create authentication system

1 ✅ Add user model schema
2 ⬜ Create password hashing utility
3 ⬜ Implement login endpoint

Send: select 1,3 (to toggle steps)
Send: proceed (to execute selected steps)
```

**For Approval:**
```
✅ Changes staged:
- Created: src/auth.ts (156 lines)
- Modified: src/main.ts (12 lines)

Send: show-diff (to see changes)
Send: accept (to apply changes)
Send: reject (to discard changes)
```

---

## Important Notes

### Critical Warnings

⚠️ **Account Safety:**
1. WhatsApp may detect bot activity and restrict the account
2. Don't use the same phone number for WhatsApp Web simultaneously
3. Keep the phone logged in while the bot is running
4. Rate limiting will occur if too many messages are sent quickly
5. Use responsibly — this is not officially supported by WhatsApp

### Session Management

**Auth Files:**
- Location: `.auth_baileys/` (created automatically)
- Contains: Session tokens, device info, message history
- **Action**: Add to `.gitignore` to prevent sharing credentials

```gitignore
.auth_baileys/
.env
.env.local
```

### Message Queue

- WhatsApp has rate limits on message sending
- Implement delays between messages (200-500ms)
- Batch-send when possible

### Error Handling

Common disconnection reasons:
- Device logged out
- Session expired
- Network issues
- WhatsApp updates

All cause automatic reconnection prompt.

---

## Code Examples

### Example 1: Basic Handler Structure

```typescript
// modes/whatsapp/handlers.ts - Simplified overview
export function registerHandlers(sock: WASocket) {
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    const sender = msg.key.remoteJid!;
    const text = msg.message?.conversation || "";

    // Verify owner
    if (!isOwner(sender)) return;

    // Route commands
    if (text.startsWith("/ask ")) {
      const question = text.replace("/ask ", "").trim();
      await runAsk(sock, sender, question);
    }
  });
}
```

### Example 2: Connection Lifecycle

```typescript
// modes/whatsapp/index.ts - Connection handling
sock.ev.on("connection.update", (update) => {
  const { connection, qr } = update;
  
  // QR code for login
  if (qr) {
    QRCode.generate(qr, { small: true });
  }
  
  // Connected successfully
  if (connection === "open") {
    console.log("WhatsApp bot is ready!");
  }
});
```

### Example 3: Message Sending

```typescript
// Send text message
await sock.sendMessage(sender, { 
  text: "Hello! Use /help for commands" 
});

// Send with mention
await sock.sendMessage(sender, {
  text: "@user mentioned this"
});

// Send media (if needed)
await sock.sendMessage(sender, {
  image: { url: "https://example.com/image.jpg" },
  caption: "Here's an image"
});
```

---

## Future Enhancements

### Phase 1 (Current - Documentation)
- ✅ Plan and document the WhatsApp integration
- ✅ Identify dependencies and setup requirements
- ✅ Design file structure
- ✅ Prepare code examples

### Phase 2 (Implementation - When Ready)
- Create base files (index.ts, handlers.ts, auth.ts, constants.ts)
- Adapt agent-run.ts from Telegram version
- Implement text-based UI for plan selection
- Implement text-based approval workflow
- Test with owner account only

### Phase 3 (Optimization - Later)
- Add retry logic and error recovery
- Implement message queue for rate limiting
- Add conversation context management
- Create backup mechanism for session data

### Phase 4 (Advanced - Optional)
- Support for media responses (images, documents)
- Group chat support
- Multi-user authorization
- Analytics and usage tracking

---

## Deployment Checklist

Before implementing, ensure:

- [ ] `.env` file has `WHATSAPP_OWNER_ID` set
- [ ] All dependencies installed: `bun add @whiskeysockets/baileys qrcode-terminal`
- [ ] Phone number is active and WhatsApp is installed
- [ ] `.auth_baileys/` is in `.gitignore`
- [ ] Understanding of Baileys' ToS implications
- [ ] Backup plan if account gets restricted

---

## Troubleshooting Reference

### QR Code Not Scanning
- Ensure terminal supports Unicode characters
- Try rotating phone's screen
- Close WhatsApp Web on other devices

### "Logged out" Messages
- Phone was logged out from WhatsApp Web
- Delete `.auth_baileys/` folder and restart
- Scan QR code again

### Message Not Sending
- Check rate limiting (add delays between messages)
- Verify `WHATSAPP_OWNER_ID` is correct
- Check internet connection

### Bot Not Responding
- Verify sender is the owner (check JID format)
- Check logs for error messages
- Ensure handler is registered correctly

---

## Additional Resources

- **Baileys GitHub**: https://github.com/WhiskeySockets/Baileys
- **WhatsApp Web Protocol**: Understanding how Baileys communicates
- **Message Format**: JID format for WhatsApp IDs

---

## Security Considerations

### Data Privacy
- No messages stored by the bot
- Session data stored locally only
- Clear `.auth_baileys/` when not in use

### Account Protection
- Only owner can execute commands
- No command history logged
- Session expires on disconnect

### Best Practices
1. Use a dedicated phone number for the bot (if possible)
2. Monitor account activity regularly
3. Don't share `.auth_baileys/` files
4. Test in development before production use
5. Have a fallback communication method

---

## Summary

This WhatsApp integration provides:
- ✅ Free alternative to paid WhatsApp Business API
- ✅ Same three workflows: Ask, Agent, Plan
- ✅ Single-owner authentication
- ✅ Full code approval workflow
- ✅ Step-by-step planning interface

**Trade-offs:**
- ⚠️ Grey area ToS compliance
- ⚠️ Text-based UI instead of interactive buttons
- ⚠️ Lower rate limits
- ⚠️ Requires active phone number
- ⚠️ May break on WhatsApp updates

---

**Status**: Documentation Complete - Ready for Implementation When Desired
**Last Updated**: 2026-07-14
