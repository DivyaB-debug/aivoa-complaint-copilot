import axios from 'axios'

// Point this at your deployed backend URL when you deploy (Render, etc.)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function sendMessage(message, currentState, chatHistory) {
  const res = await axios.post(`${API_BASE}/api/complaint/process`, {
    message,
    current_state: currentState,
    chat_history: chatHistory,
  })
  return res.data
}

export async function sendFile(file, currentState) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('current_state', JSON.stringify(currentState))
  const res = await axios.post(`${API_BASE}/api/complaint/process-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
