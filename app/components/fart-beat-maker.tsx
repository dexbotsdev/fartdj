'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Tone from 'tone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Play, Square, Trash2 } from 'lucide-react'

interface Track {
  name: string
  icon: string
  pattern: boolean[]
  color: string
}

export default function Component() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tempo, setTempo] = useState(120)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [tracks, setTracks] = useState<Track[]>([
    { name: 'Kick', icon: '💨', pattern: new Array(8).fill(false), color: 'from-purple-400 to-purple-600' },
    { name: 'Snare', icon: '💩', pattern: new Array(8).fill(false), color: 'from-yellow-400 to-yellow-600' },
    { name: 'Quick Fart', icon: '🌬️', pattern: new Array(8).fill(false), color: 'from-green-400 to-green-600' },
    { name: 'Wet Fart', icon: '💦', pattern: new Array(8).fill(false), color: 'from-blue-400 to-blue-600' },
    { name: 'Rumble Fart', icon: '🌋', pattern: new Array(8).fill(false), color: 'from-red-400 to-red-600' }
  ])

  const synthsRef = useRef<{ [key: string]: any }>({})

  useEffect(() => {
    synthsRef.current = {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).toDestination(),
      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
      }).toDestination(),
      quickFart: new Tone.FMSynth({
        modulationIndex: 12.22,
        envelope: { attack: 0.01, decay: 0.2 },
        modulation: { type: 'sawtooth' },
        modulationEnvelope: { attack: 0.005, decay: 0.01 }
      }).toDestination(),
      wetFart: new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
      }).toDestination(),
      rumbleFart: new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.2 }
      }).toDestination()
    }

    return () => {
      Object.values(synthsRef.current).forEach(synth => synth.dispose())
    }
  }, [])

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setTracks(prevTracks => 
      prevTracks.map((track, index) => 
        index === trackIndex
          ? { ...track, pattern: track.pattern.map((step, i) => i === stepIndex ? !step : step) }
          : track
      )
    )
  }

  const clearPatterns = () => {
    setTracks(prevTracks => 
      prevTracks.map(track => ({ ...track, pattern: new Array(8).fill(false) }))
    )
    setCurrentStep(0)
  }

  const sequence = useCallback(() => {
    const step = currentStep % 8
    
    if (isPlaying) {
      tracks.forEach((track, index) => {
        if (track.pattern[step]) {
          switch (index) {
            case 0:
              synthsRef.current.kick?.triggerAttackRelease('C1', '8n')
              break
            case 1:
              synthsRef.current.snare?.triggerAttackRelease('8n')
              break
            case 2:
              synthsRef.current.quickFart?.triggerAttackRelease('C3', '8n')
              break
            case 3:
              synthsRef.current.wetFart?.triggerAttackRelease('G2', '8n')
              break
            case 4:
              synthsRef.current.rumbleFart?.triggerAttackRelease('8n')
              break
          }
        }
      })
    }

    setCurrentStep((prevStep) => (prevStep + 1) % 8)
  }, [currentStep, tracks, isPlaying])

  const togglePlay = async () => {
    await Tone.start()
    setIsPlaying(prev => !prev)
    if (!isPlaying) {
      setCurrentStep(0)
    }
  }

  useEffect(() => {
    const interval = (60 / tempo) * 1000 / 2 // Sixteenth notes

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(sequence, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sequence, tempo])

  const handleTempoChange = (value: number[]) => {
    setTempo(value[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 to-green-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto p-6 bg-brown-100 rounded-3xl border-4 border-yellow-600">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <span className="text-5xl">💨</span>
            Fart Beat Maker 3000
            <span className="text-5xl">💨</span>
          </h1>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isPlaying ? <Square className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          <Button 
            onClick={clearPatterns} 
            variant="destructive" 
            className="w-16 h-16 rounded-full flex items-center justify-center"
          >
            <Trash2 className="w-8 h-8" />
          </Button>
        </div>

        <div className="space-y-6 mb-8">
          {tracks.map((track, trackIndex) => (
            <div key={track.name} className="flex items-center gap-4">
              <div className="w-40 flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-white rounded-lg bg-green-800">
                  <span className="text-2xl">{track.icon}</span>
                </div>
                <span className="font-bold text-lg text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {track.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {track.pattern.map((isActive, stepIndex) => (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(trackIndex, stepIndex)}
                    className={`w-14 h-16 clip-hexagon transition-all ${
                      isActive ? `bg-gradient-to-br ${track.color} shadow-lg` : 'bg-gray-300'
                    } ${currentStep === stepIndex && isPlaying ? 'border-4 border-white' : ''}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 bg-green-800 p-4 rounded-xl">
          <span className="text-white font-bold">Tempo:</span>
          <Slider
            min={60}
            max={240}
            step={1}
            value={[tempo]}
            onValueChange={handleTempoChange}
            className="w-64 h-2"
          />
          <span className="text-white font-bold">{tempo} BPM</span>
        </div>
      </Card>
    </div>
  )
}