import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { userSentMessage, agentResponded, processingFailed } from '../store'
import { sendMessage, sendFile } from '../api'

export default function CopilotChat() {
  const dispatch = useDispatch()
  const { messages, form, isProcessing } = useSelector((state) => state.complaint)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isProcessing) return
    const message = input
    setInput('')
    dispatch(userSentMessage(message))

    try {
      // chat_history kept simple here; expand if you want multi-turn LLM context
      const data = await sendMessage(message, form, [])
      dispatch(agentResponded(data))
    } catch (err) {
      dispatch(processingFailed(err.message))
    }
  }

  async function handleFileDrop(e) {
    const file = e.target.files[0]
    if (!file) return
    dispatch(userSentMessage(`📄 ${file.name}`))
    try {
      const data = await sendFile(file, form)
      dispatch(agentResponded(data))
    } catch (err) {
      dispatch(processingFailed(err.message))
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>🧪 AIVOA Copilot</h2>
        <p>Drop complaint files or paste text below.</p>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
        {isProcessing && <div className="msg assistant">Analyzing…</div>}
      </div>

      <label className="file-drop-label">
        📎 Upload complaint PDF/email
        <input type="file" accept=".pdf,.eml,.txt" onChange={handleFileDrop} style={{ display: 'none' }} />
      </label>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message or paste a complaint..."
          disabled={isProcessing}
        />
        <button onClick={handleSend} disabled={isProcessing}>Send</button>
      </div>
      <div className="powered-by">POWERED BY LANGGRAPH</div>
    </div>
  )
}
