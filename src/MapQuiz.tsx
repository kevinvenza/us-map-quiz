import React, { useState, useEffect } from 'react';
import USAMap from 'react-usa-map';

// In a full implementation, you can fetch this from your Python backend!
const STATES_DATA = [
  { abbr: 'AL', name: 'Alabama', capital: 'Montgomery' },
  { abbr: 'AK', name: 'Alaska', capital: 'Juneau' },
  { abbr: 'AZ', name: 'Arizona', capital: 'Phoenix' },
  { abbr: 'AR', name: 'Arkansas', capital: 'Little Rock' },
  { abbr: 'CA', name: 'California', capital: 'Sacramento' },
  { abbr: 'CO', name: 'Colorado', capital: 'Denver' },
  { abbr: 'CT', name: 'Connecticut', capital: 'Hartford' },
  { abbr: 'DE', name: 'Delaware', capital: 'Dover' },
  { abbr: 'FL', name: 'Florida', capital: 'Tallahassee' },
  { abbr: 'GA', name: 'Georgia', capital: 'Atlanta' },
  { abbr: 'HI', name: 'Hawaii', capital: 'Honolulu' },
  { abbr: 'ID', name: 'Idaho', capital: 'Boise' },
  { abbr: 'IL', name: 'Illinois', capital: 'Springfield' },
  { abbr: 'IN', name: 'Indiana', capital: 'Indianapolis' },
  { abbr: 'IA', name: 'Iowa', capital: 'Des Moines' },
  { abbr: 'KS', name: 'Kansas', capital: 'Topeka' },
  { abbr: 'KY', name: 'Kentucky', capital: 'Frankfort' },
  { abbr: 'LA', name: 'Louisiana', capital: 'Baton Rouge' },
  { abbr: 'ME', name: 'Maine', capital: 'Augusta' },
  { abbr: 'MD', name: 'Maryland', capital: 'Annapolis' },
  { abbr: 'MA', name: 'Massachusetts', capital: 'Boston' },
  { abbr: 'MI', name: 'Michigan', capital: 'Lansing' },
  { abbr: 'MN', name: 'Minnesota', capital: 'St. Paul' },
  { abbr: 'MS', name: 'Mississippi', capital: 'Jackson' },
  { abbr: 'MO', name: 'Missouri', capital: 'Jefferson City' },
  { abbr: 'MT', name: 'Montana', capital: 'Helena' },
  { abbr: 'NE', name: 'Nebraska', capital: 'Lincoln' },
  { abbr: 'NV', name: 'Nevada', capital: 'Carson City' },
  { abbr: 'NH', name: 'New Hampshire', capital: 'Concord' },
  { abbr: 'NJ', name: 'New Jersey', capital: 'Trenton' },
  { abbr: 'NM', name: 'New Mexico', capital: 'Santa Fe' },
  { abbr: 'NY', name: 'New York', capital: 'Albany' },
  { abbr: 'NC', name: 'North Carolina', capital: 'Raleigh' },
  { abbr: 'ND', name: 'North Dakota', capital: 'Bismarck' },
  { abbr: 'OH', name: 'Ohio', capital: 'Columbus' },
  { abbr: 'OK', name: 'Oklahoma', capital: 'Oklahoma City' },
  { abbr: 'OR', name: 'Oregon', capital: 'Salem' },
  { abbr: 'PA', name: 'Pennsylvania', capital: 'Harrisburg' },
  { abbr: 'RI', name: 'Rhode Island', capital: 'Providence' },
  { abbr: 'SC', name: 'South Carolina', capital: 'Columbia' },
  { abbr: 'SD', name: 'South Dakota', capital: 'Pierre' },
  { abbr: 'TN', name: 'Tennessee', capital: 'Nashville' },
  { abbr: 'TX', name: 'Texas', capital: 'Austin' },
  { abbr: 'UT', name: 'Utah', capital: 'Salt Lake City' },
  { abbr: 'VT', name: 'Vermont', capital: 'Montpelier' },
  { abbr: 'VA', name: 'Virginia', capital: 'Richmond' },
  { abbr: 'WA', name: 'Washington', capital: 'Olympia' },
  { abbr: 'WV', name: 'West Virginia', capital: 'Charleston' },
  { abbr: 'WI', name: 'Wisconsin', capital: 'Madison' },
  { abbr: 'WY', name: 'Wyoming', capital: 'Cheyenne' }
];

type TestMode = 'states' | 'capitals';

// Extract the component to handle Vite's CommonJS interop quirks
const MapComponent = ((USAMap as any).default || USAMap) as typeof USAMap;

export default function MapQuiz() {
  const [mode, setMode] = useState<TestMode>(() => {
    return (localStorage.getItem('mapQuiz_mode') as TestMode) || 'states';
  });
  const [remainingStates, setRemainingStates] = useState<typeof STATES_DATA>(() => {
    try {
      const saved = localStorage.getItem('mapQuiz_remainingStates');
      return saved ? JSON.parse(saved) : [...STATES_DATA];
    } catch (e) {
      return [...STATES_DATA];
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState<typeof STATES_DATA[0] | null>(null);
  
  const [correctList, setCorrectList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mapQuiz_correctList');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [incorrectList, setIncorrectList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mapQuiz_incorrectList');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapQuiz_mode', mode);
    localStorage.setItem('mapQuiz_remainingStates', JSON.stringify(remainingStates));
    localStorage.setItem('mapQuiz_correctList', JSON.stringify(correctList));
    localStorage.setItem('mapQuiz_incorrectList', JSON.stringify(incorrectList));
  }, [mode, remainingStates, correctList, incorrectList]);

  // Pick a random question on mount and when remaining states change
  useEffect(() => {
    if (remainingStates.length > 0 && !currentQuestion) {
      pickNextQuestion(remainingStates);
    }
  }, [remainingStates, currentQuestion]);

  const pickNextQuestion = (pool: typeof STATES_DATA) => {
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentQuestion(pool[randomIndex]);
  };

  // Handle removing default map tooltips and injecting state labels for the capitals quiz
  useEffect(() => {
    // 1. Remove native tooltips so the state name isn't revealed on hover
    document.querySelectorAll('path title').forEach(t => t.remove());

    // 2. Remove existing labels to prevent duplicates on re-render
    document.querySelectorAll('.state-label-group').forEach(el => el.remove());

    if (mode === 'capitals') {
      const svg = document.querySelector('.us-state-map') || document.querySelector('svg');
      if (!svg) return;

      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroup.setAttribute('class', 'state-label-group');
      labelGroup.setAttribute('pointer-events', 'none'); // Crucial: lets clicks pass through to the state path

      const LABEL_OFFSETS: Record<string, [number, number]> = {
        FL: [12, 0], MI: [15, 25], CA: [-15, 5], LA: [-15, -5], 
        AK: [0, -20], ID: [0, 15], MD: [15, 5], NJ: [5, 0]
      };

      const paths = document.querySelectorAll('path[data-name]');
      paths.forEach(path => {
        const stateAbbr = path.getAttribute('data-name');
        if (!stateAbbr) return;

        const bbox = (path as SVGPathElement).getBBox();
        const x = bbox.x + bbox.width / 2 + (LABEL_OFFSETS[stateAbbr]?.[0] || 0);
        const y = bbox.y + bbox.height / 2 + (LABEL_OFFSETS[stateAbbr]?.[1] || 0);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('font-size', '14px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#1f2937'); // dark gray
        text.setAttribute('stroke', '#ffffff'); // white outline for readability
        text.setAttribute('stroke-width', '2.5px');
        text.setAttribute('paint-order', 'stroke');
        text.setAttribute('pointer-events', 'none'); // Extra safety
        text.textContent = stateAbbr;

        labelGroup.appendChild(text);
      });

      svg.appendChild(labelGroup);
    }
  }, [mode, remainingStates.length]); // Stabilize: only run when mode or quiz progress changes

  const [isProcessing, setIsProcessing] = useState(false);

  const handleMapClick = (event: React.MouseEvent<SVGPathElement>) => {
    if (!currentQuestion || isProcessing) return;
    
    // Use currentTarget to get the element the listener is attached to (the path),
    // which is more reliable than event.target on mobile devices.
    const target = event.currentTarget as SVGElement;
    const clickedStateAbbr = target.dataset.name;

    if (!clickedStateAbbr) return;

    setIsProcessing(true);

    if (clickedStateAbbr === currentQuestion.abbr) {
      setFeedback({ message: 'Correct! 🎉', isCorrect: true });
      setCorrectList((prev) => [...prev, currentQuestion.name]);
    } else {
      const clickedState = STATES_DATA.find((s) => s.abbr === clickedStateAbbr);
      setFeedback({ 
        message: `Oops! That was ${clickedState?.name || clickedStateAbbr}.`, 
        isCorrect: false 
      });
      setIncorrectList((prev) => [...prev, currentQuestion.name]);
    }

    // Remove the current question from the pool and pick the next one
    const newRemaining = remainingStates.filter((s) => s.abbr !== currentQuestion.abbr);
    setRemainingStates(newRemaining);
    setCurrentQuestion(null); // will trigger useEffect to pick next
    
    // Short cooldown to prevent accidental double-taps on mobile
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleStartOver = () => {
    setRemainingStates([...STATES_DATA]);
    setCorrectList([]);
    setIncorrectList([]);
    setFeedback(null);
    setCurrentQuestion(null);
  };

  const handleRetryMissed = () => {
    const missedStates = STATES_DATA.filter((s) => incorrectList.includes(s.name));
    setRemainingStates(missedStates);
    setCorrectList([]);
    setIncorrectList([]);
    setFeedback(null);
    setCurrentQuestion(null);
  };

  const isTestComplete = remainingStates.length === 0 && currentQuestion === null;

  const totalAnswers = correctList.length + incorrectList.length;
  const scorePercentage = totalAnswers > 0 ? Math.round((correctList.length / totalAnswers) * 100) : 0;

  const getMapCustomizations = () => {
    const customizations: Record<string, { fill: string }> = {};
    STATES_DATA.forEach((state) => {
      if (correctList.includes(state.name)) {
        customizations[state.abbr] = { fill: '#4ade80' }; // Light Green
      } else if (incorrectList.includes(state.name)) {
        customizations[state.abbr] = { fill: '#f87171' }; // Light Red
      }
    });
    return customizations;
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>US Map Quiz</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            checked={mode === 'states'} 
            onChange={() => { setMode('states'); handleStartOver(); }} 
          /> Test States
        </label>
        <label style={{ cursor: 'pointer', marginRight: '20px' }}>
          <input 
            type="radio" 
            checked={mode === 'capitals'} 
            onChange={() => { setMode('capitals'); handleStartOver(); }} 
          /> Test Capitals
        </label>
        <button onClick={handleStartOver} style={{ padding: '5px 15px', cursor: 'pointer' }}>
          Restart Quiz
        </button>
      </div>

      {!isTestComplete ? (
        <div style={{ marginBottom: '20px' }}>
          <h2>
            Find: <span style={{ color: '#0066cc' }}>
              {mode === 'states' ? currentQuestion?.name : currentQuestion?.capital}
            </span>
          </h2>
          <h3 style={{ 
            color: feedback?.isCorrect ? 'green' : 'red',
            visibility: feedback ? 'visible' : 'hidden'
          }}>
            {feedback ? feedback.message : 'Placeholder'}
          </h3>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h2>Test Complete! 🏆</h2>
          <h3 style={{ color: scorePercentage >= 80 ? 'green' : 'orange' }}>Your Score: {scorePercentage}%</h3>
          <button onClick={handleStartOver} style={{ marginRight: '10px' }}>Start Over</button>
          {incorrectList.length > 0 && (
            <button onClick={handleRetryMissed}>Retry Missed ({incorrectList.length})</button>
          )}
        </div>
      )}

      {/* The interactive SVG Map */}
      <MapComponent onClick={handleMapClick} customize={getMapCustomizations()} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px' }}>
        <div style={{ color: 'green' }}>
          <h3>Correct ({correctList.length})</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {correctList.map((state, idx) => <li key={idx}>{state}</li>)}
          </ul>
        </div>
        <div style={{ color: 'red' }}>
          <h3>Missed ({incorrectList.length})</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {incorrectList.map((state, idx) => <li key={idx}>{state}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}