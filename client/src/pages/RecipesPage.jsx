import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiFetch } from '../api/client.js';
import RecipeForm from '../components/RecipeForm.jsx';
import CookCheck from '../components/CookCheck.jsx';

function RecipeImage({ url, title, eager }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="recipe-img placeholder" aria-hidden="true">
        <span lang="ar">طبخة</span>
      </div>
    );
  }
  return (
    <img
      className="recipe-img"
      src={url}
      alt={`Photo of ${title}`}
      width="400"
      height="200"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  );
}

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

  if (loading) return <main><p>Loading…</p></main>;
  if (error) return <main><p role="alert">{error.message}</p></main>;

  return (
    <main>
      <div className="page-head">
        <h1>My recipes</h1>
        {!adding && (
          <button className="primary" onClick={() => setAdding(true)}>
            Add recipe
          </button>
        )}
      </div>

      <form className="inline-form" onSubmit={handleSearch}>
        <input name="search" placeholder="Search by title"
          aria-label="Search recipes" />
        <button>Search</button>
      </form>

      {adding && (
        <div className="card new-recipe">
          <h2>New recipe</h2>
          <RecipeForm onSubmit={addRecipe} onCancel={() => setAdding(false)} />
        </div>
      )}

      {recipes.length === 0 && <p className="empty">No recipes yet.</p>}
      <ul className="cards">
        {recipes.map((r, idx) => (
          <li
            key={r._id}
            className={editingId === r._id ? 'card editing' : 'card'}
          >
            {editingId === r._id ? (
              <RecipeForm
                initial={r}
                onSubmit={(body) => saveRecipe(r._id, body)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <RecipeImage url={r.imageUrl} title={r.title} eager={idx < 3} />
                <h2>{r.title}</h2>
                <ul className="ingredients">
                  {r.ingredients.map((ing, i) => (
                    <li key={i}>
                      <span>{ing.name}</span>
                      <span className="qty">{ing.quantity} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
                {r.steps && <p className="steps">{r.steps}</p>}
                {r.tags.length > 0 && (
                  <ul className="tags">
                    {r.tags.map((t, i) => (
                      <li key={i} className="tag">{t}</li>
                    ))}
                  </ul>
                )}
                <CookCheck recipeId={r._id} />
                <div className="actions">
                  <button onClick={() => setEditingId(r._id)}>Edit</button>
                  <button className="danger"
                    onClick={() => deleteRecipe(r._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}