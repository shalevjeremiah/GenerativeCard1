// API URLs for emotion analysis - token managed by tokenManager.js
const SENTIMENT_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";
const ZERO_SHOT_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
const GO_EMO_URL = "https://api-inference.huggingface.co/models/joeddav/distilbert-base-uncased-go-emotions-student";

// Get API token from token manager
function getHFToken() {
    return window.getApiToken && window.getApiToken();
}

// DOM Elements
let textarea, analyzeBtn, speakBtn, summaryDiv, wordEmotionsDiv, loadingDiv;

// Mapping from GoEmotions labels → canonical categories we use throughout app
const GO_TO_CORE = {
    admiration: "love",
    amusement: "joy",
    anger: "anger",
    annoyance: "anger",
    approval: "trust",
    caring: "love",
    confusion: "surprise",
    curiosity: "surprise",
    desire: "flirty",
    disappointment: "sadness",
    disapproval: "anger",
    disgust: "disgust",
    embarrassment: "disgust",
    excitement: "joy",
    fear: "fear",
    gratitude: "trust",
    grief: "sadness",
    joy: "joy",
    love: "love",
    nervousness: "fear",
    optimism: "joy",
    pride: "joy",
    realization: "surprise",
    relief: "joy",
    remorse: "sadness",
    sadness: "sadness",
    surprise: "surprise",
    neutral: "neutral"
};

document.addEventListener("DOMContentLoaded", () => {
    textarea = document.querySelector("#textInput");
    analyzeBtn = document.querySelector("#analyzeBtn");
    speakBtn = document.querySelector("#speakBtn");
    summaryDiv = document.querySelector("#summary");
    wordEmotionsDiv = document.querySelector("#wordEmotions");
    loadingDiv = document.querySelector("#loading");

    analyzeBtn.addEventListener("click", handleAnalyze);
    speakBtn.addEventListener("click", handleSpeak);
});

async function handleAnalyze() {
    const text = textarea.value.trim();
    if (!text) {
        alert("Please enter some text to analyze.");
        return;
    }
    showLoading();
    try {
        const sentenceResult = await analyzeText(text, true);
        if (!sentenceResult) throw new Error("Could not analyze text.");
        const words = text.split(/\s+/).filter(w => w.length > 0);
        renderSummary(sentenceResult, words);
        try {
            const wordEmotions = await Promise.all(
                words.map(word => analyzeText(word.replace(/[^\w\s]/g, "")))
            );
            renderWordEmotions(words, wordEmotions);
        } catch (wordError) {
            console.warn("Word analysis section failed:", wordError);
            wordEmotionsDiv.innerHTML = "<p>Word-level analysis partially unavailable.</p>";
        }
    } catch (error) {
        console.error("Analysis failed:", error);
        const fallbackResults = fallbackEmotionScores(text);
        renderSummary(fallbackResults, text.split(/\s+/).filter(w => w.length > 0));
        wordEmotionsDiv.innerHTML = "<p>Using basic emotion detection. API service may be unavailable.</p>";
    } finally {
        hideLoading();
    }
}

async function analyzeText(text, useZeroShot = false) {
    if (!text) return fallbackEmotionScores(text);

    // First: call the base emotion model (roberta-distil)
    let robertaScores = {};
    const token = getHFToken();
    if (!token) {
        console.warn('No API token available for emotion analysis');
        return fallbackEmotionScores(text);
    }
    
    try {
        const response = await fetch(SENTIMENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ inputs: text })
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
                data[0].forEach(item => {
                    if (item && typeof item.label === "string" && typeof item.score === "number") {
                        robertaScores[item.label.toLowerCase()] = item.score;
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Base emotion model failed:", err);
    }

    // Optionally enrich with zero-shot multi-label classification
    let zeroShotScores = {};
    if (useZeroShot) {
        try {
            const candidateLabels = [
                "joy","sadness","anger","fear","surprise","disgust",
                "trust","anticipation","optimism","gratitude","love","excitement"
            ];
            const zsResp = await fetch(ZERO_SHOT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    inputs: text,
                    parameters: { candidate_labels: candidateLabels, multi_label: true }
                })
            });
            if (zsResp.ok) {
                const zsData = await zsResp.json();
                if (Array.isArray(zsData?.labels) && Array.isArray(zsData?.scores)) {
                    zsData.labels.forEach((lab, idx) => {
                        zeroShotScores[lab.toLowerCase()] = zsData.scores[idx];
                    });
                }
            }
        } catch (err) {
            console.warn("Zero-shot emotion enrichment failed:", err);
        }
    }

    // ---- GoEmotions ----
    let goScores = {};
    try {
        const goResp = await fetch(GO_EMO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ inputs: text })
        });
        if (goResp.ok) {
            const goData = await goResp.json();
            if (Array.isArray(goData) && goData.length && Array.isArray(goData[0])) {
                goData[0].forEach(item => {
                    if (item && typeof item.label === "string" && typeof item.score === "number") {
                        const core = GO_TO_CORE[item.label.toLowerCase()];
                        if (!core) return;
                        goScores[core] = Math.max(goScores[core] || 0, item.score); // keep highest for that core
                    }
                });
            }
        }
    } catch(err) {
        console.warn("GoEmotions enrichment failed", err);
    }

    // ---- Merge all three sources ----
    const merged = { ...robertaScores };
    const addOrBlend = (label, score, w) => {
        const base = merged[label] || 0;
        merged[label] = base * (1 - w) + score * w;
    };

    // blend zero-shot (0.2 weight)
    Object.entries(zeroShotScores).forEach(([lab, sc]) => addOrBlend(lab, sc, 0.2));
    // blend go emotions (0.3 weight)
    Object.entries(goScores).forEach(([lab, sc]) => addOrBlend(lab, sc, 0.3));

    // Normalise so the sum of scores ≈ 1
    const total = Object.values(merged).reduce((a, b) => a + b, 0);
    if (total > 0) {
        Object.keys(merged).forEach(k => merged[k] = merged[k] / total);
    }

    return Object.keys(merged).length > 0 ? merged : fallbackEmotionScores(text);
}

function renderSummary(results, words) {
    const significantEmotions = Object.entries(results)
        .filter(([_, score]) => score >= 0.20)
        .sort(([_, a], [__, b]) => b - a);
    
    if (significantEmotions.length === 0 && Object.keys(results).length > 0) {
        const topEmotion = Object.entries(results).sort(([_, a], [__, b]) => b - a)[0];
        if (topEmotion) significantEmotions.push(topEmotion);
    }

    let summaryHtml = '<div class="emotion-summary">';
    if (significantEmotions.length > 0) {
        const [domName, domScore] = significantEmotions[0];
        summaryHtml += `<div class="emotion-${domName.toLowerCase()}"><strong>Dominant:</strong> ${Array.from(domName).map((char, i) => 
            `<span class="animated" style="animation-name:${domName.toLowerCase()};animation-duration:1.8s;animation-timing-function:ease-in-out;animation-delay:${i*0.06}s;animation-iteration-count:infinite;">${char}</span>`).join('')} (${(domScore*100).toFixed(0)}%)</div>`;
        if (significantEmotions.length > 1) {
            const [secName, secScore] = significantEmotions[1];
            summaryHtml += `<div class="emotion-${secName.toLowerCase()}"><strong>Secondary:</strong> ${Array.from(secName).map((char, i) => 
                `<span class="animated" style="animation-name:${secName.toLowerCase()};animation-duration:1.8s;animation-timing-function:ease-in-out;animation-delay:${i*0.06}s;animation-iteration-count:infinite;">${char}</span>`).join('')} (${(secScore*100).toFixed(0)}%)</div>`;
        }
    } else { 
        summaryHtml += `<div>No significant emotions detected.</div>`; 
    }
    
    const conflicting = detectConflictingEmotions(results);
    if (conflicting) summaryHtml += `<div class="emotion-conflict">${conflicting}</div>`;
    
    const advanced = detectAdvancedEmotions(results, words);
    if (advanced.length > 0) summaryHtml += `<div class="advanced-emotions">Patterns: ${advanced.join(", ")}</div>`;
    
    summaryHtml += '</div>';
    summaryDiv.innerHTML = summaryHtml;
}

function detectConflictingEmotions(results) {
    const pos = ['joy'], neg = ['sadness', 'anger', 'fear', 'disgust'];
    let hasPos = false, hasNeg = false, sigConflict = [];
    Object.entries(results).forEach(([emo, score]) => {
        if (score >= 0.15) {
            if (pos.includes(emo.toLowerCase())) hasPos = true;
            if (neg.includes(emo.toLowerCase())) hasNeg = true;
            sigConflict.push(emo);
        }
    });
    return hasPos && hasNeg ? `Mixed: ${sigConflict.join("+")}` : null;
}

const emotionLexicon = {
    joy: { pure_happiness: ["happy", "joyful"], excitement: ["excited", "thrilled"], contentment: ["content", "satisfied"], achievement: ["proud", "accomplished"], love_positive: ["love you", "loving"] },
    sadness: { grief: ["grief", "mourning"], depression: ["depressed", "hopeless"], disappointment: ["disappointed", "failed"], loneliness: ["lonely", "isolated"], heartache: ["heartache", "missing you"] },
    anger: { rage: ["furious", "outraged"], frustration: ["frustrated", "annoyed"], betrayal: ["betrayed", "deceived"], resentment: ["resent", "bitter"], indignation: ["unfair", "absurd"] },
    fear: { terror: ["terrified", "horrified"], anxiety: ["anxious", "worried"], dread: ["dread", "impending"], phobia: ["scared", "frightened"], uncertainty: ["uncertain", "doubtful"] },
    surprise: { positive_surprise: ["amazed", "astonished"], shock: ["shocked", "stunned"], wonder: ["wonderful", "marvelous"], unexpected: ["unexpected", "surprising"] },
    disgust: { repulsion: ["disgusting", "revolting"], disapproval: ["despicable", "offensive"], aversion: ["hate", "dislike"], contempt: ["contempt", "scorn"] }
};

const contextMarkers = {
    sarcasm: { indicators: ["yeah right", "sure sure"], emphasis: ["so", "really"], punctuation: ["!", "..."], emojis: ["🙄"] },
    flirty: { greetings: ["hey", "hi"], compliments: ["cute", "lovely"], actions: ["wink", "hug"], emojis: ["😉"], playful: ["tease", "flirt"] },
    passive_aggressive: { dismissive: ["fine", "whatever"], sarcastic_agreement: ["right", "obviously"], minimizing: ["just", "only"], forced_politeness: ["thanks"] },
    joking: { laughter: ["haha", "lol"], playful_words: ["kidding", "joking"], emojis: ["😄"], exaggeration: ["literally dying"] },
    bitterness: { resentment: ["always", "never"], past_reference: ["again", "as usual"], cynicism: ["why bother"], self_pity: ["just my luck"] }
};

function detectAdvancedEmotions(results, words) {
    const advancedPatterns = [];
    const text = words.join(" ").toLowerCase();
    const textWithoutPunctuation = text.replace(/[^\w\s]/g, '');
    function hasWordsInContext(category, subCategory) {
        return emotionLexicon[category] && emotionLexicon[category][subCategory] ? emotionLexicon[category][subCategory].some(word => text.includes(word) || textWithoutPunctuation.includes(word)) : false;
    }
    function countContextMarkers(category) {
        let count = 0;
        if (contextMarkers[category]) {
            Object.values(contextMarkers[category]).forEach(markers => markers.forEach(marker => { if (text.includes(marker)) count++; }));
        }
        return count;
    }
    const { joy = 0, anger = 0, disgust = 0, sadness = 0, surprise = 0, fear = 0, trust = 0, anticipation = 0 } = results;
    if (joy >= 0.2 && (anger >= 0.15 || disgust >= 0.15) && countContextMarkers('sarcasm') >= 1) advancedPatterns.push("Sarcastic");
    if (joy >= 0.25) {
        if (hasWordsInContext('joy', 'love_positive') && countContextMarkers('flirty') >= 1) advancedPatterns.push("Romantic");
        else if (countContextMarkers('flirty') >= 2) advancedPatterns.push("Flirty");
    }
    if (sadness >= 0.3) {
        if (hasWordsInContext('sadness', 'grief')) advancedPatterns.push("Grief/Loss");
        else if (hasWordsInContext('sadness', 'heartache')) advancedPatterns.push("Heartache");
    }
    if (anger >= 0.15 && neutral >= 0.2 && countContextMarkers('passive_aggressive') >= 2) advancedPatterns.push("Passive-aggressive");
    if (joy >= 0.25 && surprise >= 0.1 && countContextMarkers('joking') >= 2) advancedPatterns.push("Playful/Joking");
    if (anger >= 0.2 && sadness >= 0.2 && countContextMarkers('bitterness') >= 2) advancedPatterns.push("Bitter");
    if (joy >= 0.3 && hasWordsInContext('joy', 'excitement')) advancedPatterns.push("Excited");
    if (fear >= 0.25 && hasWordsInContext('fear', 'anxiety')) advancedPatterns.push("Anxious");
    if (joy >= 0.35 && surprise >= 0.2) advancedPatterns.push("Delight");
    if (anger >= 0.3 && sadness >= 0.25) advancedPatterns.push("Frustration");
    if (anger >= 0.3 && disgust >= 0.25) advancedPatterns.push("Contempt");
    if (sadness >= 0.35 && fear >= 0.25) advancedPatterns.push("Despair");
    if (joy >= 0.3 && trust >= 0.25) advancedPatterns.push("Admiration");
    if (surprise >= 0.3 && fear >= 0.25) advancedPatterns.push("Shock/Awe");
    if (anticipation >= 0.3 && joy >= 0.25) advancedPatterns.push("Eagerness");
    return [...new Set(advancedPatterns)];
}

function renderWordEmotions(words, wordResults) {
    wordEmotionsDiv.innerHTML = "";
    let currentLineWords = 0;
    const maxWordsPerLine = 6;

    const curseSet = new Set(['damn','shit','fuck','fucking','hell','crap','bloody','wtf','goddamn','bastard','bitch','bitchy','ass','asshole','dick','cock','pussy','suck','hoe','stupid']);

    // Step 1: Collect all potential animation duties for each word
    const wordAnimationPotentials = words.map((word, index) => {
        const cleanLower = word.toLowerCase().replace(/[^a-z]/g, '');
        if (curseSet.has(cleanLower)) {
            return { index, word, dominantEmotionName: 'curse', dominantEmotionScore: 1, allEmotions: { curse: 1 } };
        }
        const emotions = wordResults[index];
        if (emotions && Object.keys(emotions).length > 0) {
            const sortedEmotions = Object.entries(emotions).sort(([_, a], [__, b]) => b - a);
            const dominantEmotionName = sortedEmotions[0][0].toLowerCase();
            const dominantEmotionScore = sortedEmotions[0][1];
            if (dominantEmotionScore >= 0.20 && dominantEmotionName !== 'neutral') {
                return { index, word, dominantEmotionName, dominantEmotionScore, allEmotions: emotions };
            }
        }
        return { index, word, allEmotions: emotions, dominantEmotionName: null, dominantEmotionScore: 0 };
    });

    // Step 2: For each type of emotion, find the best word to animate it
    const bestCandidatesForAnimationType = {}; // { joy: {index, word, score}, sadness: ... }
    const emotionTypes = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'flirty', 'curse'];

    emotionTypes.forEach(emotionType => {
        let bestCandidateForThisType = null;
        wordAnimationPotentials.forEach(potential => {
            // Check if this emotionType is present and significant enough in the word's full emotion set
            if (potential.allEmotions && potential.allEmotions[emotionType] && potential.allEmotions[emotionType] >= 0.20) {
                // And ensure it's the dominant one for this word to be considered its primary animation driver
                if (potential.dominantEmotionName === emotionType) {
                    if (!bestCandidateForThisType || potential.dominantEmotionScore > bestCandidateForThisType.score) {
                        bestCandidateForThisType = {
                            index: potential.index,
                            word: potential.word,
                            score: potential.dominantEmotionScore
                        };
                    }
                }
            }
        });
        if (bestCandidateForThisType) {
            bestCandidatesForAnimationType[emotionType] = bestCandidateForThisType;
        }
    });

    // Step 3: Create the word spans with animations
    words.forEach((word, index) => {
        if (currentLineWords >= maxWordsPerLine) {
            wordEmotionsDiv.appendChild(document.createElement('br'));
            currentLineWords = 0;
        }

        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.margin = '0 4px';

        // Find if this word is the best candidate for any emotion type
        let animationEmotion = null;
        Object.entries(bestCandidatesForAnimationType).forEach(([emotion, candidate]) => {
            if (candidate.index === index) {
                animationEmotion = emotion;
            }
        });

        if (animationEmotion) {
            // This word is the best candidate for its emotion type, animate it
            wordSpan.innerHTML = Array.from(word).map((char, i) => 
                `<span class="animated" style="animation-name:${animationEmotion};animation-duration:1.8s;animation-timing-function:ease-in-out;animation-delay:${i*0.06}s;animation-iteration-count:infinite;">${char}</span>`
            ).join('');
        } else {
            // Regular word without animation
            wordSpan.textContent = word;
        }

        wordEmotionsDiv.appendChild(wordSpan);
        currentLineWords++;
    });
}

function getIntelligentFontVariations(wordStr, context = 'sentence') {
    const variations = {
        weight: 'normal',
        style: 'normal',
        size: '1em',
        letterSpacing: 'normal'
    };

    // Basic emotional mappings
    const emotions = {
        anger: { weight: 'bold', letterSpacing: '0.05em' },
        joy: { style: 'normal', weight: '500' },
        sadness: { weight: '300', letterSpacing: '-0.02em' },
        fear: { style: 'italic', letterSpacing: '0.03em' },
        disgust: { weight: '500', style: 'italic' },
        surprise: { weight: '600', letterSpacing: '0.08em' }
    };

    // Intensity markers
    const intensifiers = ['very', 'extremely', 'totally', 'absolutely', 'completely'];
    const diminishers = ['slightly', 'somewhat', 'kind of', 'a bit'];

    // Apply variations based on word characteristics
    if (wordStr.endsWith('!')) variations.weight = 'bold';
    if (wordStr.endsWith('...')) variations.letterSpacing = '0.1em';
    if (wordStr === wordStr.toUpperCase()) variations.weight = 'bold';

    // Context-based adjustments
    if (context === 'emphasis') {
        variations.weight = parseInt(variations.weight) + 100;
        variations.letterSpacing = '0.05em';
    }

    return variations;
}

function handleSpeak() {
    const text = textarea.value;
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function fallbackEmotionScores(text) {
    // Simple rule-based fallback
    const scores = {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        disgust: 0,
        love: 0,
        flirty: 0,
        curse: 0,
        neutral: 0.2
    };

    if (!text) return scores;

    const lowerText = text.toLowerCase();

    // Very basic emotion word matching
    const emotionWords = {
        joy: ['happy','joy','great','awesome','excellent','😊','😃','amazing','wonderful','fantastic'],
        sadness: ['sad','unhappy','depressed','miserable','crying','😢','😭','heartbroken','devastated'],
        anger: ['angry','mad','furious','rage','😠','😡','pissed','irritated','annoyed'],
        fear: ['scared','afraid','terrified','fear','worried','😨','😱','anxious','nervous','panic'],
        surprise: ['wow','omg','surprised','shocked','unexpected','😮','😲','unbelievable','amazing'],
        disgust: ['gross','disgusting','yuck','eww','nasty','🤢','🤮','revolting','sickening'],
        love: ['love','lovely','dear','sweetheart','honey','darling','❤️','😍','😘','xoxo','adore','cherish'],
        flirty: ['cute','handsome','beautiful','gorgeous','wink','😉','😏','flirty','kiss','hug','sexy','hot'],
        curse: ['damn','shit','fuck','fucking','hell','crap','bloody','wtf','goddamn','bastard','bitch','bitchy','ass','asshole','dick','cock','pussy','suck','hoe','stupid']
    };

    // Check for emotion words
    Object.entries(emotionWords).forEach(([emotion, words]) => {
        words.forEach(word => {
            if (lowerText.includes(word)) {
                scores[emotion] += 0.3;
                scores.neutral = Math.max(0, scores.neutral - 0.1);
            }
        });
    });

    // Punctuation affects intensity
    if (text.includes('!')) {
        Object.keys(scores).forEach(emotion => {
            if (scores[emotion] > 0) scores[emotion] += 0.1;
        });
        scores.neutral = Math.max(0, scores.neutral - 0.1);
    }

    // Normalize scores
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
        Object.keys(scores).forEach(emotion => {
            scores[emotion] = scores[emotion] / total;
        });
    }

    return scores;
}

function showLoading() {
    if (loadingDiv) loadingDiv.style.display = "block";
    if (analyzeBtn) analyzeBtn.disabled = true;
}

function hideLoading() {
    if (loadingDiv) loadingDiv.style.display = "none";
    if (analyzeBtn) analyzeBtn.disabled = false;
} 