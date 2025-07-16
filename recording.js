// recording.js
// Handles recording button state transitions and circle animations

document.addEventListener('DOMContentLoaded', () => {
  console.log('recording.js loaded');

  // Select DOM elements
  const recordingTabs = document.querySelectorAll('.inputTab-content.recording, .inputTab-content.recording2');
  const recordStates   = document.querySelectorAll('.record-state');
  const recordTimers   = document.querySelectorAll('.record-timer');
  const innerCircles   = document.querySelectorAll('.inner-shape');

  // State variables
  let state        = 'idle';      // idle | recording | analyzing
  let startTime    = null;        // Date.now() when recording starts
  let timerInterval = null;       // setInterval reference
  let dotInterval   = null;      // interval for dots in recording phase

  // === Microphone monitoring variables ===
  let audioCtx = null;
  let analyser = null;
  let micSource = null;
  let volumeRAF = null;

  // === Speech recognition variables ===
  let recognition = null;
  let finalTranscript = '';
  let isRecognitionActive = false;
  let lastResultIndex = 0;

  // === Waveform visualizer ===
  const waveVisualizer = new WaveformVisualizer();

  // === Audio-reactive brightness variables ===
  let currentBrightness = 1.0; // Base brightness
  const brightnessSmoothing = 0.3; // How quickly brightness changes (0-1)
  const maxBrightnessBoost = 0.8; // Maximum additional brightness (80% boost)

  function startMic() {
    if (audioCtx) return; // already running
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      micSource = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      micSource.connect(analyser);

      // Ensure visual elements exist with up-to-date dimensions
      if (waveVisualizer && !waveVisualizer.container && typeof waveVisualizer.createVisualElements==='function') {
        waveVisualizer.createVisualElements();
      }

      // Start visualizer after audio context is set up
      if (waveVisualizer && typeof waveVisualizer.start === 'function') {
        console.log('Starting waveform visualizer with stream:', stream);
        waveVisualizer.start(stream);
      } else {
        console.error('Waveform visualizer not available:', waveVisualizer);
      }

      const data = new Uint8Array(analyser.fftSize);

      // Prepare circle arrays for staggered response
      const circles = Array.from(document.querySelectorAll('.circle-outer'));
      const currentScales = circles.map(() => 1); // start at default scale
      // higher index → slightly slower smoothing (creates delay)
      const smoothFactors = circles.map((_, idx) => 0.35 - idx * 0.05).map(f => Math.max(0.12, f));

      function volLoop() {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128; // -1..1
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length); // 0..1
        const targetScale = 1 + rms * 3; // amplify effect

        circles.forEach((c, idx) => {
          // linear interpolation toward target to create trailing delay
          currentScales[idx] += (targetScale - currentScales[idx]) * smoothFactors[idx];
          c.style.transform = `scale(${currentScales[idx]})`;
        });

        // Apply audio-reactive brightness effect to art canvas
        applyAudioReactiveBrightness(rms);

        volumeRAF = requestAnimationFrame(volLoop);
      }
      volLoop();

      // Start speech recognition
      startSpeechRecognition();
    }).catch(err => {
      console.error('Mic error', err);
    });
  }

  function startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (isRecognitionActive) return;

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    finalTranscript = '';
    isRecognitionActive = true;
    lastResultIndex = 0;

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      let interimTranscript = '';

      // Only process results starting from lastResultIndex to avoid duplicates
      for (let i = lastResultIndex; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += processTranscript(transcript);
          lastResultIndex = i + 1; // Update index to avoid reprocessing this result
        } else {
          interimTranscript = transcript;
        }
      }

      // Update message textarea with transcribed text
      const messageTextareas = document.querySelectorAll('.message-textarea');
      messageTextareas.forEach(textarea => {
        textarea.value = finalTranscript + interimTranscript;
      });

      // Trigger resize to handle line breaking
      if (window.resizeMessageTab) {
        window.resizeMessageTab();
      }

      // Check instructions visibility when transcribed text changes
      if (window.checkInstructionsVisibility) {
        window.checkInstructionsVisibility();
      }
    };

    recognition.onend = () => {
      if (isRecognitionActive && state === 'recording') {
        lastResultIndex = 0; // Reset index when restarting recognition
        recognition.start(); // Restart if still recording
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }

  function stopSpeechRecognition() {
    if (recognition && isRecognitionActive) {
      isRecognitionActive = false;
      recognition.stop();
    }
  }

  function processTranscript(transcript) {
    // Common commands for punctuation (same logic as voiceRecorder.js)
    const punctuationCommands = {
      'period': '.',
      'full stop': '.',
      'comma': ',',
      'question mark': '?',
      'exclamation mark': '!',
      'exclamation point': '!',
      'new line': '\n',
      'new paragraph': '\n\n'
    };

    let processedText = transcript;

    // Replace punctuation commands with actual punctuation
    for (const [command, punctuation] of Object.entries(punctuationCommands)) {
      const regex = new RegExp(`\\b${command}\\b`, 'gi');
      processedText = processedText.replace(regex, punctuation);
    }

    // Add spaces after punctuation if missing
    processedText = processedText.replace(/([.!?,])(\w)/g, '$1 $2');

    // Capitalize first letter of sentences
    processedText = processedText.replace(/(^\w|\.\s+\w|\?\s+\w|\!\s+\w)/g, 
      letter => letter.toUpperCase());

    // Add question marks for questions
    if (processedText.toLowerCase().startsWith('who') || 
        processedText.toLowerCase().startsWith('what') ||
        processedText.toLowerCase().startsWith('where') ||
        processedText.toLowerCase().startsWith('when') ||
        processedText.toLowerCase().startsWith('why') ||
        processedText.toLowerCase().startsWith('how')) {
      if (!processedText.endsWith('?')) {
        processedText = processedText.replace(/[.!]$/, '?');
        if (!processedText.endsWith('?')) {
          processedText += '?';
        }
      }
    }

    return processedText;
  }

  function stopMic() {
    if (volumeRAF) {
      cancelAnimationFrame(volumeRAF);
      volumeRAF = null;
    }
    // Stop visualizer
    if (waveVisualizer && typeof waveVisualizer.stop === 'function') {
      console.log('Stopping waveform visualizer');
      waveVisualizer.stop();
    }
    if (micSource && micSource.mediaStream) {
      micSource.mediaStream.getTracks().forEach(t => t.stop());
    }
    if (audioCtx) {
      audioCtx.close();
    }
    audioCtx = analyser = micSource = null;
    
    // Stop speech recognition
    stopSpeechRecognition();
    
    // Reset audio-reactive brightness effects
    resetAudioReactiveBrightness();
    
    // reset any inline transform so CSS takes over
    document.querySelectorAll('.circle-outer').forEach(c => (c.style.transform = ''));
  }

  // Helper: format seconds as M:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Apply audio-reactive brightness effect using the brightness overlay
  function applyAudioReactiveBrightness(rms) {
    const brightnessOverlay = document.getElementById('brightnessOverlay');
    
    if (!brightnessOverlay) return;

    // Switch to audio-reactive mode (disable loop animation)
    brightnessOverlay.classList.remove('pulse-loop');
    brightnessOverlay.classList.add('audio-reactive');

    // Calculate target opacity based on audio level
    // Base opacity (0.2) + variable boost based on RMS
    const targetOpacity = 0.2 + (rms * 0.8); // Range: 0.2 to 1.0
    
    // Smooth the opacity changes to avoid jarring transitions
    const currentOpacity = parseFloat(brightnessOverlay.style.opacity) || 0.2;
    const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * brightnessSmoothing;
    
    // Apply opacity to brightness overlay
    brightnessOverlay.style.opacity = newOpacity.toFixed(3);
    
    // Optional: Add subtle scale effect for high audio levels
    if (rms > 0.6) {
      const scaleIntensity = (rms - 0.6) * 2.5; // 0 to 1 when rms is 0.6 to 1.0
      const scale = 1 + (scaleIntensity * 0.05); // Scale from 1.0 to 1.05
      brightnessOverlay.style.transform = `scale(${scale.toFixed(3)})`;
    } else {
      brightnessOverlay.style.transform = 'scale(1)';
    }
  }

  // Reset audio-reactive brightness effects when recording stops
  function resetAudioReactiveBrightness() {
    const brightnessOverlay = document.getElementById('brightnessOverlay');
    
    // Reset brightness variables
    currentBrightness = 1.0;
    
    // Switch back to pulse loop mode after recording stops
    if (brightnessOverlay) {
      brightnessOverlay.classList.remove('audio-reactive');
      brightnessOverlay.classList.add('pulse-loop');
      brightnessOverlay.style.opacity = '';
      brightnessOverlay.style.transform = '';
    }
  }

  // Start looping brightness pulse animation after card generation
  function startBrightnessPulseLoop() {
    const brightnessOverlay = document.getElementById('brightnessOverlay');
    if (brightnessOverlay) {
      brightnessOverlay.classList.remove('audio-reactive');
      brightnessOverlay.classList.add('pulse-loop');
      brightnessOverlay.style.opacity = '';
      brightnessOverlay.style.transform = '';
    }
  }

  // Expose function globally for use after card generation
  window.startBrightnessPulseLoop = startBrightnessPulseLoop;

  // Update timer display
  function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const text = formatTime(elapsed);
    recordTimers.forEach(el => (el.textContent = text));
  }

  // Update UI based on new state
  function setState(newState) {
    // Clear any running timers/intervals
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (dotInterval) { clearInterval(dotInterval); dotInterval=null; }

    state = newState;
    console.log('State changed to', state);

    switch (state) {
      case 'idle':
        recordStates.forEach(el => {
          el.textContent = 'Start Recording';
          el.classList.remove('light-sweep');
        });
        recordTimers.forEach(el => (el.textContent = '0:00'));
        recordingTabs.forEach(tab => {
          tab.classList.remove('recording-active','recording-collapsing');
          tab.classList.add('shrink');
        });
        // Reset recording validation
        if (window.updateRecordingValidation) {
          window.updateRecordingValidation(false, false);
        }
        
        // Check instructions visibility when returning to idle
        if (window.checkInstructionsVisibility) {
          window.checkInstructionsVisibility();
        }
        break;

      case 'analyzed':
        recordStates.forEach(el => {
          el.textContent = 'Analyzed';
          el.classList.remove('light-sweep');
        });
        recordTimers.forEach(el => (el.textContent = '0:00'));
        recordingTabs.forEach(tab => {
          tab.classList.remove('recording-active','recording-collapsing');
          tab.classList.add('shrink');
        });
        break;

      case 'recording':
        recordStates.forEach(el => {
          el.innerHTML = 'Recording<span class="dots">.</span>';
          el.classList.remove('light-sweep');
        });

        // Start dots animation for recording
        let recDots=1;
        dotInterval = setInterval(()=>{
          recDots = recDots % 3 +1;
          const dstr='.'.repeat(recDots);
          recordStates.forEach(el=>{
            const d=el.querySelector('.dots');
            if(d) d.textContent=dstr;
          });
        },500);

        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        recordingTabs.forEach(tab => tab.classList.add('recording-active'));
        // allow browser to apply initial state, then expand circles smoothly
        setTimeout(()=>{
          recordingTabs.forEach(tab=>tab.classList.remove('shrink'));
        },20);

        // start mic live scaling after transition finishes for smoother entry
        setTimeout(startMic, 500);
        
        // Check instructions visibility when starting recording
        if (window.checkInstructionsVisibility) {
          window.checkInstructionsVisibility();
        }
        break;

      case 'analyzing':
        console.log('=== ANALYZING PHASE START ===');

        // Update UI label
        recordStates.forEach(el => {
          el.innerHTML = '<span class="sweep-wrapper"><span class="sweep-text">Analyzing</span><span class="sweep-text overlay-copy">Analyzing</span></span>';
        });

        // 1) Stop mic-driven scaling so inline transforms freeze at their last value
        stopMic();

        // 2) Ease each circle from its current scale back to 1
        const circles = document.querySelectorAll('.circle-outer');
        circles.forEach(c => {
          // ensure we have last scale value already on the element (inline from mic)
          c.style.transition = 'transform 0.4s cubic-bezier(0.22,0.61,0.36,1)';
          c.style.transform = 'scale(1)';
        });

        // 3) Swap classes after the easing completes (450 ms) so breathing starts seamlessly
        setTimeout(() => {
          recordingTabs.forEach(tab => {
            tab.classList.remove('recording-active', 'recording-collapsing', 'shrink');
            tab.classList.add('analyzing-active');
          });

          // clear inline styles used for easing
          circles.forEach(c => {
            c.style.transition = '';
            c.style.transform = '';
          });
        }, 450);

        // 4) After analyzing duration (3000 ms) gracefully collapse then return to idle
        setTimeout(() => {
          // Process final transcript and clean up
          let hasContent = false;
          if (finalTranscript.trim()) {
            // Add final punctuation if needed
            let finalText = finalTranscript.trim();
            if (!finalText.match(/[.!?]$/)) {
              finalText += '.';
            }
            
            // Update message textareas with final text
            const messageTextareas = document.querySelectorAll('.message-textarea');
            messageTextareas.forEach(textarea => {
              textarea.value = finalText;
            });
            
            // Trigger final resize
            if (window.resizeMessageTab) {
              window.resizeMessageTab();
            }

            // Check instructions visibility after final text is set
            if (window.checkInstructionsVisibility) {
              window.checkInstructionsVisibility();
            }
            
            hasContent = true;
          }

          // Update validation state for recording
          if (window.updateRecordingValidation) {
            window.updateRecordingValidation(hasContent, true);
          }

          // Change state to "Analyzed" instead of going back to idle
          recordStates.forEach(el => {
            el.textContent = 'Analyzed';
            el.classList.remove('light-sweep');
          });

          // Start collapse
          recordingTabs.forEach(tab => {
            tab.classList.remove('analyzing-active');
            tab.classList.add('recording-collapsing');
          });

          // Trigger shrink on next tick for smooth hide
          setTimeout(() => {
            recordingTabs.forEach(tab => tab.classList.add('shrink'));
          }, 20);

          // Final cleanup - stay in analyzed state instead of idle
          setTimeout(() => {
            recordingTabs.forEach(tab => tab.classList.remove('recording-collapsing'));
            state = 'analyzed'; // New state instead of going back to idle
            console.log('State changed to analyzed');
          }, 700);
        }, 3000);
        break;
    }
  }

  // Common click handler (inner circle or overlay)
  function handleClick() {
    if (state === 'idle')      setState('recording');
    else if (state === 'recording') setState('analyzing');
    else if (state === 'analyzed') setState('recording'); // Allow re-recording after analysis
  }

  // Attach handler to inner circles
  innerCircles.forEach(circle => {
    circle.addEventListener('click', (e) => {
      console.log('inner circle clicked');
      e.stopPropagation();
      handleClick();
    });
  });

  // Initialize default state
  setState('idle');
  
  // Check if there's already content in message textareas on load
  setTimeout(() => {
    const messageTextareas = document.querySelectorAll('.message-textarea');
    let hasContent = false;
    messageTextareas.forEach(textarea => {
      if (textarea.value.trim().length > 0) {
        hasContent = true;
      }
    });
    
    if (hasContent && window.updateRecordingValidation) {
      window.updateRecordingValidation(hasContent, true);
    }
  }, 100);
}); 