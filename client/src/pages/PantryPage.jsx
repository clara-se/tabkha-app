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
    <li>
      {item.name}{' '}
      <input
        type="number"
        min="0"
        step="any"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />{' '}
      <select value={unit} onChange={(e) => setUnit(e.target.value)}>
        {UNITS.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>{' '}
      <button onClick={save}>Update</button>
      <button onClick={remove}>Delete</button>
      {error && <span role="alert"> {error}</span>}
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

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;

  return (
    <main>
      <h1>My pantry</h1>
      <form onSubmit={addItem}>
        <input name="name" placeholder="Item" required />
        <input name="quantity" type="number" min="0" step="any"
          placeholder="Quantity" required />
        <select name="unit">
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <button>Add</button>
      </form>
      {formError && <p role="alert">{formError}</p>}
      {items.length === 0 && <p>Your pantry is empty.</p>}
      <ul>
        {items.map((item) => (
          <PantryRow key={item._id} item={item} onChange={reload} />
        ))}
      </ul>
    </main>
  );
}