import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './AIVoiceAssistant.css';

const AIVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  
  const navigate = useNavigate();
  const { addTransaction } = useAppContext();
  const recognitionRef = useRef(null);
  
  const speakAndListen = useCallback((text, onEndCallback = null) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      if (onEndCallback) onEndCallback();
    }
  }, []);

  const callMetaLlama = useCallback(async (userCommand) => {
    const activeKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!activeKey || activeKey === 'YOUR_API_KEY_HERE') {
      speakAndListen("API Key is missing in the environment configuration.");
      setTranscript("Error: Missing VITE_GROQ_API_KEY in .env.local");
      setTimeout(() => setTranscript(''), 4000);
      return;
    }

    setTranscript("Analyzing...");
    
    const d = new Date();
    const todayStr = d.toISOString().split('T')[0];
    d.setDate(d.getDate() + 7);
    const nextWeekStr = d.toISOString().split('T')[0];

    const systemPrompt = `You are the AI Voice Assistant for an SME Finance Web App.
You help users manage transactions and navigate the app.
The current date today is ${todayStr}.
You MUST ALWAYS output pure JSON in the exact following format, and NOTHING ELSE:
{
  "reply": "Your short, friendly spoken response to the user. Keep it natural and concise.",
  "action": "navigate" | "create_transaction" | "ask_details" | "none",
  "data": {
     "page": "/ledger" | "/income" | "/dashboard" | "/cash-flow" | "/summary", 
     "type": "income" | "expense", // MUST be defined for create_transaction
     "payment": "cash" | "digital", // MUST be defined for create_transaction
     "desc": "Extracted short description from the user phrase",
     "cat": "Extracted category (e.g. Sales Revenue, Office Supplies, Other Income, etc.)",
     "party": "Extracted Client or Vendor name if mentioned",
     "amount": 0, // MUST be a number, extract it if mentioned, otherwise 0
     "date": "YYYY-MM-DD" // extract from text, or default to ${todayStr}
  }
}

6. CRITICAL INSTRUCTIONS FOR ACTION FIELD:
   - Identify "paid to", "spent on", "bought", "gave" as EXPENSE.
   - Identify "received from", "got", "earned", "commission from" as INCOME.
   - If the user wants to log a transaction but hasn't provided the AMOUNT, TYPE (Income/Expense), PAYMENT (Cash/Digital), AND DESCRIPTION, set "action": "ask_details" and make "reply" clarify the missing information.
   - If the user has provided all details (Amount, Type, Payment, Description), you MUST set "action": "create_transaction".
   - ONLY SAY you recorded it IF you are returning "action": "create_transaction".`;

    const userMessage = { role: "user", content: userCommand };
    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      userMessage
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Fast Meta Llama 3 model
          messages: messagesPayload,
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error Response:", response.status, errorText);
        throw new Error(`Failed to call Groq API (Code: ${response.status}). Check console.`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);
      
      console.log("Meta Llama Output:", aiResponse);
      const assistantMessage = { role: "assistant", content: JSON.stringify(aiResponse) };

      // Execute the AI Action
      if (aiResponse.action === 'ask_details') {
         // Ask details and keep history
         setChatHistory(prev => [...prev, userMessage, assistantMessage]);
         setTranscript(aiResponse.reply);
         
         speakAndListen(aiResponse.reply, () => {
             // Automatically start listening again for the user's answer
             if (recognitionRef.current) {
                 setIsListening(true);
                 try {
                     recognitionRef.current.start();
                     setTranscript('Listening for your answer...');
                 } catch (e) {
                     console.error("Already listening", e);
                 }
             }
         });
      }
      else if (aiResponse.action === 'navigate') {
        setChatHistory([]); // Clear history on action completion
        const pageUrl = aiResponse.data.page || '/dashboard';
        setTranscript(`Navigating to ${pageUrl}...`);
        speakAndListen(aiResponse.reply);
        navigate(pageUrl);
        setTimeout(() => setTranscript(''), 3000);
      } 
      else if (aiResponse.action === 'create_transaction') {
        const txData = aiResponse.data || {};
        const amt = Number(txData.amount);
        const { type, payment, desc, cat, party, date } = txData;
        
        if (amt > 0 && desc && ["income","expense"].includes(type) && ["cash","digital"].includes(payment)) {
           try {
               await addTransaction({
                 type,
                 payment,
                 amount: amt,
                 desc: desc || 'AI Generated Txn',
                 cat: cat || (type === 'income' ? 'Other Income' : 'Other Expense'),
                 party: party || '',
                 ref: '',
                 notes: 'Generated via AI voice',
                 date: date || todayStr,
               });
               setChatHistory([]); // Clear history on success
               setTranscript(`Recorded ${type} of ₹${amt}`);
               speakAndListen(aiResponse.reply);
               setTimeout(() => {
                 navigate('/ledger');
                 setTimeout(() => setTranscript(''), 3000);
               }, 2000);
           } catch (err) {
               console.error("AI Transaction Creation Error:", err);
               window.alert("Database Error: " + err.message);
           }
        } else {
           // Fallback if AI somehow misses ask_details despite instructions
           setChatHistory(prev => [...prev, userMessage, assistantMessage]);
           const missing = [!amt?'amount':'', !desc?'description':'', !["income","expense"].includes(type)?'Is it income or expense?':'', !["cash","digital"].includes(payment)?'Cash or digital?':''].filter(Boolean).join(', ');
           const errMsg = `I heard Amount: ${amt}, Desc: ${desc}. I am missing: ${missing}.`;
           setTranscript(`Incomplete: ${errMsg}`);
           speakAndListen(errMsg, () => {
               if (recognitionRef.current) {
                   setIsListening(true);
                   try {
                       recognitionRef.current.start();
                   } catch(e) {}
               }
           });
        }
      } 
      else {
        // none action
        setChatHistory(prev => [...prev, userMessage, assistantMessage]);
        setTranscript(aiResponse.reply);
        speakAndListen(aiResponse.reply);
        setTimeout(() => setTranscript(''), 3000);
      }

    } catch (error) {
      console.error(error);
      setTranscript(`Error: ${error.message}`);
      speakAndListen("I encountered an issue connecting to the Meta model.");
      setTimeout(() => setTranscript(''), 4000);
    }
  }, [chatHistory, navigate, addTransaction, speakAndListen]);

  const processCommand = useCallback((command) => {
    console.log("Raw Command:", command);
    callMetaLlama(command);
  }, [callMetaLlama]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const textStr = event.results[event.resultIndex][0].transcript.toLowerCase();
        setTranscript(`Heard: "${textStr}"`);
        processCommand(textStr);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'aborted') {
          setIsListening(false);
          const userText = window.prompt("The microphone couldn't hear you! Please type your command here:");
          if (userText) {
            setTranscript(`Typed: "${userText}"`);
            processCommand(userText);
          } else {
            setTranscript('Error: Could not hear you.');
            setTimeout(() => setTranscript(''), 3000);
          }
        }
      };

      rec.onend = () => setIsListening(false);

      setRecognition(rec);
      recognitionRef.current = rec;
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, [processCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      setTranscript('');
      setChatHistory([]); // reset history if manually stopped
    } else {
      setTranscript('Listening for commands...');
      try {
        recognition?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  if (!recognition) return null;

  return (
    <div className={`ai-voice-assistant ${isListening ? 'listening' : ''}`}>
      {transcript && (
        <div className="transcript-tooltip">
          {transcript}
        </div>
      )}
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <button 
          className={`voice-btn ${isListening ? 'active pulse' : ''}`}
          onClick={toggleListening}
          title={isListening ? "Listening..." : "Tap to speak command"}
        >
          {isListening ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
        </button>
      </div>
    </div>
  );
};

export default AIVoiceAssistant;
