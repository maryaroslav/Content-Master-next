export interface FormError {
    message: string;
    field?: PropertyKey;
}

export function firstIssue(issues: readonly { path: readonly PropertyKey[]; message: string }[]): FormError {
    const [issue] = issues;
    return { message: issue?.message ?? 'Please check the form', field: issue?.path[0] };
}
