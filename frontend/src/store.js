/**
 * store.js
 *
 * Redux Toolkit setup. "Redux" in the assignment stack means: the form
 * data and chat history live in ONE central store instead of being
 * scattered across component state. Every component reads from here.
 */
import { configureStore, createSlice } from '@reduxjs/toolkit'

const emptyForm = {
  complaint_source: null, customer_name: null,
  product_name: null, product_strength: null, batch_lot_number: null,
  affected_quantity: null, manufacturing_date: null, expiry_date: null,
  originating_site_block: null, impacted_npm: null,
  complaint_category: null, complaint_description: null,
  severity_suggested: null, suggested_next_action: null, initial_risk_assessment: null,
  complaint_id: null, status: 'Pending Triage',
}

const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    form: emptyForm,
    messages: [
      { role: 'assistant', content: 'Ready to process new complaints. Paste the raw complaint text, or drop a PDF/email.' }
    ],
    changedFields: [],   // used to trigger the blue "just updated" highlight
    missingFields: [],
    isProcessing: false,
  },
  reducers: {
    userSentMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload })
      state.isProcessing = true
    },
    agentResponded(state, action) {
      const { updated_state, assistant_message, changed_fields, missing_required_fields } = action.payload
      state.form = updated_state
      state.messages.push({ role: 'assistant', content: assistant_message })
      state.changedFields = changed_fields
      state.missingFields = missing_required_fields
      state.isProcessing = false
    },
    processingFailed(state, action) {
      state.messages.push({ role: 'assistant', content: `Error: ${action.payload}` })
      state.isProcessing = false
    },
    clearHighlights(state) {
      state.changedFields = []
    },
  },
})

export const { userSentMessage, agentResponded, processingFailed, clearHighlights } = complaintSlice.actions

export const store = configureStore({
  reducer: { complaint: complaintSlice.reducer },
})
