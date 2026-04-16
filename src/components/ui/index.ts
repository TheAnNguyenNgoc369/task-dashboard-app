/**
 * components/ui/index.tsx
 *
 * Thin re-export barrel for shadcn/ui components.
 *
 * Run the shadcn CLI to add each component to your project:
 *
 *   npx shadcn@latest init
 *   npx shadcn@latest add button input textarea select dialog form label
 *
 * The CLI writes the source into src/components/ui/ — these are
 * YOUR files to own and customise, not a black-box library.
 *
 * Below are minimal stubs so TypeScript resolves imports before you run
 * the CLI. Replace them by running the commands above.
 */

export { Button }    from './button';
export { Input }     from './input';
export { Textarea }  from './textarea';
export {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
}                    from './select';
export {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
}                    from './dialog';
export {
  Form, FormField, FormItem,
  FormLabel, FormControl, FormMessage,
}                    from './form';
