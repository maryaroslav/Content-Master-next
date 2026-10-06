import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type Resolver, type UseFormProps } from 'react-hook-form';
import type { z } from 'zod';

export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
    schema: TSchema,
    options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'>,
) {
    const resolver = zodResolver(schema) as unknown as Resolver<z.input<TSchema>, unknown, z.output<TSchema>>;
    return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({ ...options, resolver });
}
