import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiFetch } from '../api/client.js';
import RecipeForm from '../components/RecipeForm.jsx';
import CookCheck from '../components/CookCheck.jsx';

export default function RecipesPage() {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const path =
    '/api/recipes' + (query ? `?search=${encodeURIComponent(query)}` : '');
  const { data: recipes, loading, error, reload } = useApi(path);

  async function addRecipe(body) {
    await apiFetch('/api/recipes', {
      method: 'POST', body: JSON.stringify(body),
    });
    setAdding(false);
    reload();
  }
  async function saveRecipe(id, body) {
    await apiFetch(`/api/recipes/${id}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    setEditingId(null);
    reload();
  }
  async function deleteRecipe(id) {
    await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' });
    reload();
  }
  function handleSearch(e) {
    e.preventDefault();
    setQuery(new FormData(e.target).get('search').trim());
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;

  return (
    <main>
      <h1>My recipes</h1>
      <form onSubmit={handleSearch}>
        <input name="search" placeholder="Search by title" />
        <button>Search</button>
      </form>

      {adding ? (
        <RecipeForm onSubmit={addRecipe} onCancel={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)}>Add recipe</button>
      )}

      {recipes.length === 0 && <p>No recipes yet.</p>}
      <ul>
        {recipes.map((r) => (
          <li key={r._id}>
            {editingId === r._id ? (
              <RecipeForm
                initial={r}
                onSubmit={(body) => saveRecipe(r._id, body)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <h2>{r.title}</h2>
                <ul>
                  {r.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.name}: {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
                {r.steps && <p>{r.steps}</p>}
                {r.tags.length > 0 && <p>Tags: {r.tags.join(', ')}</p>}
                <CookCheck recipeId={r._id} />
                <button onClick={() => setEditingId(r._id)}>Edit</button>
                <button onClick={() => deleteRecipe(r._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}