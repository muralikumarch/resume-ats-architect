import { CheckCircle2 } from 'lucide-react';

interface ToastProps { message: string }

export default function Toast({ message }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
