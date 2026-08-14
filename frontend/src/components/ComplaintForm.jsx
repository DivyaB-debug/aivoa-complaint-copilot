import { useSelector } from 'react-redux'

// A small reusable field component. It shows "Awaiting AI extraction..."
// as placeholder text, and briefly highlights blue when the AI just
// changed its value - matching the reference demo's behavior.
function Field({ label, name, value, changedFields, type = 'text' }) {
  const isChanged = changedFields.includes(name)
  const commonProps = {
    className: isChanged ? 'just-updated' : '',
    value: value || '',
    readOnly: true, // AI-populated; wire up onChange if you want manual edits too
    placeholder: 'Awaiting AI extraction...',
  }
  return (
    <div className="field-group">
      <label>{label}</label>
      {type === 'textarea'
        ? <textarea rows={3} {...commonProps} />
        : <input {...commonProps} />}
    </div>
  )
}

export default function ComplaintForm() {
  const { form, changedFields } = useSelector((state) => state.complaint)
  const isReady = !!form.severity_suggested

  return (
    <div className="form-panel">
      <div className="form-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Log Customer Complaint</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>API & FDF Quality Assurance Module</p>
        </div>
        <span className={`status-badge ${isReady ? 'ready' : 'pending'}`}>
          {form.status}
        </span>
      </div>

      <div className="section-title">1. Origin & Customer Details</div>
      <div className="field-row">
        <Field label="Complaint Source" name="complaint_source" value={form.complaint_source} changedFields={changedFields} />
        <Field label="Customer Name" name="customer_name" value={form.customer_name} changedFields={changedFields} />
      </div>

      <div className="section-title">2. Product & Batch Identification</div>
      <div className="field-row">
        <Field label="Product Name" name="product_name" value={form.product_name} changedFields={changedFields} />
        <Field label="Product Strength" name="product_strength" value={form.product_strength} changedFields={changedFields} />
      </div>
      <div className="field-row">
        <Field label="Batch / Lot Number" name="batch_lot_number" value={form.batch_lot_number} changedFields={changedFields} />
        <Field label="Affected Quantity" name="affected_quantity" value={form.affected_quantity} changedFields={changedFields} />
      </div>
      <div className="field-row">
        <Field label="Manufacturing Date" name="manufacturing_date" value={form.manufacturing_date} changedFields={changedFields} />
        <Field label="Expiry Date" name="expiry_date" value={form.expiry_date} changedFields={changedFields} />
      </div>

      <div className="section-title">3. Facility & Material Impact</div>
      <div className="field-row">
        <Field label="Originating Site Block" name="originating_site_block" value={form.originating_site_block} changedFields={changedFields} />
        <Field label="Impacted Non-Product Materials (NPM)" name="impacted_npm" value={form.impacted_npm} changedFields={changedFields} />
      </div>

      <div className="section-title">4. Defect Analysis</div>
      <Field label="Complaint Category" name="complaint_category" value={form.complaint_category} changedFields={changedFields} />
      <div style={{ marginTop: 16 }}>
        <Field label="Complaint Description" name="complaint_description" value={form.complaint_description} changedFields={changedFields} type="textarea" />
      </div>

      {isReady && (
        <div className="risk-card">
          <h3>🛡 AI Copilot Risk Assessment</h3>
          <div className="field-row">
            <Field label="Severity (Suggested)" name="severity_suggested" value={form.severity_suggested} changedFields={changedFields} />
            <Field label="Suggested Next Action" name="suggested_next_action" value={form.suggested_next_action} changedFields={changedFields} />
          </div>
          <Field label="Initial Risk Assessment" name="initial_risk_assessment" value={form.initial_risk_assessment} changedFields={changedFields} type="textarea" />
        </div>
      )}
    </div>
  )
}
