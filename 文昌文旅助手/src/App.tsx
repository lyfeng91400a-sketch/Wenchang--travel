import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Mic, 
  MapPin, 
  CloudSun, 
  Sparkles
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "文昌2日游怎么安排？",
    "规划一个包含东郊椰林、石头公园的路线",
    "帮我介绍一下文昌航天发射场",
    "想吃正宗文昌鸡，求推荐老字号美食",
    "文昌骑楼老街有什么特色？"
  ];

  const presetAnswers: Record<string, string> = {
    "你好": "你好！我是您的文昌旅游小助手航小昌。很高兴为您服务！无论是景点推荐、美食打卡，还是行程规划，您都可以随时问我哦！",
    "文昌2日游怎么安排？": `**文昌2日游经典路线推荐：**

**第一天：航天科技与椰林风情**
*   **上午：文昌航天科普中心**
    *   近距离观看航天发射塔架，了解中国航天发展史。建议提前预约门票。
*   **中午：品尝地道文昌鸡**
    *   前往市区或潭牛镇，找一家老字号品尝最正宗的白切文昌鸡。
*   **下午：东郊椰林**
    *   在绵延十里的椰林中漫步，感受浓郁的热带海岛风情，品尝新鲜椰子水。
*   **晚上：环球码头海鲜夜市**
    *   体验当地人的夜生活，挑选新鲜海鲜加工，价格实惠。

**第二天：历史文化与自然奇观**
*   **上午：文昌孔庙与骑楼老街**
    *   参观海南保存最完整的古建筑群之一文昌孔庙，随后漫步文南老街，感受南洋侨乡文化。
*   **中午：老街抱罗粉**
    *   品尝海南四大名粉之一的抱罗粉，配上美味的牛肉干和花生。
*   **下午：铜鼓岭与石头公园**
    *   登铜鼓岭俯瞰月亮湾全景，风光旖旎。随后前往石头公园，欣赏海浪拍打奇特礁石的壮美景观。

**交通建议：**
*   自驾是最便利的方式，各个景点之间距离适中。
*   如果没有自驾，也可以在高铁文昌站出站后乘坐公交或打车。

祝您在文昌不仅能大饱口福，也能大饱眼福！`
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isGenerating) return;
    
    // Normalize text
    const normalizedText = text.trim();

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: normalizedText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Check for preset answers
    if (presetAnswers[normalizedText]) {
      const modelMessageId = (Date.now() + 1).toString();
      // Add a slight delay to make it feel natural
      setIsGenerating(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: presetAnswers[normalizedText] }]);
        setIsGenerating(false);
      }, 500);
      return;
    }

    setIsGenerating(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("🚨 API免费额度已耗尽 (429)。请稍后再试或检查计费状态。");
        }
        throw new Error('网络请求失败，请重试');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                setMessages(prev => prev.map(msg => 
                  msg.id === modelMessageId 
                    ? { ...msg, content: msg.content + data.text }
                    : msg
                ));
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : "抱歉，出错了，请稍后再试。";
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId 
          ? { ...msg, content: errorMsg }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div 
        className="w-full max-w-[1400px] h-screen relative font-sans bg-white shadow-2xl overflow-hidden flex flex-col"
      >
        {/* 整个页面内容容器 (可滚动) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col pb-24">
          
          {/* Header Image Background */}
          <div className="absolute top-0 left-0 right-0 h-[190px] pointer-events-none select-none z-0">
            <img 
              src="/bg.jpg" 
              alt="Background" 
              className="w-full h-full object-cover object-top"
            />
            {/* Gradient overlay to smoothly transition to the white background below */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
          </div>

          {/* Top Banner Area */}
          <div className="w-full max-w-[1200px] mx-auto px-6 pt-4 pb-2 flex justify-between items-end shrink-0 relative z-10">
            <div className="flex flex-col space-y-1 z-10 pb-1">
              {/* Logo area */}
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  航小昌带您游文昌
                </h1>
              </div>

              {/* Weather / Location Info */}
              <div className="text-gray-700 text-sm font-medium mt-2 space-y-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>文昌市</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>2026/06/05</span>
                  <CloudSun className="w-4 h-4 ml-1" />
                  <span>多云 28°C</span>
                </div>
              </div>
            </div>

            {/* IP Character */}
            <div className="z-10 relative shrink-0">
              <div className="w-24 h-32 md:w-28 md:h-40 flex flex-col items-center justify-end relative">
                <img 
                  src="/航小昌.png" 
                  alt="航小昌IP" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 relative z-30 flex flex-col">
            
            {/* Suggested Questions Component */}
            <div className="bg-slate-50/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center drop-shadow-sm">
                其他人都这样问我
              </h2>
              
              <ul className="space-y-0 text-sm bg-white/80 rounded-lg overflow-hidden border border-gray-100">
                {suggestedQuestions.map((q, idx) => (
                  <li 
                    key={idx} 
                    className="flex text-gray-800 py-2.5 border-b border-gray-100 last:border-0 hover:bg-white cursor-pointer transition-colors px-3 rounded"
                    onClick={() => handleSend(q)}
                  >
                    <span className="w-6 text-blue-600/80 font-mono font-medium">{idx + 1}</span>
                    <span className="flex-1 font-medium">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empty State Spacer */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                {/* Keeping empty space as requested */}
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6 pt-2 pb-2 flex-1">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[80%] shadow text-[15px] leading-relaxed">
                      {message.content}
                    </div>
                  ) : (
                    <div className="bg-white/95 backdrop-blur-md border border-gray-100 px-6 py-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm text-gray-800 markdown-body">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center space-x-1.5 h-6">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Absolute Bottom Input Area anchored to the container */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200/60 p-4 shrink-0 z-30 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
          <div className="w-full max-w-[1200px] mx-auto flex items-center space-x-3 bg-white border border-gray-200/80 rounded-full px-4 py-2.5 shadow-sm focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <button className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
              <Mic className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50 min-w-0"
              placeholder="请输入您想探索的文昌景点、美食或旅游需求..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              disabled={isGenerating}
            />
            
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex flex-shrink-0 items-center justify-center group shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5 group-hover:-mt-1 group-hover:ml-1 group-disabled:-mt-0 group-disabled:ml-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

