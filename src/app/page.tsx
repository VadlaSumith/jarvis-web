'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSpeech } from './hooks/useSpeech';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [quote, setQuote] = useState('');
  const [joke, setJoke] = useState('');
  const [location, setLocation] = useState('Loading...');
  const [command, setCommand] = useState('');
  const [news, setNews] = useState<string[]>([]);
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResult, setWikiResult] = useState('');
  const { speak, listen, isRecognitionSupported } = useSpeech();
  const [spokenText, setSpokenText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [gptPrompt, setGptPrompt] = useState('');
  const [gptResponse, setGptResponse] = useState(''); 

  useEffect(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString());
    setDate(now.toLocaleDateString());
  }, []);

  useEffect(() => {
    axios.get('https://zenquotes.io/api/random')
      .then(res => setQuote(res.data[0].q + " — " + res.data[0].a))
      .catch(() => setQuote("Stay positive and work hard!"));
  }, []);

  useEffect(() => {
    axios.get('https://v2.jokeapi.dev/joke/Any?type=single')
      .then(res => setJoke(res.data.joke))
      .catch(() => setJoke("No joke today, just smiles!"));
  }, []);

  useEffect(() => {
    axios.get('http://ip-api.com/json')
      .then(res => setLocation(`${res.data.city}, ${res.data.country}`))
      .catch(() => setLocation("Unknown Location"));
  }, []);
  // Fetch top news on load
useEffect(() => {
  axios.get(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=5c71568327884567b9d48e053fd062de`)
    .then((res) => {
      const headlines = res.data.articles.map((a: { title: string }) => a.title);
      //const headlines = res.data.articles.map((a: any) => a.title);
      setNews(headlines);
    })
    .catch(() => setNews(["Unable to load news at this time."]));
}, []);
  // Handle voice command
const handleVoiceCommand = () => {
  if (!isRecognitionSupported) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  setIsListening(true);
  listen((text: string) => {
    setSpokenText(text);
    handleCommand(text);
    setIsListening(false);
  });
};

// Handle command logic
const askGroq = async () => {
  if (!gptPrompt) return;

  const newHistory = [...chatHistory, { role: 'user', content: gptPrompt }];
  setChatHistory(newHistory);

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: gptPrompt }),
  });

  const data = await res.json();
  setChatHistory([...newHistory, { role: 'assistant', content: data.result }]);
  setGptPrompt('');
  speak(data.result);
};
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  document.body.setAttribute('data-theme', newTheme);
};

// const askGroq = async () => {
//   if (!gptPrompt) return;

//   const res = await fetch('/api/chat', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: gptPrompt }),
//   });

//   const data = await res.json();
//   setGptResponse(data.result);
//   speak(data.result); // Optional: have Jarvis read it aloud
// };

const handleCommand = (input: string) => {
  const cmd = input.toLowerCase();
  let response = "Sorry, I didn't get that.";

  if (cmd.includes("time")) response = `The current time is ${time}`;
  else if (cmd.includes("date")) response = `Today is ${date}`;
  else if (cmd.includes("location")) response = `You are in ${location}`;
  else if (cmd.includes("joke")) response = joke;
  else if (cmd.includes("quote")) response = quote;
  else if (cmd.includes("hello")) response = "Hello! I am Jarvis at your service.";
  else if (cmd.includes("search")) {
  const topic = cmd.replace("search", "").trim();
  fetchWikiSummary(topic);
  response = `Searching Wikipedia for ${topic}`;
}

  setResponseText(response);
  speak(response);
};

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 },
    }),
  };
  const fetchWikiSummary = (query: string) => {
  if (!query) return;
  axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
    .then((res) => {
      setWikiResult(res.data.extract);
      speak(res.data.extract); // Read it aloud
    })
    .catch(() => setWikiResult("Sorry, I couldn’t find anything."));
};

  return (
    <><header style={{
      width: '100%',
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🧠 Jarvis Dashboard</h1>
      <button onClick={toggleTheme} style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        color: 'white',
        padding: '0.5rem 1rem',
        cursor: 'pointer'
      }}>
        Toggle Theme
      </button>
    </header><main>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}
        >
          🧠 Jarvis Web Assistant
        </motion.h1>

        {[
          {
            id: 'location-time',
            content: (
              <>
                <p>📍 <strong>{location}</strong></p>
                <p>🗓️ {date}</p>
                <p>🕒 {time}</p>
              </>
            ),
          },
          {
            id: 'quote',
            content: (
              <>
                <h2>🌟 Quote of the Day</h2>
                <p>{quote}</p>
              </>
            ),
          },
          {
            id: 'news',
            content: (
              <>
                <h2>📰 Top News Headlines</h2>
                <ul>
                  {news.map((headline, i) => (
                    <li key={i}>• {headline}</li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            id: 'wiki-search',
            content: (
              <>
                <h2>🔍 Wikipedia Search</h2>
                <input
                  placeholder="Type a topic to search..."
                  value={wikiQuery}
                  onChange={(e) => setWikiQuery(e.target.value)} />
                <button
                  onClick={() => fetchWikiSummary(wikiQuery)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: '#0bc',
                    color: '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Search
                </button>
                {wikiResult && <p style={{ marginTop: '10px' }}>{wikiResult}</p>}
              </>
            ),
          },
          {
            id: 'joke',
            content: (
              <>
                <h2>😂 Joke of the Day</h2>
                <p>{joke}</p>
              </>
            ),
          },
          {
            id: 'text-command',
            content: (
              <>
                <h2>💬 Text Command</h2>
                <input
                  placeholder="Type a command like 'Tell me a joke'"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)} />
              </>
            ),
          },
          {
            id: 'gpt-chat',
            content: (
              <>
                <h2>🤖 GPT Chat</h2>
                <input
                  placeholder="Ask Jarvis..."
                  value={gptPrompt}
                  onChange={(e) => setGptPrompt(e.target.value)}
                />
                <button onClick={askGroq}>Ask</button>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                  {chatHistory.map((msg, i) => (
                    <p key={i}><strong>{msg.role === 'user' ? 'You' : 'Jarvis'}:</strong> {msg.content}</p>
                  ))}
                </div>
              </>
            )
          },
          {
            id: 'voice-command',
            content: (
              <>
                <h2>🎙️ Voice Command</h2>
                <button
                  onClick={handleVoiceCommand}
                  disabled={isListening}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isListening ? '#444' : '#0bc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {isListening ? 'Listening...' : 'Speak Now'}
                </button>

                {spokenText && <p><strong>You said:</strong> {spokenText}</p>}
                {responseText && <p><strong>Jarvis:</strong> {responseText}</p>}
              </>
            ),
          },
        ].map((item, i) => (
          <motion.section
            key={item.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {item.content}
          </motion.section>
        ))}
      </main></>

  );
}




// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }



