import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useBoardStore } from '../store/board';
import type { TaskFormData } from '../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  desc: z.string().max(400).optional(),
  priority: z.string().min(1, 'Priority is required'),
  category: z.string().min(1, 'Category is required'),
  col: z.string().min(1, 'Status is required'),
  due: z.string().optional(),
});

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  defaultValues?: Partial<TaskFormData>;
  mode: 'create' | 'edit';
}

export function TaskModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  mode,
}: TaskModalProps) {
  const { columns, categories, priorities } = useBoardStore();

  const firstColId = columns[0]?.id ?? 'planning';
  const firstPriId = priorities[0]?.id ?? 'med';
  const firstCatId = categories[0]?.id ?? 'Work';

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      desc: '',
      priority: firstPriId,
      category: firstCatId,
      col: defaultValues?.col ?? firstColId,
      due: '',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: '',
      desc: '',
      priority: firstPriId,
      category: firstCatId,
      col: defaultValues?.col ?? firstColId,
      due: '',
      ...defaultValues,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, open]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    form.reset();
    onClose();
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[640px] bg-slate-50 text-popover-foreground dark:bg-card dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">
            {mode === 'edit' ? 'Edit task' : 'New task'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-slate-50 dark:bg-card dark:text-white">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      {...field}
                      autoFocus
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes…"
                      className="min-h-24 resize-none text-base"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue className="text-foreground dark:text-white" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue className="text-foreground dark:text-white" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span
                              className="mr-1.5 inline-block h-2 w-2 rounded-full"
                              style={{ background: c.color }}
                            />
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Column / Status */}
              <FormField
                control={form.control}
                name="col"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue className="text-foreground dark:text-white" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            <span
                              className="mr-1.5 inline-block h-2 w-2 rounded-full"
                              style={{ background: col.color }}
                            />
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due date */}
              <FormField
                control={form.control}
                name="due"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground dark:text-white">Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Save changes' : 'Create task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
