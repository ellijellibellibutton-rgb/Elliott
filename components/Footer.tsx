export default function Footer({ committeeName }: { committeeName: string }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} {committeeName}</span>
        <span>Built for a competitive, energetic Corporate Giving campaign.</span>
      </div>
    </footer>
  );
}
