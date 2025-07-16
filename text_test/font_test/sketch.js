let robotoLetters = [];
let sfproLetters = [];
let messageLetters = [];
const text = "hello world";
const message = "I just wanted to say that you look amazing";
const letterDelay = 0.3; // Delay between letters in radians

function setup() {
  noCanvas();
  
  // Create Roboto Flex row
  const robotoRow = document.getElementById('roboto-row');
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    robotoRow.appendChild(span);
    robotoLetters.push(span);
  });
  
  // Create SF Pro row
  const sfproRow = document.getElementById('sfpro-row');
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    sfproRow.appendChild(span);
    sfproLetters.push(span);
  });

  // Create message row
  const messageRow = document.getElementById('message-row');
  message.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
    messageRow.appendChild(span);
    messageLetters.push(span);
  });

  const messageContainer = document.getElementById('message');

  // Define the lines structure
  const lines = [
      [
          { text: 'I just wanted', weight: 200, width: 75, className: 'word-space' },
          { text: 'to', weight: 200, width: 100, className: 'word-space' },
          { text: 'say', weight: 200, width: 130, className: 'word-space-extended' },
          { text: 'that', weight: 200, width: 100, className: 'word-space' },
          { text: 'you', weight: 500, width: 130, className: 'word-space' }
      ],
      [
          { text: 'look', weight: 200, width: 100, className: 'word-before-extended' },
          { text: 'amazing', className: 'word-amazing', splitLetters: true }
      ]
  ];

  // Create and style each line
  lines.forEach(line => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'line';

      // Create and style each word in the line
      line.forEach(({ text, weight, width, className, splitLetters }) => {
          const span = document.createElement('span');
          span.className = `word ${className || ''}`.trim();
          
          if (splitLetters) {
              // Split the word into individual letters
              text.split('').forEach(letter => {
                  const letterSpan = document.createElement('span');
                  letterSpan.textContent = letter;
                  span.appendChild(letterSpan);
              });
          } else {
              span.textContent = text;
              // Only set font-variation-settings if not using the animation class
              if (!className?.includes('word-amazing')) {
                  span.style.fontVariationSettings = `'wght' ${weight}, 'wdth' ${width || 100}, 'opsz' 72`;
              }
          }
          
          lineDiv.appendChild(span);
      });

      messageContainer.appendChild(lineDiv);
  });
}

function draw() {
  // Animate Roboto Flex letters
  robotoLetters.forEach((letter, index) => {
    const timeOffset = frameCount * 0.05 - index * letterDelay;
    
    const weight = map(sin(timeOffset), -1, 1, 100, 900);
    const width = map(sin(timeOffset * 0.7), -1, 1, 25, 150);
    const slant = map(sin(timeOffset * 0.5), -1, 1, -10, 0);
    const grad = map(sin(timeOffset * 0.3), -1, 1, -200, 150);
    
    letter.style.fontVariationSettings = `
      'wght' ${weight},
      'wdth' ${width},
      'slnt' ${slant},
      'GRAD' ${grad}
    `;
  });
  
  // Animate SF Pro letters with slightly different parameters
  sfproLetters.forEach((letter, index) => {
    const timeOffset = frameCount * 0.05 - index * letterDelay;
    
    const weight = map(sin(timeOffset), -1, 1, 100, 900);
    const width = map(sin(timeOffset * 0.8), -1, 1, 50, 200);  // Different width range
    const optical = map(sin(timeOffset * 0.6), -1, 1, 0, 100); // Optical size
    
    letter.style.fontVariationSettings = `
      'wght' ${weight},
      'wdth' ${width},
      'opsz' ${optical}
    `;
  });

  // Animate message letters with emphasis on specific words
  messageLetters.forEach((letter, index) => {
    const timeOffset = frameCount * 0.05 - index * letterDelay;
    
    // Set different base weights and widths for different parts of the message
    let baseWeight = 400;
    let baseWidth = 100;
    
    // "you" and "amazing" get more emphasis
    if (message.slice(index).startsWith("you")) {
      baseWeight = 700;
      baseWidth = 125;
    } else if (message.slice(index).startsWith("amazing")) {
      baseWeight = 800;
      baseWidth = 130;
    }
    
    const weight = map(sin(timeOffset), -1, 1, baseWeight - 100, baseWeight + 200);
    const width = map(sin(timeOffset * 0.7), -1, 1, baseWidth - 25, baseWidth + 25);
    
    letter.style.fontVariationSettings = `
      'wght' ${weight},
      'wdth' ${width}
    `;
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('message');

    // Define the lines structure
    const lines = [
        [
            { text: 'I just wanted', weight: 200, width: 75, className: 'word-space' },
            { text: 'to', weight: 200, width: 100, className: 'word-space' },
            { text: 'say', weight: 200, width: 130, className: 'word-space-extended' },
            { text: 'that', weight: 200, width: 100, className: 'word-space' },
            { text: 'you', weight: 500, width: 130, className: 'word-space' }
        ],
        [
            { text: 'look', weight: 200, width: 100, className: 'word-before-extended' },
            { text: 'amazing', className: 'word-amazing', splitLetters: true }
        ]
    ];

    // Create and style each line
    lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line';

        // Create and style each word in the line
        line.forEach(({ text, weight, width, className, splitLetters }) => {
            const span = document.createElement('span');
            span.className = `word ${className || ''}`.trim();
            
            if (splitLetters) {
                // Split the word into individual letters
                text.split('').forEach(letter => {
                    const letterSpan = document.createElement('span');
                    letterSpan.textContent = letter;
                    span.appendChild(letterSpan);
                });
            } else {
                span.textContent = text;
                // Only set font-variation-settings if not using the animation class
                if (!className?.includes('word-amazing')) {
                    span.style.fontVariationSettings = `'wght' ${weight}, 'wdth' ${width || 100}, 'opsz' 72`;
                }
            }
            
            lineDiv.appendChild(span);
        });

        messageContainer.appendChild(lineDiv);
    });
});