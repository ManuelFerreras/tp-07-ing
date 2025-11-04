"use client";

import { useState, FormEvent, useEffect } from 'react';

type Props = Readonly<{
  initialName?: string;
  onSubmit: (name: string) => Promise<void> | void;
  submitLabel?: string;
  error?: string | null;
}>;

export default function EmployeeForm({ initialName, onSubmit, submitLabel, error }: Readonly<Props>) {
  const [name, setName] = useState<string>(initialName || '');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialName || '');
  }, [initialName]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError('Name is required');
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setName('');
    } catch (err: any) {
      setLocalError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="employee-form">
      <input
        aria-label="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <button type="submit" disabled={loading}>
        {submitLabel || 'Save'}
      </button>
      {(localError || error) && (
        <div role="alert" style={{ color: 'red' }}>
          {localError || error}
        </div>
      )}
    </form>
  );
}


