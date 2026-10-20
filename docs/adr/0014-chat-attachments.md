# 0014. Chat attachments as their own table

Status: Accepted

## Context

Messages stored a client-supplied `media_url`, so any URL could be sent as an image, and a message could carry only one file.

## Decision

An `attachments` table (`uploader_id`, `message_id` null until sent, `storage_key`, `mime_type`, `size`, `width`, `height`). Upload creates an unsent row owned by the uploader; sending a message attaches only the sender's own unsent attachments, under a row lock. Existing images were migrated into the table and `messages.media_url` was dropped.

## Consequences

- Messages carry `attachments[]`; several files per message and other file types fit without schema changes.
- Unsent uploads stay in the table until a cleanup job exists.
