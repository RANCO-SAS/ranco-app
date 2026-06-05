import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { offerService } from '@/features/offers/services/offer.service';
import type {
  CounterOfferInput,
  CreateOfferInput,
  OfferActionInput,
} from '@/features/offers/types/offer';
import { queryKeys } from '@/lib/query-keys';

export function useConversationOffers(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offers.byConversation(conversationId ?? 'unknown'),
    queryFn: () => offerService.getConversationOffers(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 15_000,
  });
}

export function usePendingOffer(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offers.pending(conversationId ?? 'unknown'),
    queryFn: () => offerService.getPendingOffer(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 10_000,
  });
}

function invalidateOfferQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.offers.byConversation(conversationId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.offers.pending(conversationId),
  });
  void queryClient.invalidateQueries({
    queryKey: [...queryKeys.messages.thread(conversationId), 'messages'],
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOfferInput) => offerService.createOffer(input),
    onSuccess: (_offerId, input) => {
      invalidateOfferQueries(queryClient, input.conversationId);
    },
  });
}

export function useCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CounterOfferInput & { conversationId: string }) =>
      offerService.counterOffer(input),
    onSuccess: (_offerId, input) => {
      invalidateOfferQueries(queryClient, input.conversationId);
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OfferActionInput & { conversationId: string }) =>
      offerService.acceptOffer(input),
    onSuccess: (_result, input) => {
      invalidateOfferQueries(queryClient, input.conversationId);
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OfferActionInput & { conversationId: string }) =>
      offerService.withdrawOffer(input),
    onSuccess: (_result, input) => {
      invalidateOfferQueries(queryClient, input.conversationId);
    },
  });
}

export function useDeclineOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OfferActionInput & { conversationId: string }) =>
      offerService.declineOffer(input),
    onSuccess: (_result, input) => {
      invalidateOfferQueries(queryClient, input.conversationId);
    },
  });
}
