import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, BrainCircuit, Loader2, Info } from 'lucide-react'
import { PageHeader } from '@/components/common/PageElements'
import { useMisc } from '@/data/misc'
import { fetchFromAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function AIAssistantPage() {
  const { dummyChatHistory, suggestedPrompts, loading } = useMisc()
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && messages.length === 0) {
      setMessages(dummyChatHistory)
    }
  }, [loading, dummyChatHistory])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const newUserMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, newUserMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetchFromAPI<{response: string}>('/copilot', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      })

      const newAiMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: response.response,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, newAiMsg])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: 'Error: Failed to connect to the Investigative Copilot.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-[1200px] mx-auto">
      <PageHeader
        title="MOSAIC Intelligence Assistant"
        description="Natural language queries for crime data and predictive analytics"
        icon={BrainCircuit}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <Bot className="w-4 h-4" /> Model: MOSAIC-LLM-v2
          </div>
        }
      />

      <div className="flex-1 glass-card rounded-xl border border-border/50 flex flex-col overflow-hidden relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  msg.role === 'user' ? "bg-secondary" : "bg-primary/20 border border-primary/30"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>
                
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-secondary/40 border border-border/50 text-foreground rounded-tl-sm"
                )}>
                  {/* Basic markdown-like rendering for dummy responses */}
                  {msg.content.split('\n').map((line: string, j: number) => {
                    if (line.startsWith('**')) return <p key={j} className="font-bold mt-2 mb-1 text-primary-foreground/90">{line.replace(/\*\*/g, '')}</p>
                    if (line.startsWith('•')) return <li key={j} className="ml-2 mb-1">{line.substring(1)}</li>
                    if (line.trim() === '') return <div key={j} className="h-2" />
                    return <p key={j}>{line.replace(/\*\*/g, '')}</p>
                  })}
                  <div className={cn(
                    "text-[10px] mt-2 opacity-60 text-right",
                    msg.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[85%] mr-auto"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-secondary/40 border border-border/50 rounded-tl-sm flex items-center gap-1">
                  <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md">
          {/* Suggested Prompts */}
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedPrompts.slice(0, 4).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full border border-border/50 bg-secondary/30 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Ask about crime patterns, request patrol strategies, or generate reports..."
              className="w-full pl-4 pr-12 py-3.5 bg-secondary/30 border border-border/50 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
            <Info className="w-3 h-3" />
            AI can make mistakes. Verify critical intelligence before operational deployment.
          </div>
        </div>
      </div>
    </div>
  )
}
