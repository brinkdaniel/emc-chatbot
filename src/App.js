/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- Helper Icons (as SVG components) ---
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 8V4H8"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M17 12v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/><path d="M7 12v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l-.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);


// --- Firebase Configuration ---
// IMPORTANT: Replace the placeholder values below with your actual
// Firebase project configuration details. You can find them in your
// Firebase project console -> Project settings -> General -> Your apps -> SDK setup and configuration.
const firebaseConfig = {
    apiKey: "AIzaSyAtu6ht6CyzOvhow5a6iGErEtn_lsGT-RQ",
    authDomain: "moodle-ai-chatbot-4f05e.firebaseapp.com",
    projectId: "moodle-ai-chatbot-4f05e",
    storageBucket: "moodle-ai-chatbot-4f05e.appspot.com",
    messagingSenderId: "858591447182",
    appId: "1:858591447182:web:018b0d622f32db748821df"
};

// This ID is used to separate data in the database for different instances of the app.
// You can leave this as is.
const appId = 'default-emc-chatbot';

// --- Main App Component ---
function App() {
    // State management
    const [view, setView] = useState('chat'); // 'chat' or 'admin'
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Initialize Firebase and handle authentication
    useEffect(() => {
        try {
            // Check if firebase config has been filled
            if (firebaseConfig.apiKey.includes("PASTE_YOUR")) {
                alert("Configuration Error: Please update the firebaseConfig object in src/App.js with your project details from the Firebase Console.");
                return;
            }

            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Set up an authentication state listener.
            const authUnsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setIsAuthReady(true);
                } else {
                    try {
                        // Use anonymous sign-in for deployed app
                        await signInAnonymously(firebaseAuth);
                    } catch (error) {
                        console.error("Firebase Anonymous Sign-in failed:", error);
                    }
                }
            });

            return () => authUnsubscribe();

        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    }, []);

    const handleAdminLogin = (e) => {
        e.preventDefault();
        // This is a simple client-side password check.
        if (adminPassword === 'EMC-Admin-2025!') { 
            setIsAdminAuthenticated(true);
        } else {
            alert('Incorrect password.');
        }
    };

    return (
        <div className="bg-gray-100 font-sans leading-normal tracking-normal flex flex-col h-screen">
            <header className="bg-blue-800 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl md:text-2xl font-bold">EMC VWIL Assistant</h1>
                <button 
                    onClick={() => setView(view === 'chat' ? 'admin' : 'chat')}
                    className="p-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title={view === 'chat' ? 'Admin Panel' : 'Back to Chat'}
                >
                    <AdminIcon />
                </button>
            </header>

            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                {view === 'chat' && isAuthReady && db && <ChatInterface db={db} appId={appId} />}
                {view === 'admin' && !isAdminAuthenticated && (
                    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Access</h2>
                        <form onSubmit={handleAdminLogin}>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors font-semibold">
                                Login
                            </button>
                        </form>
                    </div>
                )}
                {view === 'admin' && isAdminAuthenticated && isAuthReady && db && <AdminPanel db={db} appId={appId} />}
            </main>
             <footer className="bg-gray-200 text-center text-xs text-gray-600 p-2">
                <p>EMC Chatbot v1.0 | For educational purposes only.</p>
            </footer>
        </div>
    );
}

// --- Chat Interface Component (for students) ---
function ChatInterface({ db, appId }) {
    // --- IMPORTANT: Paste your Google AI API key here ---
    const GOOGLE_API_KEY = "PASTE_YOUR_GOOGLE_AI_API_KEY_HERE"; 

    const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello! I am the VWIL Assistant. Please select your module and ask me a question.' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModule, setSelectedModule] = useState('VWIL100');
    const [knowledgeBase, setKnowledgeBase] = useState('');
    const messagesEndRef = useRef(null);
    
    const modules = ['VWIL100', 'VWIL200', 'VWIL300', 'VWIL400'];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch the knowledge base for the selected module from Firestore
    useEffect(() => {
        const fetchKnowledge = async () => {
            if (!db || !selectedModule || !appId) return;
            setIsLoading(true);
            try {
                // Correctly path to public data for this artifact
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'knowledge', selectedModule);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setKnowledgeBase(docSnap.data().content);
                    setMessages(prev => [...prev.slice(0, 1), {role: 'bot', text: `Knowledge base for ${selectedModule} loaded. How can I help?`}]);
                } else {
                    setKnowledgeBase('');
                    setMessages(prev => [...prev.slice(0, 1), {role: 'bot', text: `Sorry, no knowledge base has been set up for ${selectedModule} yet.`}]);
                }
            } catch (error) {
                console.error("Error fetching knowledge base:", error);
                setMessages(prev => [...prev.slice(0, 1), {role: 'bot', text: 'There was an error loading the module data.'}]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKnowledge();
    }, [selectedModule, db, appId]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        if (GOOGLE_API_KEY.includes("PASTE_YOUR")) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Configuration Error: The Google AI API Key has not been set by the developer.' }]);
            return;
        }


        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const isProtocolQuestion = /what is the dose|protocol for|administer|medication/i.test(input);
        
        const systemPrompt = isProtocolQuestion 
            ? `You are a Socratic tutor for Emergency Medical Care students. A student has asked a question about a clinical protocol. Do NOT give them the direct answer. Instead, guide them to find the answer themselves by asking probing questions. Point them towards their resources (like their protocol guides or learner materials). Your goal is to foster critical thinking, not to be an answer key. Student's question: "${input}"`
            : `You are a helpful AI assistant for a university module called ${selectedModule}. Answer the user's question based *only* on the following knowledge base. If the answer is not in the knowledge base, say "I'm sorry, that information is not available in the ${selectedModule} guide." Keep your answers concise and directly related to the provided text. Knowledge Base: """${knowledgeBase}"""`;
        
        try {
            const payload = {
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nQuestion: ${input}` }]
                }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now. Please try again.";
            
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { role: 'bot', text: 'An error occurred. Please check your API key and network connection.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200">
                <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-1">Select your module:</label>
                <select 
                    id="module-select"
                    value={selectedModule} 
                    onChange={e => setSelectedModule(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <BotIcon />
                            </div>
                        )}
                        <div className={`p-3 rounded-lg max-w-xs md:max-w-md break-words ${msg.role === 'user' ? 'bg-gray-200' : 'bg-blue-600 text-white'}`}>
                            {msg.text}
                        </div>
                         {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                <UserIcon />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 my-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                           <BotIcon />
                        </div>
                        <div className="p-3 rounded-lg bg-blue-600 text-white animate-pulse">
                           Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading || !knowledgeBase}
                    />
                    <button onClick={handleSend} disabled={isLoading || !knowledgeBase} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- Admin Panel Component (for the instructor) ---
function AdminPanel({ db, appId }) {
    const [selectedModule, setSelectedModule] = useState('VWIL100');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const modules = ['VWIL100', 'VWIL200', 'VWIL300', 'VWIL400'];

    useEffect(() => {
        const fetchContent = async () => {
            if (!selectedModule || !db || !appId) return;
            setIsLoading(true);
            setStatus(`Loading content for ${selectedModule}...`);
            try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'knowledge', selectedModule);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContent(docSnap.data().content);
                    setStatus(`Content for ${selectedModule} loaded.`);
                } else {
                    setContent('');
                    setStatus(`No content found for ${selectedModule}. You can add it now.`);
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
                setStatus('Error loading content.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [selectedModule, db, appId]);

    const handleSave = async () => {
        if (!selectedModule || !content.trim() || !db || !appId) {
            setStatus('Please select a module and add some content.');
            return;
        }
        setIsLoading(true);
        setStatus(`Saving content for ${selectedModule}...`);
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'knowledge', selectedModule);
            await setDoc(docRef, { content: content });
            setStatus(`Knowledge base for ${selectedModule} saved successfully!`);
        } catch (error) {
            console.error("Error writing document: ", error);
            setStatus('Error saving content.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Knowledge Base</h2>
            <p className="mb-6 text-gray-600">
                Here you can add or update the knowledge for each VWIL module. Simply select a module, paste the entire text from your learner guide or FAQ document into the text box, and click save. This content will be the ONLY source of information for the chatbot for that module.
            </p>

            <div className="mb-4">
                <label htmlFor="admin-module-select" className="block text-sm font-medium text-gray-700 mb-1">Target Module:</label>
                <select 
                    id="admin-module-select"
                    value={selectedModule} 
                    onChange={e => setSelectedModule(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="knowledge-content" className="block text-sm font-medium text-gray-700 mb-1">Knowledge Content:</label>
                <textarea
                    id="knowledge-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Paste the full text content for ${selectedModule} here...`}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center justify-between">
                <button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? 'Saving...' : 'Save Knowledge Base'}
                </button>
                {status && <p className="text-sm text-gray-600">{status}</p>}
            </div>
        </div>
    );
}

export default App;
