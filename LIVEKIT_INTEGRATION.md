# Mycel Live production integration

## Services

- LiveKit Cloud: camera, microphone, screen sharing, rooms, recording, and media events.
- Supabase: authentication, approved-session records, consent, attendance, chat, confusion anchors, key notes, moderation, and reports.
- tldraw sync: persistent multiplayer problem board.
- A transcription provider: timestamped speaker transcript segments.

## Required environment variables

Frontend:

- `VITE_LIVEKIT_URL`
- Existing Supabase public variables

Vercel server functions only:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

Never expose the LiveKit API secret in a `VITE_` variable.

## Server-enforced room creation

1. The host submits the session application to `live_sessions` with `status = submitted`.
2. Server-side policy screening returns `approved`, `review`, or `rejected` with a reason.
3. `review` requires a trusted human moderator.
4. Only an approved session can receive a LiveKit room name.
5. The token endpoint verifies authentication, session status, participant capacity, role, and consent before signing a short-lived LiveKit token.
6. Recording Egress can begin only after the server confirms every recorded participant's consent.

## Suggested Vercel endpoints

- `POST /api/live/sessions` submits a host application.
- `POST /api/live/sessions/:id/screen` performs server-side screening.
- `POST /api/live/sessions/:id/token` issues a short-lived participant token.
- `POST /api/live/sessions/:id/recording` starts or stops recording after consent checks.
- `POST /api/live/webhooks` receives room, participant, track, and recording events.
- `POST /api/live/sessions/:id/report` creates the durable learning report.

## Mycel policy boundary

Allow good-faith teaching, difficult questions, critique, research discussion, and technical demonstrations. Reject or review harassment, personal-data exposure, academic cheating, dangerous instruction without appropriate safeguards, unauthorised copyrighted sharing, paid solicitation, spam, and sessions involving minors without enhanced review.

