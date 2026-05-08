import { useState, useRef, useEffect } from 'react';
import { analyzeResume } from '../services/api';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Recruitment Assistant. I can analyze resumes, extract skills, and generate candidate scores. You can also upload a resume directly!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiResponse = "I've analyzed that request. Here is the information you need.";
      const lowerText = text.toLowerCase();
      if (lowerText.includes('summarize') || lowerText.includes('resume')) {
        aiResponse = "📄 **Resume Summary:**\nThe candidate has 5+ years of experience in Full-Stack Development with a strong focus on React and Node.js.\n\n💡 **Suggested Role:** Senior Frontend Engineer\n\n❓ **Interview Questions:**\n  1. How do you manage React state in complex apps?\n  2. Describe a challenging Node.js scaling issue.";
      } else if (lowerText.includes('score') || lowerText.includes('match')) {
        aiResponse = "🎯 **Candidate-Job Match Score: 88%**\nRecommendation: Strong candidate for the Senior Developer role.\n\nKey Match Factors:\n- 100% Match on React/Node.js\n- 80% Match on AWS experience";
      } else if (lowerText.includes('skill') || lowerText.includes('extract')) {
        aiResponse = "🛠️ **Extracted Skills:**\n- React, Node.js, Python, MongoDB, AWS, Docker, Kubernetes";
      }
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const parseMarkdown = (text) => {
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { role: 'user', text: `📎 Uploaded: ${file.name}` }]);
    setIsTyping(true);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await analyzeResume(formData);
      const data = res.data.data;
      
      const aiResponse = `✅ **Analysis Complete for ${data.filename}**\n\n` +
        `📊 **ATS Score:** ${data.ats_score}%\n` +
        `🎯 **Job Match:** ${data.match_percentage}% (${data.suggested_role})\n\n` +
        `📝 **Summary:** ${data.summary}\n\n` +
        `🛠️ **Top Skills:** ${data.extracted_data.skills.join(', ')}\n\n` +
        `🎓 **Education:** ${data.extracted_data.education}\n` +
        `💼 **Experience:** ${data.extracted_data.experience}\n\n` +
        `💡 **Recommendation:** ${data.recommendation}\n\n` +
        `❓ **Suggested Interview Questions:**\n` + 
        data.interview_questions.map((q, i) => `  ${i+1}. ${q}`).join('\n');

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Error analyzing the resume. Please try again.' }]);
    } finally {
      setIsTyping(false);
      setIsUploading(false);
    }
  };

  return (
    <>
      <button className={`ai-fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="ai-icon">✨</span>
      </button>

      {isOpen && (
        <div className="ai-window">
          <div className="ai-header">
            <div className="ai-header-info">
              <span className="ai-header-icon">🤖</span>
              <div><h4>RecruitAI Assistant</h4><p>{isUploading ? 'Analyzing...' : 'Online & Ready'}</p></div>
            </div>
            <button className="ai-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className="ai-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message-wrapper ${msg.role}`}>
                {msg.role === 'ai' && <div className="ai-message-avatar">🤖</div>}
                <div className="ai-message">
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{parseMarkdown(line)}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message-wrapper ai">
                <div className="ai-message-avatar">🤖</div>
                <div className="ai-message typing"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-footer">
            <button className="ai-upload-btn" onClick={() => fileInputRef.current.click()} title="Upload Resume">
              📎
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
            </button>
            <input 
              type="text" 
              placeholder="Ask AI or upload a resume..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            />
            <button className="ai-send" onClick={() => handleSend(input)}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
