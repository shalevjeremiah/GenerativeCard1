// emotionAnalyzer.js – lexicon-based & heuristics emotion detector for offline use

// Simple emotion lexicon (can be expanded) – lists are purposely short for demo but easy to extend
const EMOTION_WORDS = {
    joy:     ["happy","joy","glad","delighted","cheerful","awesome","amazing","great","smile","laugh","yay","fantastic"],
    sadness: ["sad","unhappy","depressed","miserable","cry","tears","down","gloomy","heartbroken","sorrow"],
    anger:   ["angry","mad","furious","irate","rage","annoyed","pissed","hate","frustrated","upset"],
    fear:    ["fear","scared","afraid","terrified","worried","nervous","panic","anxious","frightened"],
    disgust: ["disgust","gross","nasty","sick","revolting","vomit","yuck","ew","repulsive"],
    love:    ["love","lovely","adore","cherish","sweetheart","darling","heart","beloved","affection"]
};

// Amplifiers & diminishers – modify intensity when they precede an emotion word
const AMPLIFIERS  = ["very","really","so","extremely","incredibly","absolutely","super"];
const DIMINISHERS = ["slightly","somewhat","kind of","sort of","barely","a bit","little"];

// Negation tokens – flip emotional polarity when they appear immediately before an emotion word
const NEGATIONS   = ["not","no","never","none","n't"];

function tokenize(text){
    return text.toLowerCase()
               .replace(/[^a-z'\s]/g,' ') // keep apostrophes for n't
               .split(/\s+/)
               .filter(Boolean);
}

export function analyzeMessage(text){
    if(!text || typeof text!=="string"){
        return neutralScores();
    }
    const tokens = tokenize(text);

    // Base counters
    const counts = { joy:0,sadness:0,anger:0,fear:0,disgust:0,love:0 };

    for(let i=0;i<tokens.length;i++){
        const word=tokens[i];
        const prev = tokens[i-1]||"";
        for(const emotion of Object.keys(EMOTION_WORDS)){
            if(EMOTION_WORDS[emotion].includes(word)){
                // base weight
                let weight=1;
                // amplifier/diminisher
                if(AMPLIFIERS.includes(prev)) weight*=1.5;
                if(DIMINISHERS.includes(prev)) weight*=0.5;
                // negation
                if(NEGATIONS.includes(prev)){
                    // flip to neutral by reducing weight drastically
                    weight*=0.1;
                }
                counts[emotion]+=weight;
                break;
            }
        }
    }

    // Normalize to [0,1] each – relative to max count found
    const maxCount = Math.max(...Object.values(counts),1e-6);
    const scores = {};
    Object.entries(counts).forEach(([e,c])=>{
        scores[e]=c/maxCount; // scale so dominant emotion ~1
    });
    return scores;
}

function neutralScores(){
    return { joy:0, sadness:0, anger:0, fear:0, disgust:0, love:0 };
}

// If running in browser attach to window for easy usage
if(typeof window!=="undefined"){
    window.analyzeMessage = analyzeMessage;
} 