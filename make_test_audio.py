# make_test_audio.py
# Generates simple WAV test files: swap.wav, match.wav, ambient.wav

import wave, struct, math, os

os.makedirs('assets/audio', exist_ok=True)

def make_sine(path, freq=440.0, duration=0.18, amp=0.5, rate=44100):
    nframes = int(duration * rate)
    wav = wave.open(path, 'w')
    nchannels = 1; sampwidth = 2
    wav.setparams((nchannels, sampwidth, rate, nframes, 'NONE', 'not compressed'))
    for i in range(nframes):
        t = float(i)/rate
        val = int(32767 * amp * math.sin(2*math.pi*freq*t))
        wav.writeframes(struct.pack('<h', val))
    wav.close()

# short swap / match effects
make_sine('assets/audio/swap.wav', freq=880.0, duration=0.08, amp=0.25)
make_sine('assets/audio/match.wav', freq=440.0, duration=0.18, amp=0.28)

# ambient: longer, low frequency pad (loopable-ish)
make_sine('assets/audio/ambient.wav', freq=110.0, duration=8.0, amp=0.12)
print('Created assets/audio/swap.wav, match.wav, ambient.wav')
