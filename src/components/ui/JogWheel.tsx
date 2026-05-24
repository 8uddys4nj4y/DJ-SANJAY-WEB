
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const TRACKS = [
  { id: 1, url: "/music/track1.mp3", bpm: 128 },
  { id: 2, url: "/music/track2.mp3", bpm: 124 },
  { id: 3, url: "/music/track3.mp3", bpm: 130 },
];

export function JogWheel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rotationControls = useAnimation();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = TRACKS[trackIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [trackIndex]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrack.bpm]);

  const handleToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextStart = () => {
    longPressTimer.current = setTimeout(() => {
      setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    }, 800);
  };

  const handleNextEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform overflow-hidden shadow-2xl">
        
        {/* Background BPM (Behind the wheel) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
          <span className="text-[12px] font-black text-primary leading-none">{currentTrack.bpm}</span>
          <span className="text-[6px] text-zinc-500 uppercase font-bold tracking-tighter">BPM</span>
        </div>

        {/* Rotating Disc Image (Above the text) */}
        <motion.div
          onMouseDown={handleNextStart}
          onMouseUp={handleNextEnd}
          onTouchStart={handleNextStart}
          onTouchEnd={handleNextEnd}
          onClick={handleToggle}
          className="absolute inset-0 z-10 animate-spin-slow"
        >
          <img src="/jog_wheel/jog_wheel_disk-removebg.png" alt="Jog Wheel" className="w-full h-full object-cover" />
        </motion.div>

        {isPlaying && (
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse z-20 shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
        )}
      </div>
    </div>
  );
}
