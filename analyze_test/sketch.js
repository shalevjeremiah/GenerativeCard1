// Hugging Face API constants from text_test/script.js
const HF_API_TOKEN = "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"; // Consider security implications
const SENTIMENT_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"; // Reverting to more reliable model
const UNDERSTANDING_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"; // For natural language understanding

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

function updateGeneratedArt(artDataUrl) {
    // Update the CSS variable for all instances
    document.documentElement.style.setProperty('--generated-art-url', `url(${artDataUrl})`);
    
    // Add class to indicate art is generated
    document.body.classList.add('art-generated');
    
    // Update main image
    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
        mainImage.src = artDataUrl;
    }
}

function initializeArtGenerator() {
    console.log('Initializing art generator...');
    try {
        generatedArtCanvas = document.createElement('canvas');
        artGenerator = new ArtGenerator(generatedArtCanvas);
        console.log('Art generator created successfully');

        // Generate initial art
        const mainImage = document.querySelector('.main-image');
        console.log('Main image element:', mainImage);
        
        if (mainImage) {
            console.log('Generating initial art...');
            const initialArt = artGenerator.generateArt({
                wordCount: 10,
                date: new Date(),
                author: "Shalev Jeremiah",
                emotions: { joy: 0.5, surprise: 0.3 },
                totalWords: 10
            });
            console.log('Initial art generated');
            
            // Update all instances of the art
            updateGeneratedArt(initialArt);
            console.log('Art updated everywhere');
        } else {
            console.error('Main image element not found');
        }
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
            const name = event.target.value.trim();
            const madeByP = document.querySelector('.layout-info-bottom .text-box:first-child p');
            if (madeByP) {
                madeByP.textContent = name ? name : "Shalev Jeremiah"; // Revert to default if empty
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
            const emotions = await analyzeText(text);
            
            // Generate new artwork
            const newArt = artGenerator.generateArt({
                wordCount: words.length,
                date: new Date(),
                author: name || "Shalev Jeremiah",
                emotions: emotions,
                totalWords: words.length
            });
            
            // Update all instances of the art
            updateGeneratedArt(newArt);
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
                    author: name || "Shalev Jeremiah",
                    emotions: emotions,
                    totalWords: words.length
                });

                // Update all instances of the art
                updateGeneratedArt(newArt);
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
            const response = await fetch(SENTIMENT_URL, {
                method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
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
        try {
            const response = await fetch(UNDERSTANDING_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_TOKEN}`,
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
                    wordSpan.appendChild(letterSpan);
                });
            } else if (word.toLowerCase() !== "i" && dominantEmotionName !== 'neutral' && dominantEmotionName !== 'LABEL_0' && dominantEmotionName !== 'LABEL_1' && dominantEmotionName !== 'LABEL_2') {
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
                    wordSpan.appendChild(letterSpan);
                });
            } else {
                // For neutral words, still split into characters but don't animate
                Array.from(word).forEach(char => {
                    const letterSpan = document.createElement('span');
                    letterSpan.textContent = char;
                    wordSpan.appendChild(letterSpan);
                });
            }

            wordWrapper.appendChild(wordSpan);
            textFlowContainer.appendChild(wordWrapper);
            
            if (index < words.length - 1) { 
                textFlowContainer.appendChild(document.createTextNode(' '));
            }
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
        if (!analyzedMessageOutput) return;
        const wordSpans = analyzedMessageOutput.querySelectorAll('.wordSpan');

        wordSpans.forEach(wordSpan => {
            wordSpan.addEventListener('mousemove', (e) => {
                // Simplified hover: scale the wordSpan itself
                // More complex letter-based hover would require renderWordEmotions to create letter spans
                // and then target them here.
                if (currentHoverTarget !== e.currentTarget) {
                    if (currentHoverTarget) {
                        currentHoverTarget.style.transform = 'scale(1)';
                        currentHoverTarget.style.zIndex = '0';
                    }
                    currentHoverTarget = e.currentTarget;
                }
                e.currentTarget.style.transform = 'scale(1.15)'; // Slightly larger scale
                e.currentTarget.style.zIndex = '10'; // Bring to front
                 // The font-variation settings for hover can be added if desired.
            });

            wordSpan.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '0';
                if (currentHoverTarget === e.currentTarget) {
                    currentHoverTarget = null;
                }
            });
        });
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
        analyzedMessageOutput.innerHTML = ''; // Clear current content

        // Cancel any previous static animation loop
        if (staticAmazingAnimationId) {
            cancelAnimationFrame(staticAmazingAnimationId);
            staticAmazingAnimationId = null;
        }
        staticAmazingFrameCount = 0;

        const linesStructure = [
            {
                words: [
                    { text: 'I', FVS: `'wght' 200, 'wdth' 75`, spaceClass: 'word-space' },
                    { text: 'just', FVS: `'wght' 200, 'wdth' 75`, spaceClass: 'word-space' },
                    { text: 'wanted', FVS: `'wght' 200, 'wdth' 75`, spaceClass: 'word-space' },
                    { text: 'to', FVS: `'wght' 300, 'wdth' 100`, spaceClass: 'word-space' }, // Adjusted from 200 to 300 based on summary
                    { text: 'say', FVS: `'wght' 300, 'wdth' 150`, spaceClass: 'word-space' }, // Adjusted space class logic
                    { text: 'that', FVS: `'wght' 300, 'wdth' 100`, spaceClass: '' } // Adjusted from 200 to 300
                ]
            },
            {
                words: [
                    { text: 'you', FVS: `'wght' 500, 'wdth' 100`, spaceClass: 'word-space-extended' },
                    { text: 'look', FVS: `'wght' 300, 'wdth' 100`, spaceClass: 'word-space-extended' }, // Adjusted from 200 to 300
                    { text: 'amazing', isAmazing: true, spaceClass: '' }
                ]
            }
        ];

        linesStructure.forEach(lineData => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line';
            lineData.words.forEach((wordData, index) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word'; // General class for a word

                if (wordData.isAmazing) {
                    wordSpan.classList.add('word-amazing');
                    wordData.text.split('').forEach(char => {
                        const letterSpan = document.createElement('span');
                        letterSpan.textContent = char;
                        wordSpan.appendChild(letterSpan);
                    });
                } else {
                    wordSpan.textContent = wordData.text;
                    if (wordData.FVS) {
                        wordSpan.style.fontVariationSettings = wordData.FVS;
                    }
                }
                lineDiv.appendChild(wordSpan);

                if (wordData.spaceClass) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = wordData.spaceClass; 
                    // CSS should define margin for these classes, or add non-breaking space if needed
                    // For example: spaceSpan.innerHTML = '&nbsp;'; if it implies actual space character
                    lineDiv.appendChild(spaceSpan);
                }
            });
            analyzedMessageOutput.appendChild(lineDiv);
        });

        // Start animation for the "amazing" word in the static placeholder
        const amazingLetterSpans = analyzedMessageOutput.querySelectorAll('.word-amazing span');
        
        function animateStaticAmazing() {
            staticAmazingFrameCount++;
            amazingLetterSpans.forEach((letter, index) => {
                const timeOffset = staticAmazingFrameCount * 0.05 - index * letterDelay;
                const weight = map(sin(timeOffset), -1, 1, 200, 700);
                const width = map(sin(timeOffset * 0.8), -1, 1, 130, 150); // As per original summary
                const optical = map(sin(timeOffset * 0.6), -1, 1, 14, 72); // opsz typically 14-72
                letter.style.fontVariationSettings = `\'wght\' ${weight}, \'wdth\' ${width}, \'opsz\' ${optical}`;
            });
            staticAmazingAnimationId = requestAnimationFrame(animateStaticAmazing);
        }

        if (amazingLetterSpans.length > 0) {
            animateStaticAmazing();
        }

        // Add original hover effects for the static message
        addStaticMessageHoverEffects(); 
    }

    function addStaticMessageHoverEffects() {
        if (!analyzedMessageOutput) return;
        const allSpans = analyzedMessageOutput.querySelectorAll('.word > span, .word'); // Target letters in amazing, or whole words
        const radius = 70; // Scaled from an assumed original of 150, adjust as needed

        analyzedMessageOutput.addEventListener('mousemove', handleStaticMouseMove);
        analyzedMessageOutput.addEventListener('mouseleave', handleStaticMouseLeave);

        function handleStaticMouseMove(e) {
            const bounds = analyzedMessageOutput.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;

            allSpans.forEach(span => {
                const spanRect = span.getBoundingClientRect();
                const spanCenterX = (spanRect.left - bounds.left) + spanRect.width / 2;
                const spanCenterY = (spanRect.top - bounds.top) + spanRect.height / 2;
                const distX = mouseX - spanCenterX;
                const distY = mouseY - spanCenterY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < radius) {
                    const scaleFactor = map(distance, 0, radius, 1.2, 1); // Max scale 1.2
                    span.style.transform = `scale(${scaleFactor})`;
                    span.style.zIndex = '1';
                } else {
                    span.style.transform = 'scale(1)';
                    span.style.zIndex = '0';
                }
            });
        }

        function handleStaticMouseLeave() {
            allSpans.forEach(span => {
                span.style.transform = 'scale(1)';
                span.style.zIndex = '0';
            });
        }
    }

    // Function to remove static message hover effects (to be called before rendering analyzed text)
    function removeStaticMessageHoverEffects() {
        if (!analyzedMessageOutput) return;
        // Placeholder: actual removal of listeners might be complex if anonymous. 
        // Simpler to just let `innerHTML` clear them if they were attached to children.
        // If listeners are on analyzedMessageOutput itself, they need explicit removal.
        // For now, assuming the clear of innerHTML and re-adding different listeners for analyzed content is enough.
        // analyzedMessageOutput.removeEventListener('mousemove', handleStaticMouseMove); // This would need handleStaticMouseMove to be accessible
        // analyzedMessageOutput.removeEventListener('mouseleave', handleStaticMouseLeave);
    }

    // Add minimize/maximize functionality
    const card = document.querySelector('.card');
    const layoutInfoBottom = document.querySelector('.layout-info-bottom');
    const arrow = document.querySelector('.arrow');
    
    if (layoutInfoBottom && card) {
        layoutInfoBottom.addEventListener('click', () => {
            card.classList.toggle('minimized');
            
            // Force a reflow to ensure smooth animation
            void card.offsetHeight;
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
