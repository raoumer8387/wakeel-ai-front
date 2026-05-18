# Wakeel-AI Frontend API Integration Guide

This guide explains how the frontend React Native application should interact with the Wakeel-AI conversational backend. The chat pipeline is fully stateful, state-machine driven, and streams responses to the client using Server-Sent Events (SSE).

## 1. Chat Query Endpoint

This is the primary endpoint for all user chat messages.

- **Endpoint**: `POST /api/v1/chat/query`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <Your_JWT_Token>`

### Request Body
```json
{
  "message": "I want a Khula. My husband beats me.",
  "case_id": "CASE_12345" // Optional. Omit if starting a brand new case.
}
```
*Note: If `case_id` is omitted, the backend will generate a new Case ID and return it in the SSE stream. You MUST store this Case ID and send it in all subsequent requests for this conversation.*

### Response Format (Server-Sent Events)
The endpoint returns a stream of events. You should use a library capable of parsing SSE or stream reading (e.g., `react-native-sse` or `fetch` with a `ReadableStream` reader).

Each event looks like this:
```json
{
  "event": "agent1_message",
  "message": "I'm sorry to hear that. Could you tell me if you live in Lahore?",
  "data": { ...optional metadata... },
  "case_id": "CASE_12345"
}
```

---

## 2. Understanding SSE Events

The backend orchestrates multiple agents. As the pipeline progresses, it will emit different events. Your frontend UI should react to these events (e.g., show typing indicators, append chat bubbles).

### Core Events

| Event Name | Meaning | Recommended UI Action |
| :--- | :--- | :--- |
| `pipeline_start` | The backend has received the message. | Show a general loading spinner or "Wakeel is thinking..." |
| `agent1_start` | The Legal Analyst is processing the laws. | Show an indicator: "Legal Analyst is typing..." |
| `agent1_message` | **(Important)** Agent 1's conversational reply or Final Analysis. | Render this as a normal chat bubble from the bot. |
| `agent2_start` | The user consented to drafting. Document Specialist starting. | Show an indicator: "Document Specialist is typing..." |
| `agent2_question` | **(Important)** Agent 2 is asking for missing information (like CNIC). | Render this as a normal chat bubble from the bot. |
| `agent2_done` | The document has been drafted. | Show a success toast. The `data` payload contains the `pdf_path`. |
| `simulation_start` | Simulating court filing. | Show a loading indicator: "Submitting to court..." |
| `simulation_done` | Court filing complete. | Render the `case_ref` in the UI. |
| `complete` | The pipeline has finished executing for this turn. | Stop all typing indicators. Re-enable the chat input field. |

---

## 3. The Conversational Flow (State Machine)

To build a seamless UI, you should understand how the backend state machine operates.

### Phase 1: Consultation
1. The user sends a message.
2. You receive `agent1_start` and then `agent1_message`.
3. Agent 1 will ask clarifying questions until it fully understands the legal problem.
4. Once it understands, Agent 1 will output its **Final Analysis and Recommendations** as an `agent1_message`.
5. At the end of the Final Analysis, Agent 1 will ask: *"Would you like me to prepare a draft for you?"*
6. The stream ends with `complete`.

### Phase 2: Drafting Consent
1. The user replies (e.g., "Yes please").
2. The backend intercepts this message and evaluates the intent. 
3. If the user said yes, the backend transitions automatically to Phase 3. If they said no or asked another question, Agent 1 answers it via `agent1_message`.

### Phase 3: Document Drafting
1. You will receive `agent2_start`.
2. Agent 2 reads the *entire chat history* to find details (names, addresses).
3. If it is missing information, it will emit `agent2_question` asking for those details. The stream ends with `complete`.
4. The user replies with the details.
5. Once Agent 2 has everything, it emits `agent2_done`, generates the PDF, and the case becomes "Filed".

### Phase 4: Updating Filed Documents
If a user clicks on an older case that is already completed (Filed) and sends a message like *"Update my address to Johar Town"*, the backend will **skip Agent 1**, invoke Agent 2 directly, extract the new address, and instantly regenerate the PDF. You will see `agent2_start` -> `agent2_done`.

---

## 4. Frontend Implementation Tips

1. **Wait for `complete`:** Never enable the user's chat input field until you receive the `complete` event. The pipeline is paused until this event fires.
2. **Handle `case_id` on first message:** On the very first message sent to a new chat, listen for the `pipeline_start` or `complete` events to capture the newly generated `case_id`. Save it to your component state so the user's second message is linked to the same case.
3. **Parse SSE chunks carefully:** Sometimes SSE data arrives in fragmented chunks. Ensure your SSE parser buffers incomplete JSON strings before parsing `JSON.parse()`.
