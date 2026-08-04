import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  createOvertimeRecord,
  deleteOvertimeRecord,
  finalizeOvertimeRecord,
  listOvertimeRecords,
  updateOvertimeRecord,
} from './overtime.functions'

export const overtimeKeys = {
  all: ['overtime'] as const,
  lists: () => [...overtimeKeys.all, 'list'] as const,
}

export const overtimeListQueryOptions = () =>
  queryOptions({
    queryKey: overtimeKeys.lists(),
    queryFn: () => listOvertimeRecords(),
  })

export function useOvertimeRecords() {
  return useSuspenseQuery(overtimeListQueryOptions())
}

type CreateOvertimeInput = {
  workDate: string
  startTime: string
  endTime?: string
}

export function useCreateOvertimeRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOvertimeInput) => createOvertimeRecord({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: overtimeKeys.lists() })
    },
  })
}

type FinalizeOvertimeInput = {
  id: string
  endTime: string
}

export function useFinalizeOvertimeRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FinalizeOvertimeInput) =>
      finalizeOvertimeRecord({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: overtimeKeys.lists() })
    },
  })
}

type UpdateOvertimeInput = {
  id: string
  workDate: string
  startTime: string
  endTime?: string
}

export function useUpdateOvertimeRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOvertimeInput) => updateOvertimeRecord({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: overtimeKeys.lists() })
    },
  })
}

type DeleteOvertimeInput = {
  id: string
}

export function useDeleteOvertimeRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteOvertimeInput) => deleteOvertimeRecord({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: overtimeKeys.lists() })
    },
  })
}
