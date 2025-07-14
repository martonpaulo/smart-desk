'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDashboardViewState } from '@/hooks/useDashboardViewState';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';
import { useAudioStore } from '@/store/audioStore';
import { useEventStore } from '@/store/eventStore';
import { HomeView } from '@/views/HomeView';

export default function Home() {
  const dashboardViewState = useDashboardViewState();

  const { latitude, longitude } = useLocation();
  const {
    data: weather,
    isLoading: weatherIsLoading,
    isError: weatherIsError,
    error: weatherError,
  } = useWeather(latitude, longitude);

  const setAlertAcknowledged = useEventStore(state => state.setAlertAcknowledged);
  const audioEnabled = useAudioStore(state => state.audioEnabled);
  const toggleAudioEnabled = useAudioStore(state => state.toggleAudioEnabled);
  const isFirstRender = useAudioStore(state => state.isFirstRender);
  const isMeetingAlertEnabled = useAudioStore(state => state.meetingAlertEnabled);
  const toggleMeetingAlertEnabled = useAudioStore(state => state.toggleMeetingAlertEnabled);
  const isEventChangesAlertEnabled = useAudioStore(state => state.eventChangesAlertEnabled);
  const toggleEventChangesAlertEnabled = useAudioStore(
    state => state.toggleEventChangesAlertEnabled,
  );

  return (
    <ErrorBoundary>
      <HomeView
        dashboardViewState={dashboardViewState}
        onAlertAcknowledge={setAlertAcknowledged}
        audioEnabled={audioEnabled}
        toggleAudioEnabled={toggleAudioEnabled}
        isFirstRender={isFirstRender}
        isMeetingAlertEnabled={isMeetingAlertEnabled}
        onMeetingAlertToggle={toggleMeetingAlertEnabled}
        isEventChangesAlertEnabled={isEventChangesAlertEnabled}
        onEventChangesAlertToggle={toggleEventChangesAlertEnabled}
        weather={weather}
        weatherIsLoading={weatherIsLoading}
        weatherIsError={weatherIsError}
        weatherError={weatherError}
      />
    </ErrorBoundary>
  );
}
