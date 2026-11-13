import { useState } from 'react';
import { apiFetch } from '../api/client.js';

function describe(i) {
  if (i.status === 'enough') return `you have ${i.have} ${i.unit}`;
  if (i.status === 'not enough') return `you only have ${i.have} ${i.unit}`;
  if (i.status === 'missing') return 'not in your pantry';
  return `check units, your pantry has ${i.pantry.join(', ')}`;
}

export default function CookCheck({ recipeId }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    setError('');
    try {
      setResult(await apiFetch(`/api/recipes/${recipeId}/cook`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cook">
      <button className="primary" onClick={check} disabled={loading}>
        {loading ? 'Checking…' : 'Can I cook this?'}
      </button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <>
          <p className={result.canCook ? 'ok' : 'no'}>
            <strong>
              {result.canCook ? 'Yes, you have everything!' : 'Not yet.'}
            </strong>
          </p>
          <ul className="cook-list">
            {result.ingredients.map((i, idx) => (
              <li key={idx} className={i.status === 'enough' ? 'ok' : 'no'}>
                {i.name}: need {i.needed} {i.unit}, {describe(i)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}