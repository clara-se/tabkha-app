import { useState } from 'react';
import { UNITS } from '../units.js';

const emptyRow = { name: '', quantity: '', unit: 'g' };

export default function RecipeForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
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
      imageUrl: imageUrl.trim(),
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
    <form className="stack" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Recipe title"
        maxLength={120}
        required
      />
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Picture link (optional, starts with https://)"
        aria-label="Picture link"
      />
      <h3>Ingredients</h3>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <input
            value={r.name}
            onChange={(e) => updateRow(i, 'name', e.target.value)}
            placeholder="Name"
            aria-label="Ingredient name"
          />
          <input
            type="number"
            min="0"
            step="any"
            value={r.quantity}
            onChange={(e) => updateRow(i, 'quantity', e.target.value)}
            placeholder="Quantity"
            aria-label="Ingredient quantity"
          />
          <select
            value={r.unit}
            onChange={(e) => updateRow(i, 'unit', e.target.value)}
            aria-label="Ingredient unit"
          >
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <button type="button" onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}
      <div>
        <button type="button" onClick={addRow}>Add ingredient</button>
      </div>
      <textarea
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        placeholder="Steps"
        aria-label="Steps"
        rows={4}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, separated by commas"
        aria-label="Tags"
      />
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button>Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}