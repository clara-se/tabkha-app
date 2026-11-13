import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiFetch } from '../api/client.js';
import { UNITS } from '../units.js';

function PantryRow({ item, onChange }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit);
  const [error, setError] = useState('');

  async function save() {
    try {
      await apiFetch(`/api/pantry/${item._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: Number(quantity), unit }),
      });
      setError('');
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }
  async function remove() {
    await apiFetch(`/api/pantry/${item._id}`, { method: 'DELETE' });
    onChange();
  }

  return (
    <li className="card pantry-row">
      <strong className="pantry-name">{item.name}</strong>
      <input
        type="number"
        min="0"
        step="any"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        aria-label={`Quantity of ${item.name}`}
      />
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        aria-label={`Unit of ${item.name}`}
      >
        {UNITS.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>
      <button onClick={save}>Update</button>
      <button className="danger" onClick={remove}>Delete</button>
      {error && <span role="alert">{error}</span>}
    </li>
  );
}

export default function PantryPage() {
  const { data: items, loading, error, reload } = useApi('/api/pantry');
  const [formError, setFormError] = useState('');

  async function addItem(e) {
    e.preventDefault();
    const formEl = e.target;
    const f = new FormData(formEl);
    try {
      await apiFetch('/api/pantry', {
        method: 'POST',
        body: JSON.stringify({
          name: f.get('name'),
          quantity: Number(f.get('quantity')),
          unit: f.get('unit'),
        }),
      });
      formEl.reset();
      setFormError('');
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  }

  if (loading) return <main><p>Loading…</p></main>;
  if (error) return <main><p role="alert">{error.message}</p></main>;

  return (
    <main>
      <div className="page-head">
        <h1>My pantry</h1>
      </div>
      <form className="inline-form card" onSubmit={addItem}>
        <input name="name" placeholder="Item" aria-label="Item name" required />
        <input name="quantity" type="number" min="0" step="any"
          placeholder="Quantity" aria-label="Quantity" required />
        <select name="unit" aria-label="Unit">
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <button>Add</button>
      </form>
      {formError && <p role="alert">{formError}</p>}
      {items.length === 0 && <p className="empty">Your pantry is empty.</p>}
      <ul className="cards list">
        {items.map((item) => (
          <PantryRow key={item._id} item={item} onChange={reload} />
        ))}
      </ul>
    </main>
  );
}