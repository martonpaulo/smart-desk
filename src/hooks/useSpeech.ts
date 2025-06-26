import { useCallback, useEffect, useRef, useState } from 'react';

import { ISpeechStatus } from '@/types/ISpeechStatus';

export function useSpeech(text: string) {
  const [speechStatus, setSpeechStatus] = useState(ISpeechStatus.IDLE);
  const prevText = useRef(text);

  const autoPlay = false;
  const voiceName = undefined;

  const start = useCallback(() => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);

    if (voiceName) {
      const v = window.speechSynthesis.getVoices().find(voice => voice.name === voiceName);
      if (v) utter.voice = v;
    }

    setSpeechStatus(ISpeechStatus.QUEUED);
    utter.onstart = () => setSpeechStatus(ISpeechStatus.STARTED);
    utter.onend = () => setSpeechStatus(ISpeechStatus.ENDED);
    utter.onerror = () => setSpeechStatus(ISpeechStatus.ERROR);
    window.speechSynthesis.speak(utter);
  }, [text, voiceName]);

  useEffect(() => {
    // autoPlay kicks in when text changes
    if (autoPlay && text !== prevText.current) {
      prevText.current = text;
      start();
    }
  }, [text, autoPlay, start]);

  const isInQueue = speechStatus === 'queued' || speechStatus === 'started';

  return { startSpeech: start, speechStatus, isInQueue };
}
