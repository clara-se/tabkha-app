import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import RecipeForm from './RecipeForm.jsx';

it('shows the title field and a save button', () => {
  render(<RecipeForm onSubmit={() => {}} />);
  expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
});

it('calls onSubmit with the typed title', async () => {
  const onSubmit = vi.fn();
  render(<RecipeForm onSubmit={onSubmit} />);
  await userEvent.type(screen.getByPlaceholderText('Title'), 'Soup');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(onSubmit).toHaveBeenCalledWith({
    title: 'Soup',
    imageUrl: '',
    steps: '',
    tags: [],
    ingredients: [],
  });
});