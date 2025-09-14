'use client';
import { useState } from 'react';

export default function PasswordModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (pass: string) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const [value, setValue] = useState('');

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-lg text-blue-800 font-semibold mb-3">議題パスワード</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="パスワードを入力"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          {/* エラー表示 */}
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-rose-300 text-white hover:bg-rose-400 disabled:opacity-60 mr-[10px]"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={loading || value.trim() === ''}
            >
              {loading ? '確認中…' : 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
