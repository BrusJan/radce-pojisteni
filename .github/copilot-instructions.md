# Copilot Instructions - Insurance Advisor (POC)

## POC Goal
This project is a browser-based web application that combines:
- CRM capabilities for salespeople (clients, contracts, notes, interactions)
- An AI assistant for customers (chat over insurance products and contract documents)

Primary goal: reduce repetitive communication load for salespeople while improving customer readiness before contract finalization.

## Language Policy
- The software developer can communicate with Copilot in English.
- Copilot responses to the developer should be in English.
- Source code, comments, and technical documentation should be in English (except domain-specific Czech terms where required).
- Customer-facing UI text, customer chat responses, and customer TTS output must be only in Czech.
- No multilingual support is required in this POC.

## User Types and Main Scenarios
1. Salesperson (internal user)
- Uses the app as a CRM.
- Manages clients (individuals and companies), their documents, notes, recommendations, and sales progress.
- Has full access to customer-AI conversation history.

2. Customer / potential customer (external user)
- Uses a webchat interface to ask about products, valid contracts, and in-progress contracts.
- Can interactively tune contract parameters.
- At the end of a conversation, can receive a contract draft/summary and send it to a salesperson for review, signing, and in-person meeting scheduling.

## Technology Stack (POC)
- Frontend: Angular + Tailwind CSS (browser-based application)
- Backend: Java Spring Boot (preferred for the POC)
- Database: internal SQL database (prefer PostgreSQL; a simpler local dev option is acceptable)
- AI integration: OpenRouter with an abstraction layer for future internal/company LLM providers

## Data, Documents, and RAG
- Each client (person/company) must have isolated data access (tenant-like isolation).
- Stored content includes: PDF, TXT, DOC/DOCX, XML, images, internal salesperson notes, recommendations, plans, and contracts.
- In the POC, input data is imported manually (for example, ZIP package).
- Files are stored on local filesystem in the POC; architecture must allow migration to external object storage later.
- RAG pipeline must support:
  - document ingest and text extraction
  - chunking and embeddings
  - metadata filtering at least by client, document type, and contract status
  - auditable answer provenance (source citations in internal logs)

## AI Behavior and Guardrails
- The model must provide factually correct, consistent answers and minimize hallucinations.
- Answers must be strictly grounded in available client data and valid product materials.
- Define system prompts per use case:
  - internal salesperson prompt (contract validation, recommendations)
  - customer prompt (product explanation, next-step planning)
- If data is insufficient, the model must explicitly say so and offer a next step (for example, escalate to salesperson).

## Communication and Multimodal Output
- Customer chat: text plus optional Czech TTS.
- Salesperson interface: text-only (no TTS required).
- Recommended TTS options for POC:
  - Azure Speech
  - Google Cloud Text-to-Speech
  - ElevenLabs

## Audit, Logging, and Traceability
- All conversations must be logged (timestamp, role, client, model used, relevant sources).
- Salespeople must have access to customer interactions with the AI assistant.
- Important actions (for example, contract draft creation, sending to salesperson) must have an audit trail.

## Architecture Principles
- The system is a sales-support tool with partial automation of customer communication.
- AI does not replace final legal/commercial contract validation; final review is done by the salesperson.
- API and data model design must support future scaling (more clients, more model providers, external storage).

## Local Run (Windows)
- The POC must run locally on Windows.
- Preferred approach:
  - frontend + backend + database via Docker Compose
  - or clearly documented local startup without Docker (Java, Node.js, DB)
- Configure endpoints and secrets via environment variables.

## Development Conventions
- Use camelCase for variables/functions and PascalCase for components/classes.
- Avoid `any` in TypeScript.
- Validate inputs on the backend.
- Never commit sensitive data (passwords, personal identifiers) to the repository.
- Add tests continuously for critical scenarios (RAG retrieval, guardrails, role permissions, audit logs).

## Domain Glossary
- pojistne: premium paid by the policyholder
- pojistnik: policyholder (person/entity signing the insurance contract)
- pojisteny: insured person/entity
- pojistna udalost: insured event (claim-triggering event)
- fransiza: deductible / co-participation in loss
- limit plneni: maximum claim payout limit
