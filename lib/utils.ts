// A simplified utility for combining class names, inspired by clsx and tailwind-merge.
// NOTE: This does not handle merging conflicting Tailwind CSS classes perfectly
// but is sufficient for the component variants in this project.
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs
    .flat()
    .filter(x => typeof x === 'string')
    .join(' ');
}
