export function LSPButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      onClick={onClick}
    >
      {title}
    </button>
  )
}
