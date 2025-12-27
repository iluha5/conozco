export const namespaces = ['glob'] as const;

export type NameSpaces = (typeof namespaces)[number];
