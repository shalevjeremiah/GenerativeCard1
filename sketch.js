// Hugging Face API constants - token managed by tokenManager.js
const SENTIMENT_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"; // Reverting to more reliable model
const UNDERSTANDING_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"; // For natural language understanding

// Get API token from token manager
function getHFToken() {
    return window.getApiToken && window.getApiToken();
}

// Enhanced emotion lexicon with more nuanced categories and expressions
const emotionLexicon = {
    joy: {
        pure_happiness: ["happy", "joyful", "delighted", "blissful", "ecstatic", "cheerful", "glad", "overjoyed"],
        excitement: ["excited", "thrilled", "enthusiastic", "energetic", "pumped", "stoked", "eager", "animated"],
        contentment: ["content", "satisfied", "peaceful", "serene", "fulfilled", "gratified", "pleased", "at ease"],
        achievement: ["proud", "accomplished", "successful", "triumphant", "victorious", "achieved", "mastered"],
        love_positive: ["love", "adore", "cherish", "treasure", "devoted", "fond", "affectionate", "caring"]
    },
    sadness: {
        grief: ["grief", "mourning", "devastated", "heartbroken", "bereft", "inconsolable", "anguished"],
        depression: ["depressed", "hopeless", "miserable", "gloomy", "dejected", "despondent", "down"],
        disappointment: ["disappointed", "failed", "letdown", "disheartened", "discouraged", "dismayed"],
        loneliness: ["lonely", "isolated", "abandoned", "forsaken", "solitary", "alone", "rejected"],
        heartache: ["heartache", "missing", "yearning", "pining", "longing", "nostalgic", "wistful"]
    },
    anger: {
        rage: ["furious", "outraged", "enraged", "livid", "seething", "irate", "fuming", "incensed"],
        frustration: ["frustrated", "annoyed", "irritated", "agitated", "exasperated", "vexed", "irked"],
        betrayal: ["betrayed", "deceived", "cheated", "double-crossed", "backstabbed", "wronged"],
        resentment: ["resent", "bitter", "grudge", "animosity", "hostile", "antagonistic", "spiteful"],
        indignation: ["unfair", "absurd", "unjust", "outrageous", "unacceptable", "ridiculous"]
    },
    fear: {
        terror: ["terrified", "horrified", "petrified", "panic", "paralyzed", "trembling", "scared stiff"],
        anxiety: ["anxious", "worried", "nervous", "uneasy", "apprehensive", "stressed", "tense"],
        dread: ["dread", "impending", "foreboding", "ominous", "threatening", "looming", "dreading"],
        phobia: ["scared", "frightened", "afraid", "fearful", "spooked", "startled", "jumpy"],
        uncertainty: ["uncertain", "doubtful", "unsure", "hesitant", "wavering", "ambivalent", "confused"]
    },
    surprise: {
        positive_surprise: ["amazed", "astonished", "awestruck", "wonderstruck", "impressed", "dazzled"],
        shock: ["shocked", "stunned", "startled", "flabbergasted", "dumbfounded", "speechless"],
        wonder: ["wonderful", "marvelous", "incredible", "unbelievable", "extraordinary", "remarkable"],
        unexpected: ["unexpected", "surprising", "unanticipated", "unforeseen", "unpredictable"]
    },
    disgust: {
        repulsion: ["disgusting", "revolting", "repulsive", "nauseating", "sickening", "gross", "vile"],
        disapproval: ["despicable", "offensive", "objectionable", "unacceptable", "deplorable"],
        aversion: ["hate", "dislike", "detest", "loathe", "abhor", "despise", "repelled"],
        contempt: ["contempt", "scorn", "disdain", "derision", "mockery", "ridicule", "sneering"]
    },
    flirty: {
        playful: ["tease", "flirt", "playful", "coy", "frisky", "mischievous", "naughty", "cheeky"],
        romantic: ["charming", "attractive", "alluring", "seductive", "enticing", "tempting"],
        complimentary: ["beautiful", "handsome", "gorgeous", "stunning", "cute", "pretty", "hot"],
        suggestive: ["wink", "hint", "imply", "suggest", "insinuate", "intimate"]
    }
};

// Enhanced context markers with more sophisticated patterns
const contextMarkers = {
    sarcasm: {
        indicators: ["yeah right", "sure sure", "oh really", "how nice", "great job", "brilliant"],
        emphasis: ["so", "really", "totally", "absolutely", "obviously", "clearly"],
        punctuation: ["!", "...", "?!", "!?"],
        emojis: ["🙄", "😏", "😒", "🤔"],
        patterns: ["as if", "like that's", "sure thing", "whatever you say"]
    },
    flirty: {
        greetings: ["hey", "hi", "hello", "hey there", "hi there", "heyyy"],
        compliments: ["cute", "lovely", "beautiful", "gorgeous", "amazing", "wonderful"],
        actions: ["wink", "hug", "kiss", "smile", "laugh", "giggle", "blush"],
        emojis: ["😉", "😘", "😍", "🥰", "💕", "😊"],
        playful: ["tease", "flirt", "joke", "play", "fun", "silly"]
    },
    passive_aggressive: {
        dismissive: ["fine", "whatever", "okay then", "if you say so", "sure"],
        sarcastic_agreement: ["right", "obviously", "clearly", "of course", "naturally"],
        minimizing: ["just", "only", "merely", "simply", "barely"],
        forced_politeness: ["thanks", "appreciate it", "how kind", "so nice of you"],
        patterns: ["no offense but", "with all due respect", "not to be rude but"]
    },
    joking: {
        laughter: ["haha", "lol", "lmao", "rofl", "hehe", "tehehe"],
        playful_words: ["kidding", "joking", "just playing", "messing around"],
        emojis: ["😄", "😂", "🤣", "😆", "😋", "😜"],
        exaggeration: ["literally dying", "cant even", "dead", "im done"]
    },
    bitterness: {
        resentment: ["always", "never", "every time", "typical", "of course"],
        past_reference: ["again", "as usual", "like always", "once more"],
        cynicism: ["why bother", "what's the point", "who cares"],
        self_pity: ["just my luck", "figures", "naturally", "obviously"]
    }
};

// New: Negation patterns that can flip emotion meanings
const negationPatterns = {
    direct: ["not", "no", "never", "none", "neither", "nor"],
    implicit: ["hardly", "barely", "scarcely", "rarely"],
    questioning: ["cannot", "can't", "couldn't", "wouldn't", "shouldn't"],
    complex: ["rather than", "instead of", "as opposed to", "contrary to"]
};

// New: Intensity modifiers that can amplify or diminish emotions
const intensityModifiers = {
    amplifiers: ["very", "really", "extremely", "incredibly", "absolutely", "totally", "completely", "utterly"],
    diminishers: ["somewhat", "kind of", "sort of", "a bit", "slightly", "barely", "hardly", "rather"],
    boosters: ["most", "best", "worst", "least", "maximum", "minimum", "ultimate", "supreme"],
    hedges: ["maybe", "perhaps", "possibly", "probably", "likely", "seemingly", "apparently"]
};

// Add new ambivalent emotion patterns
const ambivalentPatterns = {
    love_hate: {
        indicators: ["love and hate", "love but hate", "hate but love", "love yet hate"],
        mixed_feelings: ["mixed feelings about", "conflicted about", "torn about"],
        simultaneous: ["at the same time", "simultaneously", "both"],
        intensity_pairs: [
            ["love", "hate"],
            ["adore", "despise"],
            ["care", "resent"],
            ["miss", "angry"],
            ["want", "reject"]
        ]
    },
    trust_fear: {
        indicators: ["trust but scared", "want to trust but", "scared to trust"],
        mixed_feelings: ["unsure about trusting", "afraid to believe"],
        simultaneous: ["while also", "yet still", "despite"]
    },
    happy_sad: {
        indicators: ["happy but sad", "sad but happy", "bittersweet"],
        mixed_feelings: ["melancholic joy", "happy tears", "sad smile"],
        simultaneous: ["while feeling", "mixed with", "tinged with"]
    }
};

// Add emotional transition markers
const emotionalTransitions = {
    contrasts: ["but", "yet", "however", "although", "though", "nevertheless", "still", "despite"],
    simultaneity: ["while", "as", "simultaneously", "at the same time", "together with"],
    complexity: ["mixed", "complicated", "complex", "conflicted", "confused"]
};

// DOM Elements - some from original, some new
let robotoLetters = [];
let sfproLetters = [];
// messageLetters is removed as message is now dynamic

let userNameInput, sentenceInput, analyzeSentenceBtn, analyzedMessageOutput, loadingIndicator;
// let summaryDiv; // For text_test summary, not currently in HTML

// Original p5.js letterDelay and frameCount (if draw loop is kept for other elements)
const letterDelay = 0.3;
let frameCountForP5 = 0; // Renamed to avoid conflict if text_test also uses frameCount
let staticAmazingFrameCount = 0; // For the static placeholder's "amazing" animation
let staticAmazingAnimationId = null; // To cancel the animation frame

let artGenerator;
let generatedArtCanvas;

function updateGeneratedArt(artDataUrl, emotions = null) {
    // Update the CSS variable for all instances
    document.documentElement.style.setProperty('--generated-art-url', `url(${artDataUrl})`);
    
    // Add class to indicate art is generated
    document.body.classList.add('art-generated');
    
    // Update main image
    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
        mainImage.src = artDataUrl;
    }
    
    // Apply color analysis immediately when art is generated
    if (generatedArtCanvas) {
        const dominantColor = getDominantColorFromCanvas(generatedArtCanvas);
        if (dominantColor) {
            // Use brightness-based text color (black if brightness > 50%, white otherwise)
            const textColor = dominantColor.brightness > 0.5 ? '#000000' : '#ffffff';
            
            // Apply color to inputTabs immediately 
            applyColorToInputTabs(dominantColor.hex, textColor);
            
            // Update debug indicator with brightness
            updateDebugColorIndicator(dominantColor.hex, textColor, 'ACTIVE', dominantColor.brightness);
            
            console.log(`Applied immediate dark mode: ${dominantColor.hex} (brightness: ${dominantColor.brightness.toFixed(2)}, text: ${textColor})`);
        }
    }

    // Start brightness pulse loop animation for generated art
    if (typeof window.startBrightnessPulseLoop === 'function') {
        setTimeout(() => {
            window.startBrightnessPulseLoop();
        }, 200);
    }
}

// Update debug color indicator
function updateDebugColorIndicator(backgroundColor = null, textColor = null, state = 'INACTIVE', brightness = null) {
    const debugIndicator = document.getElementById('colorDebugIndicator');
    const debugSwatch = document.getElementById('debugColorSwatch');
    const debugText = document.getElementById('debugColorText');
    const debugBrightness = document.getElementById('debugBrightness');
    
    if (!debugIndicator || !debugSwatch || !debugText || !debugBrightness) return;
    
    if (backgroundColor && textColor) {
        debugSwatch.style.background = backgroundColor;
        debugText.textContent = state;
        debugText.style.color = 'white'; // Keep debug text always white for visibility
        
        // Show brightness level
        if (brightness !== null) {
            debugBrightness.textContent = `${(brightness * 100).toFixed(0)}%`;
        } else {
            debugBrightness.textContent = '';
        }
        
        // Keep border white always
        debugIndicator.style.border = '2px solid rgba(255,255,255,0.3)';
    } else {
        // Reset to inactive state - but show default color info if no specific values provided
        debugSwatch.style.background = '#524884';
        debugText.textContent = state;
        debugText.style.color = 'white';
        // Show default brightness for inactive states
        if (state === 'INACTIVE') {
            debugBrightness.textContent = '35%';
        } else {
            debugBrightness.textContent = '';
        }
        debugIndicator.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    }
}

function applyEmotionColorToButton(emotions) {
    const generateButton = document.getElementById('generateCardContent');
    if (!generateButton || !generatedArtCanvas) {
        // Show no canvas state with default button color
        const defaultColor = '#524884';
        const defaultBrightness = 0.35;
        updateDebugColorIndicator(defaultColor, '#ffffff', 'NO CANVAS', defaultBrightness);
        return;
    }
    
    // Check if button is currently in "generating" state
    const genText = generateButton.querySelector('.generate-card-text');
    const isGenerating = genText && genText.dataset.generating === 'true';
    if (isGenerating) {
        console.log('Button is in generating state - applying color but keeping generating state');
    }
    
    // Sample the dominant color from the generated art canvas
    const dominantColor = getDominantColorFromCanvas(generatedArtCanvas);
    
    if (dominantColor) {
        // Apply the sampled color to the button
        generateButton.classList.add('art-colored');
        generateButton.style.setProperty('--art-color', dominantColor.hex);
        
        // Use brightness-based text color (black if brightness > 50%, white otherwise)
        const textColor = dominantColor.brightness > 0.5 ? '#000000' : '#ffffff';
        generateButton.style.setProperty('--text-color', textColor);
        
        // Apply color to inputTabs as well
        applyColorToInputTabs(dominantColor.hex, textColor);
        
        // Update debug indicator with brightness - show GENERATING if button is generating
        const state = isGenerating ? 'GENERATING' : 'ACTIVE';
        updateDebugColorIndicator(dominantColor.hex, textColor, state, dominantColor.brightness);
        
        console.log(`Applied art color: ${dominantColor.hex} (brightness: ${dominantColor.brightness.toFixed(2)}, text: ${textColor})`);
    } else {
        // Show no color state with default button color
        const noColorColor = '#524884';
        const noColorBrightness = 0.35;
        updateDebugColorIndicator(noColorColor, '#ffffff', 'NO COLOR', noColorBrightness);
    }
}

// Apply color to inputTabs content
function applyColorToInputTabs(backgroundColor, textColor) {
    // Apply to author tab content
    const authorInputs = document.querySelectorAll('.author-input');
    authorInputs.forEach(input => {
        if (input) {
            input.style.color = textColor;
        }
    });
    
    // Apply to record tab content
    const recordStates = document.querySelectorAll('.record-state');
    const recordTimers = document.querySelectorAll('.record-timer');
    recordStates.forEach(state => {
        if (state) {
            state.style.color = textColor;
        }
    });
    recordTimers.forEach(timer => {
        if (timer) {
            timer.style.color = textColor;
        }
    });
    
    // Apply to message tab content
    const messageTextareas = document.querySelectorAll('.message-textarea');
    messageTextareas.forEach(textarea => {
        if (textarea) {
            textarea.style.color = textColor;
        }
    });
    
    // Apply to recording visualizer circles (HTML elements)
    const visualizerCircles = document.querySelectorAll('.record-visualizer .circle');
    console.log(`Found ${visualizerCircles.length} visualizer circles to update`);
    visualizerCircles.forEach((circle, index) => {
        if (circle) {
            circle.style.setProperty('background-color', textColor, 'important');
            circle.style.setProperty('background', textColor, 'important');
            console.log(`Updated visualizer circle ${index} to color: ${textColor}`);
        }
    });
    
    // Apply to SVG circles and inner shapes in inputTabs
    const svgCircles = document.querySelectorAll('.inputTab-circles circle');
    const svgInnerShapes = document.querySelectorAll('.inputTab-circles .inner-shape');
    
    console.log(`Found ${svgCircles.length} SVG circles and ${svgInnerShapes.length} inner shapes to update`);
    
    svgCircles.forEach((circle, index) => {
        if (circle) {
            circle.setAttribute('stroke', textColor);
            console.log(`Updated SVG circle ${index} stroke to color: ${textColor}`);
        }
    });
    
    svgInnerShapes.forEach((shape, index) => {
        if (shape) {
            shape.setAttribute('fill', textColor);
            console.log(`Updated SVG inner shape ${index} fill to color: ${textColor}`);
        }
    });
    
    // Apply to analyzing sweep text elements
    const sweepTexts = document.querySelectorAll('.sweep-text');
    const sweepOverlayCopies = document.querySelectorAll('.sweep-text.overlay-copy');
    
    console.log(`Found ${sweepTexts.length} sweep texts to update`);
    
    sweepTexts.forEach((text, index) => {
        if (text) {
            // Update the text fill color for the sweep animation
            text.style.setProperty('-webkit-text-fill-color', `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'},0.3)`, 'important');
            console.log(`Updated sweep text ${index} to color: ${textColor}`);
        }
    });
    
    // Check if system is in dark mode
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply to placeholder text and circle colors via CSS custom properties
    document.documentElement.style.setProperty('--input-tab-text-color', textColor);
    document.documentElement.style.setProperty('--visualizer-circle-color', textColor);
    document.documentElement.style.setProperty('--sweep-text-color', `rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'},0.3)`);
    // Determine separator line color (avoid pure black in dark mode)
    const effectiveSeparatorColor = systemDarkMode || textColor.toLowerCase() === '#000000' ? '#ffffff' : textColor;
    document.documentElement.style.setProperty('--separator-line-color', effectiveSeparatorColor);
    
    // --- Animated logo (bottom-right) colour management ---
    const effectiveLogoColor = effectiveSeparatorColor; // same logic
    // CSS custom property for possible future use
    document.documentElement.style.setProperty('--logo-stroke-color', effectiveLogoColor);

    // Directly update strokes on all logo layers
    const logoStrokes = document.querySelectorAll('.animated-logo-container .logo-stroke');
    logoStrokes.forEach(strokeEl => {
        strokeEl.setAttribute('stroke', effectiveLogoColor);
    });
    
    // Update crafted-by text colours with !important to override CSS
    const logoTexts = document.querySelectorAll('.crafted-line, .jeremiah-line');
    logoTexts.forEach(txt=> txt.style.setProperty('color', effectiveLogoColor, 'important'));
    
    // Keep titles white in dark mode, otherwise FORCE WHITE in light mode
    if (systemDarkMode) {
        document.documentElement.style.setProperty('--title-text-color', 'rgb(255, 255, 255)');
        
        // Force titles to use normal blend mode and white color in dark mode
        const titleElements = document.querySelectorAll('.edit-title, .preview-title, .share-title');
        titleElements.forEach(title => {
            title.style.color = 'rgb(255, 255, 255)';
            title.style.mixBlendMode = 'normal';
        });

        // Logo - force white in dark mode
        document.documentElement.style.setProperty('--logo-stroke-color', 'rgb(255, 255, 255)');
        document.querySelectorAll('.animated-logo-container .logo-stroke').forEach(s=>s.setAttribute('stroke','rgb(255, 255, 255)'));
        document.querySelectorAll('.crafted-line, .jeremiah-line').forEach(t=>t.style.setProperty('color','rgb(255, 255, 255)','important'));
    } else {
        // LIGHT MODE: ALWAYS use white colors
        document.documentElement.style.setProperty('--title-text-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--separator-line-color', 'rgb(255, 255, 255)');
        
        // Force titles to use white color in light mode
        const titleElements = document.querySelectorAll('.edit-title, .preview-title, .share-title');
        titleElements.forEach(title => {
            title.style.color = 'rgb(255, 255, 255)';
            title.style.mixBlendMode = 'overlay';
        });

        // Force duplicates to be white too
        const titleDuplicates = document.querySelectorAll('.edit-title-2, .preview-title-2, .share-title-2');
        titleDuplicates.forEach(title => {
            title.style.color = 'rgb(255, 255, 255)';
            title.style.mixBlendMode = 'overlay';
        });

        // Logo - force white in light mode
        document.documentElement.style.setProperty('--logo-stroke-color', 'rgb(255, 255, 255)');
        document.querySelectorAll('.animated-logo-container .logo-stroke').forEach(s=>s.setAttribute('stroke','rgb(255, 255, 255)'));
        document.querySelectorAll('.crafted-line, .jeremiah-line').forEach(t=>t.style.setProperty('color','rgb(255, 255, 255)','important'));
        
        // Force separator text to be white
        const separatorTexts = document.querySelectorAll('.horizontal-separator-text, .horizontal-separator-text-2');
        separatorTexts.forEach(text => {
            text.style.color = 'rgb(255, 255, 255)';
        });
    }
    
    // Apply to camera and record icons explicitly
    const cameraIconPaths = document.querySelectorAll('.camera-icon path');
    const cameraIconCircles = document.querySelectorAll('.camera-icon circle');
    const recordIconPaths = document.querySelectorAll('.record-icon path');
    
    console.log(`Found ${cameraIconPaths.length} camera icon paths, ${cameraIconCircles.length} camera icon circles, and ${recordIconPaths.length} record icon paths to update`);
    
    cameraIconPaths.forEach((path, index) => {
        if (path) {
            path.setAttribute('fill', textColor);
            console.log(`Updated camera icon path ${index} fill to color: ${textColor}`);
        }
    });
    
    cameraIconCircles.forEach((circle, index) => {
        if (circle) {
            circle.setAttribute('stroke', textColor);
            console.log(`Updated camera icon circle ${index} stroke to color: ${textColor}`);
        }
    });
    
    recordIconPaths.forEach((path, index) => {
        if (path) {
            path.setAttribute('fill', textColor);
            console.log(`Updated record icon path ${index} fill to color: ${textColor}`);
        }
    });

    // === Swap to external dark assets when dark mode (black UI) is active ===
    const isDarkModeActive = textColor.toLowerCase() === '#000000' || textColor.toLowerCase() === 'black';
    
    // Handle camera icons
    const cameraSvgIcons = document.querySelectorAll('svg.camera-icon');
    cameraSvgIcons.forEach((svg, index) => {
        // Look for an adjacent IMG that we will use for the dark version (insert if missing)
        let darkImg = svg.nextElementSibling;
        if (!(darkImg && darkImg.classList && darkImg.classList.contains('camera-icon-dark'))) {
            // Create the IMG only once and insert it right after the SVG
            darkImg = document.createElement('img');
            darkImg.src = 'Assets/camera_dark.svg';
            darkImg.width = svg.getAttribute('width') || 62;
            darkImg.height = svg.getAttribute('height') || 50;
            darkImg.classList.add('camera-icon-dark');
            darkImg.style.display = 'none'; // hidden by default
            // Make sure it inherits the same mix-blend if needed
            if (svg.getAttribute('mix-blend-mode')) {
                darkImg.style.mixBlendMode = svg.getAttribute('mix-blend-mode');
            }
            svg.parentNode.insertBefore(darkImg, svg.nextSibling);
            console.log(`Inserted dark camera img for icon ${index}`);
        }
        // Toggle visibility based on mode
        if (isDarkModeActive) {
            svg.style.display = 'none';
            darkImg.style.display = 'block';
        } else {
            svg.style.display = 'block';
            darkImg.style.display = 'none';
        }
    });
    
    // Handle record icons
    const recordSvgIcons = document.querySelectorAll('svg.record-icon');
    recordSvgIcons.forEach((svg, index) => {
        // Look for an adjacent IMG that we will use for the dark version (insert if missing)
        let darkImg = svg.nextElementSibling;
        if (!(darkImg && darkImg.classList && darkImg.classList.contains('record-icon-dark'))) {
            // Create the IMG only once and insert it right after the SVG
            darkImg = document.createElement('img');
            darkImg.src = 'Assets/record_dark.svg';
            darkImg.width = svg.getAttribute('width') || 62;
            darkImg.height = svg.getAttribute('height') || 42;
            darkImg.classList.add('record-icon-dark');
            darkImg.style.display = 'none'; // hidden by default
            // Make sure it inherits the same mix-blend if needed
            if (svg.getAttribute('mix-blend-mode')) {
                darkImg.style.mixBlendMode = svg.getAttribute('mix-blend-mode');
            }
            svg.parentNode.insertBefore(darkImg, svg.nextSibling);
            console.log(`Inserted dark record img for icon ${index}`);
        }
        // Toggle visibility based on mode
        if (isDarkModeActive) {
            svg.style.display = 'none';
            darkImg.style.display = 'block';
        } else {
            svg.style.display = 'block';
            darkImg.style.display = 'none';
        }
    });

    // Also force update circles via direct CSS injection
    const styleElement = document.getElementById('dynamic-circle-style') || document.createElement('style');
    styleElement.id = 'dynamic-circle-style';
    styleElement.textContent = `
        .record-visualizer .circle {
            background-color: ${textColor} !important;
            background: ${textColor} !important;
        }
        .inputTab-circles circle {
            stroke: ${textColor} !important;
        }
        .inputTab-circles .inner-shape {
            fill: ${textColor} !important;
        }
        .sweep-text {
            -webkit-text-fill-color: rgba(${textColor === '#ffffff' ? '255,255,255' : '0,0,0'},0.3) !important;
        }
        .camera-icon path {
            fill: ${textColor} !important;
        }
        .camera-icon circle {
            stroke: ${textColor} !important;
        }
        .record-icon path {
            fill: ${textColor} !important;
        }
    `;
    if (!document.getElementById('dynamic-circle-style')) {
        document.head.appendChild(styleElement);
    }
    
    console.log(`Applied inputTab text color: ${textColor} and circle color: ${textColor} for background: ${backgroundColor}`);
    // Enforce fixed title styles so OS theme cannot override
    applyFixedTitleStyles();
}

// Function to set initial title colors based on dark mode
function setInitialTitleColors() {
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (systemDarkMode) {
        // Set white color for titles in dark mode
        document.documentElement.style.setProperty('--title-text-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--separator-line-color', 'rgb(255, 255, 255)');
        
        const titleElements = document.querySelectorAll('.edit-title, .preview-title, .share-title');
        titleElements.forEach(title => {
            title.style.color = 'rgb(255, 255, 255)';
            title.style.mixBlendMode = 'overlay';
        });

        // No duplicate titles to hide - only primary titles exist

        // Logo - force white in dark mode
        document.documentElement.style.setProperty('--logo-stroke-color', 'rgb(255, 255, 255)');
        document.querySelectorAll('.animated-logo-container .logo-stroke').forEach(s=>s.setAttribute('stroke','rgb(255, 255, 255)'));
        document.querySelectorAll('.crafted-line, .jeremiah-line').forEach(t=>t.style.setProperty('color','rgb(255, 255, 255)','important'));
    } else {
        // LIGHT MODE: ALWAYS use white colors and ensure duplicates are visible
        document.documentElement.style.setProperty('--title-text-color', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--separator-line-color', 'rgb(255, 255, 255)');
        
        // Force titles to use white color in light mode
        const titleElements = document.querySelectorAll('.edit-title, .preview-title, .share-title');
        titleElements.forEach(title => {
            title.style.color = 'rgb(255, 255, 255)';
            title.style.mixBlendMode = 'overlay';
            title.style.position = 'fixed';
            title.style.zIndex = '10';
        });

        // No duplicate titles to show - only primary titles exist

        // Logo - force white in light mode
        document.documentElement.style.setProperty('--logo-stroke-color', 'rgb(255, 255, 255)');
        document.querySelectorAll('.animated-logo-container .logo-stroke').forEach(s=>s.setAttribute('stroke','rgb(255, 255, 255)'));
        document.querySelectorAll('.crafted-line, .jeremiah-line').forEach(t=>t.style.setProperty('color','rgb(255, 255, 255)','important'));
        
        // Force separator text to be white
        const separatorTexts = document.querySelectorAll('.horizontal-separator-text, .horizontal-separator-text-2');
        separatorTexts.forEach(text => {
            text.style.color = 'rgb(255, 255, 255)';
        });
    }

    // After applying any theme-specific logic, force our fixed styling
    applyFixedTitleStyles();
}

// Expose functions globally
window.applyEmotionColorToButton = applyEmotionColorToButton;
window.updateDebugColorIndicator = updateDebugColorIndicator;
window.applyColorToInputTabs = applyColorToInputTabs;
window.setInitialTitleColors = setInitialTitleColors;

function getDominantColorFromCanvas(canvas) {
    try {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Color frequency map
        const colorMap = {};
        
        // Sample every 8th pixel for better performance and stability
        for (let i = 0; i < data.length; i += 32) { // i += 32 means every 8th pixel (4 channels * 8 pixels)
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Round colors more aggressively to group similar colors and reduce noise
            const roundedR = Math.round(r / 20) * 20;
            const roundedG = Math.round(g / 20) * 20;
            const roundedB = Math.round(b / 20) * 20;
            
            const colorKey = `${roundedR},${roundedG},${roundedB}`;
            colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
        }
        
        // Find the most frequent color
        let dominantColor = null;
        let maxCount = 0;
        
        for (const [colorKey, count] of Object.entries(colorMap)) {
            if (count > maxCount) {
                maxCount = count;
                const [r, g, b] = colorKey.split(',').map(Number);
                
                // Calculate brightness (perceptual luminance)
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                
                dominantColor = {
                    r,
                    g,
                    b,
                    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                    brightness
                };
            }
        }
        
        // Add more conservative brightness threshold to avoid flicker
        if (dominantColor) {
            // Use a more conservative threshold (0.6 instead of 0.5) to prefer white text
            const shouldUseBlackText = dominantColor.brightness > 0.6;
            console.log(`Color sampling: ${dominantColor.hex}, brightness: ${dominantColor.brightness.toFixed(2)}, will use ${shouldUseBlackText ? 'black' : 'white'} text`);
        }
        
        return dominantColor;
    } catch (error) {
        console.error('Error sampling canvas color:', error);
        return null;
    }
}

function initializeArtGenerator() {
    console.log('Initializing art generator...');
    try {
        // Use the in-page canvas so art is visible in Layout 1
        generatedArtCanvas = document.getElementById('artCanvas');
        if (!generatedArtCanvas) {
            console.error('artCanvas element not found in DOM');
            return;
        }
        artGenerator = new ArtGenerator(generatedArtCanvas);
        console.log('Art generator created successfully');

        // Generate initial art
        const mainImage = document.querySelector('.main-image');
        console.log('Main image element:', mainImage);
        
        if (mainImage) {
            console.log('Generating neutral initial art...');
            artGenerator.generateArt({
                wordCount: 10,
                date: new Date(),
                author: "None",
                emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 },
                totalWords: 10
            });
            console.log('Neutral initial art generated');
            
            if (generatedArtCanvas) {
                requestAnimationFrame(()=>{
                    updateGeneratedArt(generatedArtCanvas.toDataURL());
                    // Start brightness pulse loop for initial art
                    if (typeof window.startBrightnessPulseLoop === 'function') {
                        setTimeout(() => {
                            window.startBrightnessPulseLoop();
                        }, 500);
                    }
                });
            }
        } else {
            console.error('Main image element not found');
        }

        // Expose globally for equalizer integration
        window.artGenerator = artGenerator;
    } catch (error) {
        console.error('Error initializing art generator:', error);
    }
}

// Call initialization after a short delay to ensure DOM is fully loaded
window.addEventListener('load', () => {
    console.log('Window loaded, initializing art generator...');
    setTimeout(initializeArtGenerator, 100);
});

function setup() {
  // noCanvas(); // Keep if p5 is used only for DOM manipulation and not canvas
  
  // Create Roboto Flex row (if still in HTML)
  const robotoRow = document.getElementById('roboto-row');
  if (robotoRow) {
    "hello world".split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    robotoRow.appendChild(span);
    robotoLetters.push(span);
  });
  }
  
  // Create SF Pro row (if still in HTML)
  const sfproRow = document.getElementById('sfpro-row');
  if (sfproRow) {
    "hello world".split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    sfproRow.appendChild(span);
    sfproLetters.push(span);
  });
  }

  // The old message creation logic for "I just wanted to say..." is removed.
  // It will be replaced by the analyze and render logic.
}

function draw() { // This draw is for p5.js animations of roboto/sfpro letters
  if (robotoLetters.length === 0 && sfproLetters.length === 0) return; // Skip if elements not found

  frameCountForP5++; // Use renamed frameCount

  // Animate Roboto Flex letters (if elements exist)
  if (robotoLetters.length > 0) {
  robotoLetters.forEach((letter, index) => {
      const timeOffset = frameCountForP5 * 0.05 - index * letterDelay;
    const weight = map(sin(timeOffset), -1, 1, 100, 900);
    const width = map(sin(timeOffset * 0.7), -1, 1, 25, 150);
    const slant = map(sin(timeOffset * 0.5), -1, 1, -10, 0);
    const grad = map(sin(timeOffset * 0.3), -1, 1, -200, 150);
      letter.style.fontVariationSettings = `\'wght\' ${weight}, \'wdth\' ${width}, \'slnt\' ${slant}, \'GRAD\' ${grad}`;
    });
  }
  
  // Animate SF Pro letters (if elements exist)
  if (sfproLetters.length > 0) {
  sfproLetters.forEach((letter, index) => {
      const timeOffset = frameCountForP5 * 0.05 - index * letterDelay;
    const weight = map(sin(timeOffset), -1, 1, 100, 900);
      const width = map(sin(timeOffset * 0.8), -1, 1, 50, 200);
      const optical = map(sin(timeOffset * 0.6), -1, 1, 0, 100);
      letter.style.fontVariationSettings = `\'wght\' ${weight}, \'wdth\' ${width}, \'opsz\' ${optical}`;
    });
  }
  // Old messageLetters animation removed.
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial title colors based on dark mode
    setInitialTitleColors();
    
    // Call p5 setup if it's being used for roboto/sfpro rows
    if (typeof setup === 'function' && (document.getElementById('roboto-row') || document.getElementById('sfpro-row'))) {
        setup(); 
        // Start p5 draw loop if setup was called and elements exist
        if (typeof draw === 'function' && (robotoLetters.length > 0 || sfproLetters.length > 0)) {
            function p5Animate() {
                draw();
                requestAnimationFrame(p5Animate);
            }
            // p5Animate(); // Uncomment if p5 animations for roboto/sfpro are desired
        }
    }
    
    // Update the date to current date
    const dateElement = document.querySelector('.layout-info-bottom .text-box:last-child p');
    if (dateElement) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        dateElement.textContent = `${day}/${month}/${year}`;
    }

    // Initialize DOM elements for text analysis feature
    userNameInput = document.getElementById('userNameInput');
    sentenceInput = document.getElementById('sentenceInput');
    analyzeSentenceBtn = document.getElementById('analyzeSentenceBtn');
    analyzedMessageOutput = document.getElementById('analyzedMessageOutput');
    loadingIndicator = document.getElementById('loadingIndicator');
    // summaryDiv = document.getElementById('summary'); // Not in current HTML

    if (analyzeSentenceBtn) {
        analyzeSentenceBtn.addEventListener('click', handleAnalyze);
    } else {
        console.error("Analyze button not found.");
    }
    if (!analyzedMessageOutput) {
        console.error("Analyzed message output container not found.");
    }
     if (!sentenceInput) {
        console.error("Sentence input not found.");
    }

    // Dynamic update for "Made by" field
    if (userNameInput) {
        userNameInput.addEventListener('input', (event) => {
            let val = event.target.value;
            
            // Auto-capitalize first letter if it's the beginning of text
            if (val.length === 1 && val.match(/[a-z]/)) {
                val = val.toUpperCase();
                event.target.value = val;
                // Move cursor to end
                event.target.setSelectionRange(val.length, val.length);
            }
            
            const name = val.trim();
            const madeByP = document.querySelector('.layout-info-bottom .text-box:first-child p');
            if (madeByP) {
                madeByP.textContent = name ? name : "None";
            }
        });
    }

    // Add capitalization for sentenceInput
    if (sentenceInput) {
        sentenceInput.addEventListener('input', (event) => {
            let val = event.target.value;
            
            // Auto-capitalize first letter if it's the beginning of text
            if (val.length === 1 && val.match(/[a-z]/)) {
                val = val.toUpperCase();
                event.target.value = val;
                // Move cursor to end
                event.target.setSelectionRange(val.length, val.length);
            }
        });
    }

    displayStaticPlaceholderMessage(); // Display the static placeholder on load

    // Update art when analyzing text
    if (analyzeSentenceBtn) {
        const originalHandleAnalyze = handleAnalyze;
        handleAnalyze = async () => {
            await originalHandleAnalyze();
            
            // After analysis, generate new art
            const text = sentenceInput.value.trim();
            const name = userNameInput ? userNameInput.value.trim() : "";
            const words = text.split(/\s+/).filter(w => w.length > 0);
            
            // Get the latest emotion results
            let emotions = { joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0, love: 0 };
            try {
                const textToAnalyze = sentenceInput ? sentenceInput.value.trim() : "";
                if (textToAnalyze && window.analyzeMessage) {
                    emotions = window.analyzeMessage(textToAnalyze);
                }
            } catch (err) {
                console.warn('Emotion analysis failed', err);
            }
            
            // Generate new artwork
            const newArt = artGenerator.generateArt({
                wordCount: words.length,
                date: new Date(),
                author: name || "None",
                emotions: emotions,
                totalWords: words.length
            });
            
            // Update background with latest canvas
            if (generatedArtCanvas) {
                requestAnimationFrame(()=>{
                    updateGeneratedArt(generatedArtCanvas.toDataURL());
                });
            }
        };
    }

    // --- Functions from text_test/script.js (adapted) ---

    function calculateNormalizedTone(emotions) {
        if (!emotions || Object.keys(emotions).length === 0) {
            return "Not Recognized";
        }

        // Sort emotions by score (highest first)
        const sortedEmotions = Object.entries(emotions)
            .sort(([,a],[,b]) => b-a)
            .filter(([_, score]) => score > 0.05); // Filter out very low scores (< 5%)

        if (sortedEmotions.length === 0) {
            return "Neutral";
        }

        // Start with the top emotion and add more until we have a good representation
        let selectedEmotions = [];
        let cumulativeScore = 0;
        
        // Always include the top emotion
        if (sortedEmotions.length > 0) {
            selectedEmotions.push(sortedEmotions[0]);
            cumulativeScore = sortedEmotions[0][1];
        }

        // Add more emotions strategically
        for (let i = 1; i < sortedEmotions.length && selectedEmotions.length < 4; i++) {
            const [emotion, score] = sortedEmotions[i];
            
            // Include if it's significant relative to the top emotion
            const topScore = selectedEmotions[0][1];
            if (score >= topScore * 0.3 || selectedEmotions.length === 1) {
                selectedEmotions.push([emotion, score]);
                cumulativeScore += score;
            }
            
            // Stop if we have enough representation (cumulative > 80% of total emotion intensity)
            if (cumulativeScore >= 0.8 && selectedEmotions.length >= 2) {
                break;
            }
        }

        // Ensure we have at least 2 emotions if possible, but not more than 3 for readability
        if (selectedEmotions.length === 1 && sortedEmotions.length > 1) {
            selectedEmotions.push(sortedEmotions[1]);
        }
        
        // Limit to 3 emotions max for clean display
        selectedEmotions = selectedEmotions.slice(0, 3);

        // Normalize so they sum to exactly 100%
        const totalSelected = selectedEmotions.reduce((sum, [_, score]) => sum + score, 0);
        const normalizedEmotions = selectedEmotions.map(([emotion, score]) => [
            emotion, 
            (score / totalSelected) * 100
        ]);

        // Ensure the percentages sum to exactly 100% (handle floating point precision)
        let totalPercentage = normalizedEmotions.reduce((sum, [_, pct]) => sum + pct, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
            // Adjust the largest emotion to make it exactly 100%
            const adjustment = 100 - totalPercentage;
            normalizedEmotions[0][1] += adjustment;
        }

        // Round percentages to integers and ensure they still sum to 100
        let roundedEmotions = normalizedEmotions.map(([emotion, pct]) => [emotion, Math.round(pct)]);
        
        // Fix rounding discrepancies to ensure exact 100% sum
        let roundedTotal = roundedEmotions.reduce((sum, [_, pct]) => sum + pct, 0);
        if (roundedTotal !== 100) {
            const difference = 100 - roundedTotal;
            // Distribute the difference to the largest emotion(s)
            roundedEmotions[0][1] += difference;
        }

        // Format the final output
        const formattedEmotions = roundedEmotions
            .filter(([_, pct]) => pct > 0) // Remove any emotions that rounded to 0%
            .map(([emotion, pct]) => 
                `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} ${pct}%`
            )
            .join(', ');

        return formattedEmotions || "Neutral";
    }

    async function handleAnalyze() {
        if (!sentenceInput || !analyzedMessageOutput) {
            console.error("Missing input or output elements for analysis.");
            return;
        }

        const text = sentenceInput.value.trim();
        const name = userNameInput ? userNameInput.value.trim() : "";

        if (!text) {
            alert("Please enter some text to analyze.");
            return;
        }

        showLoading();
        try {
            const emotions = await analyzeText(text);
            if (!emotions) throw new Error("Could not analyze text for sentence.");
            
            const words = text.split(/\s+/).filter(w => w.length > 0);

            // Update word count
            const wordCountEl = document.getElementById('wordCount');
            if (wordCountEl) {
                wordCountEl.textContent = words.length;
            }

            // Update tone with precise 100% normalization
            const toneTypeEl = document.getElementById('toneType');
            if (toneTypeEl && emotions) {
                const normalizedTone = calculateNormalizedTone(emotions);
                toneTypeEl.textContent = normalizedTone;
            }

            // Generate new artwork
            if (artGenerator) {
                const newArt = artGenerator.generateArt({
                    wordCount: words.length,
                    date: new Date(),
                    author: name || "None",
                    emotions: emotions,
                    totalWords: words.length
                });

                // Update background with latest canvas
                if (generatedArtCanvas) {
                    requestAnimationFrame(()=>{
                        updateGeneratedArt(generatedArtCanvas.toDataURL(), emotions);
                        // Store emotions globally for later use when animation stops
                        window.lastGeneratedEmotions = emotions;
                    });
                }
            }

            // Process word emotions and render
            const wordEmotions = await Promise.all(
                words.map(word => analyzeText(word).catch(e => fallbackEmotionScores(word)))
            );
            renderWordEmotions(words, wordEmotions, emotions);

        } catch (error) {
            console.error("Analysis failed:", error);
            if (analyzedMessageOutput) {
                analyzedMessageOutput.innerHTML = "<p style='color:red;'>Analysis failed. Please try again.</p>";
            }
        } finally {
            hideLoading();
        }
    }

    async function analyzeText(text) {
        if (!text) return fallbackEmotionScores(text);
        
        try {
            // Get base emotion scores
            const baseScores = await getBaseEmotionScores(text);
            if (!baseScores) return fallbackEmotionScores(text);

            // Get deeper understanding
            const understanding = await getUnderstanding(text);
            
            // Enhance scores with context and patterns
            const enhancedScores = await enhanceEmotionScores(baseScores, understanding, text);
            
            // Add to emotional memory
            emotionalMemory.addEmotion(enhancedScores);
            
            // Get emotional trend
            const trend = emotionalMemory.getEmotionalTrend();
            
            // Final processing with trend analysis
            return processFinalScores(enhancedScores, trend, text);
        } catch (error) {
            console.error("Error in emotion analysis:", error);
            return fallbackEmotionScores(text);
        }
    }
    
    async function getBaseEmotionScores(text) {
        const token = getHFToken();
        if (!token) {
            console.warn('No API token available for emotion analysis');
            return null;
        }
        
        const response = await fetch(SENTIMENT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) return null;

        const results = await response.json();
        if (!Array.isArray(results) || !results[0] || !Array.isArray(results[0])) return null;

        const scores = {};
        results[0].forEach(item => {
            if (item && typeof item.label === 'string' && typeof item.score === 'number') {
                scores[item.label.toLowerCase()] = item.score;
            }
        });

        return Object.keys(scores).length > 0 ? scores : null;
    }

    async function getUnderstanding(text) {
        const token = getHFToken();
        if (!token) {
            console.warn('No API token available for understanding analysis');
            return null;
        }
        
        try {
            const response = await fetch(UNDERSTANDING_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: {
                        text: text,
                        labels: ["positive", "negative", "excited", "calm", "certain", "uncertain"]
                    }
                }),
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.warn("Understanding analysis failed:", error);
            return null;
        }
    }

    function enhanceEmotionScores(baseScores, understanding, text) {
        const enhancedScores = { ...baseScores };
        const textLower = text.toLowerCase();
        const words = textLower.split(/\s+/);

        // Process intensity patterns
        processIntensityPatterns(enhancedScores, textLower);

        // Process emotional transitions
        processEmotionalTransitions(enhancedScores, textLower);

        // Process emotional states
        processEmotionalStates(enhancedScores, textLower);

        // Process personality traits
        processPersonalityTraits(enhancedScores, textLower);

        // Process context patterns
        processContextPatterns(enhancedScores, textLower, words);

        // Process emotion combinations
        processEmotionCombinations(enhancedScores);

        /* ------------------------------
         * Detect expressions of LOVE
         * ------------------------------*/
        if (!('love' in enhancedScores)) enhancedScores.love = 0;

        // Strong love phrases
        const strongLovePatterns = [
            /\bi love you\b/,
            /\blove u\b/,
            /❤️/,
            /💕/,
            /💖/,
            /😍/,
            /😘/,
            /\badore you\b/,
            /\bi adore\b/,
            /\bmy love\b/
        ];

        // General love words
        const mildLovePatterns = [
            /\blove\b/,
            /\bloving\b/,
            /\blovely\b/,
            /\baffection\b/,
            /\bdarling\b/,
            /\bsweetheart\b/,
            /\bbeloved\b/, 
            /\bcherish\b/
        ];

        strongLovePatterns.forEach(re => {
            if (re.test(textLower)) {
                enhancedScores.love = Math.min(1, enhancedScores.love + 0.7);
            }
        });

        mildLovePatterns.forEach(re => {
            if (re.test(textLower)) {
                enhancedScores.love = Math.min(1, enhancedScores.love + 0.3);
            }
        });

        // Apply understanding if available
        if (understanding && understanding.scores) {
            applyUnderstandingScores(enhancedScores, understanding.scores);
        }

        return enhancedScores;
    }

    function processIntensityPatterns(scores, text) {
        let intensityMultiplier = 1;

        Object.entries(emotionalPatterns.intensifiers).forEach(([level, words]) => {
            const matches = words.filter(word => text.includes(word));
            if (matches.length > 0) {
                intensityMultiplier *= level === 'extreme' ? 1.5 :
                                     level === 'strong' ? 1.3 : 1.1;
            }
        });

        Object.keys(scores).forEach(emotion => {
            scores[emotion] = Math.min(1, scores[emotion] * intensityMultiplier);
        });
    }

    function processEmotionalTransitions(scores, text) {
        Object.entries(emotionalPatterns.emotionalTransitions).forEach(([type, patterns]) => {
            if (patterns.some(pattern => text.includes(pattern))) {
                switch(type) {
                    case 'sudden':
                        // Amplify surprise and strong emotions
                        if (scores.surprise) scores.surprise = Math.min(1, scores.surprise * 1.3);
                        break;
                    case 'gradual':
                        // Moderate extreme emotions
                        Object.keys(scores).forEach(emotion => {
                            if (scores[emotion] > 0.7) scores[emotion] *= 0.9;
                        });
                        break;
                    case 'contrast':
                        // Allow for more emotional complexity
                        Object.keys(scores).forEach(emotion => {
                            if (scores[emotion] < 0.3) scores[emotion] *= 1.2;
                        });
                        break;
                }
            }
        });
    }

    function processEmotionalStates(scores, text) {
        Object.entries(emotionalPatterns.emotionalStates).forEach(([state, patterns]) => {
            if (patterns.some(pattern => text.includes(pattern))) {
                switch(state) {
                    case 'persistent':
                        // Strengthen primary emotions
                        Object.entries(scores)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 2)
                            .forEach(([emotion]) => {
                                scores[emotion] = Math.min(1, scores[emotion] * 1.2);
                            });
                        break;
                    case 'temporary':
                        // Moderate all emotions slightly
                        Object.keys(scores).forEach(emotion => {
                            scores[emotion] *= 0.9;
                        });
                        break;
                    case 'recurring':
                        // Enhance emotional persistence
                        Object.keys(scores).forEach(emotion => {
                            if (scores[emotion] > 0.5) {
                                scores[emotion] = Math.min(1, scores[emotion] * 1.15);
                            }
                        });
                        break;
                }
            }
        });
    }

    function processPersonalityTraits(scores, text) {
        Object.entries(emotionalPatterns.personalityTraits).forEach(([trait, patterns]) => {
            if (patterns.some(pattern => text.includes(pattern))) {
                switch(trait) {
                    case 'optimistic':
                        if (scores.joy) scores.joy = Math.min(1, scores.joy * 1.2);
                        if (scores.sadness) scores.sadness *= 0.8;
                        break;
                    case 'pessimistic':
                        if (scores.sadness) scores.sadness = Math.min(1, scores.sadness * 1.2);
                        if (scores.joy) scores.joy *= 0.8;
                        break;
                    case 'sensitive':
                        // Amplify emotional range
                        Object.keys(scores).forEach(emotion => {
                            scores[emotion] = Math.min(1, scores[emotion] * 1.15);
                        });
                        break;
                }
            }
        });
    }

    function processContextPatterns(scores, text, words) {
        // Process personal context
        const personalContext = analyzePersonalContext(words);
        if (personalContext.self > personalContext.others) {
            // Strengthen emotional intensity for self-reference
            Object.keys(scores).forEach(emotion => {
                scores[emotion] = Math.min(1, scores[emotion] * 1.2);
            });
        }

        // Process temporal context
        const temporalContext = analyzeTemporalContext(words);
        if (temporalContext.present > temporalContext.past && temporalContext.present > temporalContext.future) {
            // Strengthen immediate emotions
            Object.keys(scores).forEach(emotion => {
                if (scores[emotion] > 0.3) {
                    scores[emotion] = Math.min(1, scores[emotion] * 1.15);
                }
            });
        }

        // Process certainty
        const certaintyLevel = analyzeCertainty(words);
        if (certaintyLevel === 'high') {
            // Strengthen confident emotions
            Object.keys(scores).forEach(emotion => {
                if (scores[emotion] > 0.5) {
                    scores[emotion] = Math.min(1, scores[emotion] * 1.2);
                }
            });
        }
    }

    function analyzePersonalContext(words) {
        const counts = { self: 0, others: 0 };
        words.forEach(word => {
            if (contextPatterns.personal.self.includes(word)) counts.self++;
            if (contextPatterns.personal.others.includes(word)) counts.others++;
        });
        return counts;
    }

    function analyzeTemporalContext(words) {
        const counts = { past: 0, present: 0, future: 0 };
        words.forEach(word => {
            if (contextPatterns.temporal.past.includes(word)) counts.past++;
            if (contextPatterns.temporal.present.includes(word)) counts.present++;
            if (contextPatterns.temporal.future.includes(word)) counts.future++;
        });
        return counts;
    }

    function analyzeCertainty(words) {
        const counts = { high: 0, medium: 0, low: 0 };
        words.forEach(word => {
            if (contextPatterns.certainty.high.includes(word)) counts.high++;
            if (contextPatterns.certainty.medium.includes(word)) counts.medium++;
            if (contextPatterns.certainty.low.includes(word)) counts.low++;
        });
        return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0];
    }

    function processEmotionCombinations(scores) {
        Object.entries(emotionCombinations).forEach(([combination, config]) => {
            const [emotion1, emotion2] = combination.split('+');
            if (scores[emotion1] && scores[emotion2] &&
                scores[emotion1] >= config.threshold && 
                scores[emotion2] >= config.threshold) {
                
                const combinedScore = (scores[emotion1] + scores[emotion2]) / 2 * config.multiplier;
                scores[config.label.toLowerCase()] = Math.min(1, combinedScore);
            }
        });
    }

    function applyUnderstandingScores(scores, understandingScores) {
        const [posScore, negScore, excitedScore, calmScore, certainScore, uncertainScore] = understandingScores;

        if (posScore > 0.7) {
            ['joy', 'excitement', 'delight'].forEach(emotion => {
                if (scores[emotion]) scores[emotion] = Math.min(1, scores[emotion] * 1.2);
            });
        }

        if (excitedScore > 0.7) {
            if (scores.excitement) scores.excitement = Math.min(1, scores.excitement * 1.3);
            if (scores.surprise) scores.surprise = Math.min(1, scores.surprise * 1.2);
        }

        if (certainScore > 0.7) {
            // Strengthen the strongest emotion
            const maxEmotion = Object.entries(scores)
                .reduce((max, [key, val]) => val > max[1] ? [key, val] : max, ['', 0]);
            if (maxEmotion[1] > 0) {
                scores[maxEmotion[0]] = Math.min(1, maxEmotion[1] * 1.2);
            }
        }
    }

    function processFinalScores(scores, trend, text) {
        const finalScores = { ...scores };

        // Apply trend analysis if available
        if (trend) {
            Object.keys(finalScores).forEach(emotion => {
                if (trend[emotion]) {
                    // Smooth sudden changes based on trend
                    const trendValue = trend[emotion];
                    const currentValue = finalScores[emotion];
                    finalScores[emotion] = (currentValue * 0.7 + trendValue * 0.3);
                }
            });
        }

        // Ensure all scores are valid
        Object.keys(finalScores).forEach(emotion => {
            finalScores[emotion] = Math.max(0, Math.min(1, finalScores[emotion]));
        });

        return finalScores;
    }
    
    function renderWordEmotions(words, wordResults, sentenceEmotionContext) {
        if (!analyzedMessageOutput) return;
        analyzedMessageOutput.innerHTML = ""; 

        const textFlowContainer = document.createElement('div'); 
        analyzedMessageOutput.appendChild(textFlowContainer);

        // Track which animation type (emotion) has already been applied
        const usedAnimations = new Set();

        // Character count based line wrapping
        let currentLineChars = 0;
        let currentLineWords = 0;

        words.forEach((word, index) => {
            const wordWrapper = document.createElement('span');
            wordWrapper.className = 'word-flow-wrapper';

            const wordSpan = document.createElement('span'); 
            wordSpan.className = 'wordSpan'; 

            // Get emotion data
            const emotions = wordResults[index]; 
            let dominantEmotionName = 'neutral'; 
            let dominantEmotionScore = 0;

            if (emotions && Object.keys(emotions).length > 0) {
                const sortedEmotions = Object.entries(emotions).sort(([,a],[,b]) => b-a);
                if (sortedEmotions.length > 0 && sortedEmotions[0][1] > 0.25) { 
                    dominantEmotionName = sortedEmotions[0][0].toLowerCase();
                    dominantEmotionScore = sortedEmotions[0][1];
                }
            }

            // If adding this word would exceed 30 characters in the current line, break line first
            const exceedsCharLimit = currentLineChars > 0 && (currentLineChars + word.length) > 30;
            const exceedsWordLimit = currentLineWords >= 5;
            if (exceedsCharLimit || exceedsWordLimit) {
                textFlowContainer.appendChild(document.createElement('br'));
                currentLineChars = 0;
                currentLineWords = 0;
            }

            // Split word into characters and create spans for each
            if (word.toLowerCase() === "amazing") {
                wordSpan.classList.add('word-amazing');
                Array.from(word).forEach((char, charIndex) => {
                    const letterSpan = document.createElement('span');
                    letterSpan.textContent = char;
                    letterSpan.style.animationName = 'amazingBreathing';
                    letterSpan.style.animationDuration = '2s';
                    letterSpan.style.animationDelay = `${charIndex * 0.1}s`;
                    letterSpan.style.animationIterationCount = 'infinite';
                    letterSpan.style.animationTimingFunction = 'ease-in-out';
                    letterSpan.style.fontWeight = '200';
                    letterSpan.style.fontVariationSettings = "'wght' 200, 'wdth' 120";
                    wordSpan.appendChild(letterSpan);
                });
            } else if (
                word.toLowerCase() !== "i" &&
                dominantEmotionName !== 'neutral' &&
                dominantEmotionName !== 'LABEL_0' &&
                dominantEmotionName !== 'LABEL_1' &&
                dominantEmotionName !== 'LABEL_2' &&
                !usedAnimations.has(dominantEmotionName)
            ) {
                // Apply animation only if this emotion hasn't been animated yet
                usedAnimations.add(dominantEmotionName);
                wordSpan.classList.add(`emotion-${dominantEmotionName}`);
                Array.from(word).forEach((char, charIndex) => {
                    const letterSpan = document.createElement('span');
                    letterSpan.textContent = char;
                    letterSpan.classList.add('animated');
                    letterSpan.style.animationName = dominantEmotionName;
                    letterSpan.style.animationDuration = '1.8s';
                    letterSpan.style.animationDelay = `${charIndex * 0.1}s`;
                    letterSpan.style.animationIterationCount = 'infinite';
                    letterSpan.style.animationTimingFunction = 'ease-in-out';
                    letterSpan.style.fontWeight = '200';
                    letterSpan.style.fontVariationSettings = "'wght' 200, 'wdth' 120";
                    wordSpan.appendChild(letterSpan);
                });
            } else {
                // For neutral words, still split into characters but don't animate
                Array.from(word).forEach(char => {
                    const letterSpan = document.createElement('span');
                    letterSpan.textContent = char;
                    letterSpan.style.fontWeight = '200';
                    letterSpan.style.fontVariationSettings = "'wght' 200, 'wdth' 120";
                    wordSpan.appendChild(letterSpan);
                });
            }

            wordWrapper.appendChild(wordSpan);
            textFlowContainer.appendChild(wordWrapper);
            
            if (index < words.length - 1) { 
                textFlowContainer.appendChild(document.createTextNode(' ')); // normal space
            }

            // Update character count (include space after word)
            currentLineChars += word.length + 1;
            currentLineWords += 1;
        });

        addHoverEffectsToWords();
    }

    function showLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
    }

    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    // Speak functionality (optional, from text_test)
    // function handleSpeak() {
    //     const text = sentenceInput.value.trim();
    //     if (!text) {
    //         alert("Please enter some text to speak.");
    //         return;
    //     }
    //     if ('speechSynthesis' in window) {
    //         const utterance = new SpeechSynthesisUtterance(text);
    //         // Optional: configure voice, pitch, rate
    //         // const voices = window.speechSynthesis.getVoices();
    //         // utterance.voice = voices.find(v => v.lang === 'en-US'); // Example
    //         utterance.pitch = 1;
    //         utterance.rate = 1;
    //         window.speechSynthesis.speak(utterance);
    //     } else {
    //         alert("Sorry, your browser does not support text-to-speech.");
    //     }
    // }
    // const speakBtn = document.getElementById('speakBtn'); // Assuming a speak button could be added
    // if (speakBtn) speakBtn.addEventListener('click', handleSpeak);


    // --- Adapt original mouse hover effects ---
    let currentHoverTarget = null;

    function addHoverEffectsToWords() {
        // Hover effects disabled for neutral layout
        return;
    }
    
    // Initial message display can be an example or empty
    // renderWordEmotions(["Welcome!"], [fallbackEmotionScores("Welcome!")], fallbackEmotionScores("Welcome!"));


    // Original map and sin functions (if still needed by any remaining p5 logic)
    window.map = (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    };
    window.sin = Math.sin;
    window.cos = Math.cos; // Might be useful too

    // Function to display the original static message as a placeholder
    function displayStaticPlaceholderMessage() {
        if (!analyzedMessageOutput) return;

        // Clear previous placeholder and cancel animations
        analyzedMessageOutput.innerHTML = '';
        if (staticAmazingAnimationId) {
            cancelAnimationFrame(staticAmazingAnimationId);
            staticAmazingAnimationId = null;
        }

        // Simple neutral placeholder message
        const placeholder = document.createElement('p');
        placeholder.style.fontSize = '25px';
        placeholder.style.opacity = '1';
        placeholder.style.color = '#515151';
        placeholder.style.textAlign = 'left';
        placeholder.style.fontFamily = 'SF-Pro, sans-serif';
        placeholder.style.fontVariationSettings = "'wdth' 120";
        placeholder.style.lineHeight = '1.4';

        // Build text with heavier weight on "Record" and "Type"
        const recordSpan = document.createElement('span');
        recordSpan.textContent = 'Record';
        recordSpan.style.fontWeight = '600';
        recordSpan.style.fontVariationSettings = "'wght' 600, 'wdth' 120";

        const slashText = document.createTextNode(' / ');

        const typeSpan = document.createElement('span');
        typeSpan.textContent = 'Type';
        typeSpan.style.fontWeight = '600';
        typeSpan.style.fontVariationSettings = "'wght' 600, 'wdth' 120";

        const restText = document.createTextNode(' your message and hit "Generate"');

        placeholder.appendChild(recordSpan);
        placeholder.appendChild(slashText);
        placeholder.appendChild(typeSpan);
        placeholder.appendChild(restText);

        analyzedMessageOutput.appendChild(placeholder);
        analyzedMessageOutput.style.textAlign = 'left';
    }

    // Add minimize/maximize functionality
    const card = document.querySelector('.card');
    const layoutInfoBottom = document.querySelector('.layout-info-bottom');
    const arrow = document.querySelector('.arrow');
    
    if (layoutInfoBottom && card) {
        layoutInfoBottom.addEventListener('click', () => {
            card.classList.toggle('minimized');
        });
    }

    // Helper function to get opposite emotions
    function getOppositeEmotion(emotion) {
        const opposites = {
            'joy': 'sadness',
            'sadness': 'joy',
            'anger': 'joy',
            'fear': 'joy',
            'surprise': null, // Surprise can be both positive or negative
            'disgust': 'joy',
            'flirty': 'disgust'
        };
        return opposites[emotion] || null;
    }
});

// Ensure p5.js setup and draw are called if p5.js is loaded and expected.
// If p5.js is not part of this page/project scope anymore, these can be removed.
// If setup/draw are defined, p5 will call them automatically if it's included.
// The DOMContentLoaded listener above manually calls setup() for non-canvas p5 usage.

// Add new metaphor and expression patterns
const metaphorPatterns = {
    intensity: {
        explosion: ["explode", "burst", "blow up"],
        overflow: ["overflow", "flood", "pour out"],
        pressure: ["pressure", "building up", "cant contain"],
        fire: ["burning", "on fire", "flame"]
    },
    states: {
        height: ["over the moon", "flying", "floating", "sky high"],
        depth: ["deep", "bottomless", "ocean of"],
        movement: ["jumping", "dancing", "bouncing"],
        physical: ["stomach butterflies", "heart racing", "chest tight"]
    }
};

// Add emotional idioms database
const emotionalIdioms = {
    joy: {
        extreme: ["over the moon", "on cloud nine", "walking on air", "seventh heaven"],
        excitement: ["bouncing off the walls", "cant contain myself", "gonna explode", "burst with"],
        satisfaction: ["pleased as punch", "happy as a clam", "grinning ear to ear"]
    },
    sadness: {
        extreme: ["world is ending", "heart is broken", "in pieces", "falling apart"],
        depression: ["blue as can be", "down in the dumps", "under the weather"],
        disappointment: ["heart sank", "crushed me", "let down"]
    },
    anger: {
        extreme: ["blood is boiling", "seeing red", "lost it", "hit the roof"],
        frustration: ["at my wits end", "driving me crazy", "had it up to here"],
        irritation: ["getting under my skin", "rubbing me wrong", "ticking me off"]
    }
};

// Add emotional context patterns
const contextPatterns = {
    personal: {
        self: ["i", "me", "my", "myself", "mine"],
        others: ["you", "they", "he", "she", "them"],
        relationship: ["friend", "family", "partner", "colleague", "loved"]
    },
    temporal: {
        past: ["was", "had", "did", "used to", "remember", "ago"],
        present: ["is", "am", "are", "doing", "happening", "now"],
        future: ["will", "going to", "planning", "hope", "expect"]
    },
    certainty: {
        high: ["definitely", "certainly", "absolutely", "surely", "undoubtedly"],
        medium: ["probably", "likely", "maybe", "perhaps", "possibly"],
        low: ["unsure", "uncertain", "doubt", "wonder", "guess"]
    }
};

// Add emotional context memory
let emotionalMemory = {
    recentEmotions: [],
    contextWindow: 5, // Remember last 5 analyses
    addEmotion(emotion) {
        this.recentEmotions.unshift(emotion);
        if (this.recentEmotions.length > this.contextWindow) {
            this.recentEmotions.pop();
        }
    },
    getEmotionalTrend() {
        if (this.recentEmotions.length === 0) return null;
        
        const emotionCounts = {};
        this.recentEmotions.forEach(emotion => {
            Object.entries(emotion).forEach(([key, value]) => {
                if (!emotionCounts[key]) emotionCounts[key] = [];
                emotionCounts[key].push(value);
            });
        });
        
        return Object.entries(emotionCounts).reduce((acc, [emotion, values]) => {
            acc[emotion] = values.reduce((sum, val) => sum + val, 0) / values.length;
            return acc;
        }, {});
    }
};

// Enhanced emotional patterns
const emotionalPatterns = {
    intensifiers: {
        extreme: ["absolutely", "completely", "totally", "utterly", "extremely", "incredibly", "insanely"],
        strong: ["very", "really", "so", "truly", "deeply", "highly", "seriously"],
        moderate: ["quite", "rather", "fairly", "pretty", "somewhat", "kind of", "sort of"]
    },
    emotionalTransitions: {
        sudden: ["suddenly", "all of a sudden", "out of nowhere", "instantly", "immediately"],
        gradual: ["gradually", "slowly", "bit by bit", "over time", "eventually"],
        contrast: ["but", "however", "although", "despite", "even though", "nevertheless"]
    },
    emotionalStates: {
        persistent: ["always", "constantly", "forever", "continuously", "endlessly"],
        temporary: ["right now", "at the moment", "temporarily", "for now", "currently"],
        recurring: ["again", "once more", "keeps", "repeatedly", "over and over"]
    },
    personalityTraits: {
        optimistic: ["hopeful", "positive", "optimistic", "confident", "assured"],
        pessimistic: ["worried", "concerned", "doubtful", "pessimistic", "uncertain"],
        sensitive: ["sensitive", "emotional", "empathetic", "compassionate", "understanding"]
    }
};

// Add sophisticated emotion combinations
const emotionCombinations = {
    "joy+surprise": {
        label: "Delight",
        threshold: 0.6,
        multiplier: 1.2
    },
    "joy+fear": {
        label: "Excitement",
        threshold: 0.5,
        multiplier: 1.1
    },
    "sadness+anger": {
        label: "Frustration",
        threshold: 0.6,
        multiplier: 1.15
    },
    "surprise+fear": {
        label: "Shock",
        threshold: 0.7,
        multiplier: 1.25
    },
    "joy+sadness": {
        label: "Nostalgia",
        threshold: 0.5,
        multiplier: 1.1
    }
};

// === Force consistent title styling regardless of OS theme ===
function applyFixedTitleStyles() {
    // Base styles we want for all titles
    const titles = document.querySelectorAll('.edit-title, .preview-title, .share-title');
    titles.forEach(t => {
        t.style.color = 'rgb(255, 255, 255)';         // white text
        t.style.mixBlendMode = 'overlay';             // blend like dark-mode look
        t.style.position = 'fixed';                   // ensure our CSS layout sticks
        t.style.zIndex = '10000';                     // stay on top
    });
    // No duplicate titles to hide - cleaned up implementation uses only primary titles
}

