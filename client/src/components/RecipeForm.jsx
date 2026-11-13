import { useState } from 'react';
import { UNITS } from '../units.js';

const emptyRow = { name: '', quantity: '', unit: 'g' };

export default function RecipeForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [steps, setSteps] = useState(initial?.steps ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [rows, setRows] = useState(
    initial?.ingredients?.length ? initial.ingredients : [emptyRow],
  );
  const [error, setError] = useState('');

  function updateRow(i, field, value) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows([...rows, emptyRow]);
  }
  function removeRow(i) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const body = {
      title,
      steps,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name,
          quantity: Number(r.quantity),
          unit: r.unit,
        })),
    };
    try {
      await onSubmit(body);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={120}
        required
      />
      <h3>Ingredients</h3>
      {rows.map((r, i) => (
        <div key={i}>
          <input
            value={r.name}
            onChange={(e) => updateRow(i, 'name', e.target.value)}
            placeholder="Name"
          />
          <input
            type="number"
            min="0"
            step="any"
            value={r.quantity}
            onChange={(e) => updateRow(i, 'quantity', e.target.value)}
            placeholder="Quantity"
          />
          <select
            value={r.unit}
            onChange={(e) => updateRow(i, 'unit', e.target.value)}
          >
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <button type="button" onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addRow}>Add ingredient</button>
      <textarea
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        placeholder="Steps"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, separated by commas"
      />
      {error && <p role="alert">{error}</p>}
      <button>Save</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}