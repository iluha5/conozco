import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { ActiveWordGroup, AvailableWordGroup } from '@/types/word-groups';

export function useActiveWordGroups(enabled: boolean = true) {
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';

    return useQuery<ActiveWordGroup[]>({
        queryKey: ['activeWordGroups'],
        queryFn: async () => {
            const res = await fetch('/api/user/word-groups/active');
            if (!res.ok) throw new Error('Failed to fetch active groups');
            return res.json();
        },
        enabled: enabled && isAuthenticated,
    });
}

export function useAvailableWordGroups(enabled: boolean = true) {
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';

    return useQuery<AvailableWordGroup[]>({
        queryKey: ['availableWordGroups'],
        queryFn: async () => {
            const res = await fetch('/api/user/word-groups/available');
            if (!res.ok) throw new Error('Failed to fetch available groups');
            return res.json();
        },
        enabled: enabled && isAuthenticated,
    });
}

export function useActivateWordGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId: number) => {
            const res = await fetch(
                `/api/user/word-groups/${groupId}/activate`,
                {
                    method: 'POST',
                },
            );
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to activate group');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeWordGroups'] });
            queryClient.invalidateQueries({
                queryKey: ['availableWordGroups'],
            });
        },
    });
}

export function useDeactivateWordGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId: number) => {
            const res = await fetch(
                `/api/user/word-groups/${groupId}/deactivate`,
                {
                    method: 'DELETE',
                },
            );
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to deactivate group');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeWordGroups'] });
            queryClient.invalidateQueries({
                queryKey: ['availableWordGroups'],
            });
        },
    });
}
