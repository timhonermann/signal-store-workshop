import {patchState, signalStoreFeature, withComputed, withMethods, withState} from "@ngrx/signals";
import {computed} from "@angular/core";

export type RequestStatus = 'idle' | 'pending' | 'completed' | { error: string };

export type RequestStatusState = { requestStatus: RequestStatus };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isCompleted: computed(() => requestStatus() === 'completed'),
      error: computed(() => {
        const status = requestStatus();

        return typeof status === 'object' ? status.error : null
      })
    })),
    withMethods((state) => ({
      setRequestStatusPending: (): void => patchState(state,{ requestStatus: 'pending' }),
      setRequestStatusCompleted: (): void => patchState(state, { requestStatus: 'completed' }),
      setRequestStatusError: (error: string): void => patchState(state,{ requestStatus: { error } }),
    }))
  )
}
