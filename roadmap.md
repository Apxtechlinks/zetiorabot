# Roadmap

- [x] Business dashboard pages (Overview, Inbox, Products, Knowledge Base, AI & Prompts, Customers, Orders, Usage, Settings)
- [x] Landing page on `/`
- [x] `/app/whatsapp` page (honest states only)
- [x] Seven owner pages under `/admin`
- [x] Public endpoints for the WhatsApp service (`inbound-message`, `connection-state`)
- [x] AI reply logic (`buildAiReply`)
- [x] Fix the WhatsApp connect endpoint
- [x] README
- [x] Downloadable WhatsApp worker service + setup instructions
- [x] Set WHATSAPP_WORKER_TOKEN (shared with worker)
- [x] Set WHATSAPP_WORKER_URL once the worker is hosted
- [x] Business onboarding screen for new accounts (creates business + owner membership)
- [ ] End-to-end test: create business → connect WhatsApp via pairing code (needs deployed Railway services and a phone to link)
- [x] Complete Railway deployment files, environment template and step-by-step guide
- [x] Verify deployment configuration and preview after package update (build OK; public pages render without runtime errors; Railway Docker deployment still needs external verification)
- [ ] Verify external deployment with a new independent backend (needs user's hosting account and new backend credentials)
