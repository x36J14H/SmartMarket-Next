import { Loader2, Save } from 'lucide-react';

interface FormActionsProps {
  loading?: boolean;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  loading = false,
  onCancel,
  saveLabel = 'Сохранить',
  cancelLabel = 'Отмена',
}: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-700 disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl px-6 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
