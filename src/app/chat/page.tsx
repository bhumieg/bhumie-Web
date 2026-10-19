'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { notificationManager } from '@/lib/browserNotifications';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Building,
  CheckCheck,
  Check,
  Phone,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ConversationItem {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    priceDisplay: string;
    locality: string;
    city: string;
    images: string[];
    propertyType: string;
  };
  isOwner: boolean;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  isMine: boolean;
  text: string;
  isRead: boolean;
  createdAt: string;
  pending?: boolean;
}

interface ActiveConversationData {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    priceDisplay: string;
    locality: string;
    city: string;
    images: string[];
    propertyType: string;
    ownerPhone?: string | null;
  };
  isOwner: boolean;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  };
  messages: Message[];
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const conversationIdFromUrl = searchParams.get('id');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(conversationIdFromUrl);
  const [activeChat, setActiveChat] = useState<ActiveConversationData | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const prevMessagesCountRef = useRef<number>(0);

  const quickReplies = [
    'Is this property still available?',
    'Can I schedule a visit tomorrow?',
    'What is the final price?',
    'Please share the exact address',
  ];

  // Helper to scroll ONLY the internal messages div to the bottom (NEVER scrolling the page window)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // 1. Fetch Conversations List
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.status === 401) return;
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        if (!activeId && data.conversations.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setActiveId(data.conversations[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoadingList(false);
    }
  };

  // 2. Fetch Active Conversation Details & Messages
  const fetchActiveChat = async (id: string, isSilent = false) => {
    if (!isSilent) setLoadingChat(true);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
      if (res.status === 401) return;
      const data = await res.json();
      if (data.success && data.conversation) {
        const newConvo: ActiveConversationData = data.conversation;

        setActiveChat((prev) => {
          if (!prev || prev.id !== newConvo.id) {
            isInitialLoadRef.current = true;
            return newConvo;
          }

          const prevLen = prev.messages.length;
          const newLen = newConvo.messages.length;

          // Check if new incoming message from the other person
          if (newLen > prevLen) {
            const lastMsg = newConvo.messages[newLen - 1];
            if (!lastMsg.isMine) {
              // Sound chime & desktop/mobile system notification
              notificationManager.sendNotification({
                title: `Bhumie: ${newConvo.otherUser.name || 'New Message'}`,
                body: lastMsg.text,
                icon: newConvo.otherUser.avatar || newConvo.property.images?.[0] || '/favicon.ico',
                tag: `chat-${newConvo.id}`,
              });
            }

            // Check if user is scrolled near bottom
            const container = messagesContainerRef.current;
            if (container) {
              const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
              if (isNearBottom) {
                setTimeout(() => scrollToBottom('smooth'), 50);
              }
            }
          }

          // If messages identical, avoid unnecessary state update
          if (
            prevLen === newLen &&
            prev.messages[prevLen - 1]?.id === newConvo.messages[newLen - 1]?.id &&
            prev.messages.every((m, i) => m.isRead === newConvo.messages[i]?.isRead)
          ) {
            return prev;
          }

          return newConvo;
        });
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    } finally {
      if (!isSilent) setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (conversationIdFromUrl) {
      setActiveId(conversationIdFromUrl);
      isInitialLoadRef.current = true;
    }
  }, [conversationIdFromUrl]);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Handle active conversation selection & smart polling
  useEffect(() => {
    if (!activeId) return;

    isInitialLoadRef.current = true;
    fetchActiveChat(activeId);

    // Poll every 3 seconds, but pause if tab is hidden
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return; // don't poll while tab is hidden
      }
      fetchActiveChat(activeId, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeId]);

  // Auto-scroll on initial conversation load
  useEffect(() => {
    if (activeChat?.messages && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setTimeout(() => scrollToBottom('auto'), 50);
    }
    prevMessagesCountRef.current = activeChat?.messages.length || 0;
  }, [activeChat?.id, activeChat?.messages]);

  // Send message with instant optimistic update
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeId || sending) return;

    setInputText('');

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user?.id || 'me',
      senderName: user?.name || 'You',
      isMine: true,
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // 1. Instantly display in UI
    setActiveChat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMsg],
      };
    });

    // 2. Scroll immediately inside messages box
    setTimeout(() => scrollToBottom('smooth'), 20);

    setSending(true);

    try {
      const res = await fetch(`/api/chat/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic message with actual DB message
        setActiveChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) => (m.id === tempId ? { ...data.message, isMine: true } : m)),
          };
        });
        fetchConversations();
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Bhumie Live Chat</h2>
          <p className="text-sm text-gray-600 mb-6">
            Log in to chat directly with property owners and buyers in real time.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            Log In / Sign Up with OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
      {/* Container constrained to viewport so whole page stays locked and doesn't jump */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-6rem)] max-h-[900px]">
        
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${
            activeId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-gray-900 leading-tight">Messages</h1>
                <p className="text-[11px] text-gray-500 font-semibold">2-Way Live Chat</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
              {conversations.length} Active
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingList ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Building className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-bold text-gray-700 mb-1">No chats yet</p>
                <p className="text-xs text-gray-500 mb-4">
                  Browse properties and click &ldquo;Chat with Owner&rdquo; to start talking!
                </p>
                <Link
                  href="/properties"
                  className="inline-block text-xs font-bold text-blue-600 hover:underline"
                >
                  Browse Properties &rarr;
                </Link>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeId === c.id;
                const thumb = c.property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200';
                const initialLetter = c.otherUser.name
                  ? c.otherUser.name[0].toUpperCase()
                  : c.otherUser.email[0].toUpperCase();

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveId(c.id);
                      isInitialLoadRef.current = true;
                      router.push(`/chat?id=${c.id}`);
                    }}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* User Avatar with initial fallback / Property Thumbnail */}
                    <div className="relative shrink-0">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        {c.otherUser.avatar ? (
                          <img
                            src={c.otherUser.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                            {initialLetter}
                          </div>
                        )}
                      </div>
                      {/* Property mini badge on avatar */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md overflow-hidden border border-white shadow-xs">
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-xs font-black text-gray-900 truncate">
                          {c.otherUser.name || c.otherUser.email.split('@')[0]}
                          <span className="text-[10px] font-medium text-gray-400 ml-1">
                            ({c.isOwner ? 'Buyer' : 'Owner'})
                          </span>
                        </h3>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-blue-600 truncate mb-1">
                        {c.property.title} • {c.property.priceDisplay}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {c.lastMessage || 'No messages yet'}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Room Window */}
        <div
          className={`flex-1 flex flex-col bg-gray-50/30 overflow-hidden ${
            !activeId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Room Top Bar - LOCKED IN PLACE */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveId(null);
                      router.push('/chat');
                    }}
                    className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Other User Avatar or Initial Letter */}
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0 border border-blue-500/20">
                    {activeChat.otherUser.avatar ? (
                      <img
                        src={activeChat.otherUser.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {activeChat.otherUser.name
                          ? activeChat.otherUser.name[0].toUpperCase()
                          : activeChat.otherUser.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-gray-900 leading-tight">
                        {activeChat.otherUser.name || activeChat.otherUser.email.split('@')[0]}
                      </h2>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-emerald-600 font-bold">Online</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {activeChat.isOwner ? 'Interested Buyer' : 'Property Owner'}
                    </p>
                  </div>
                </div>

                {/* Property Mini Header Card */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${activeChat.property.id}`}
                    target="_blank"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
                  >
                    <span className="truncate max-w-[150px]">{activeChat.property.title}</span>
                    <span className="text-blue-600 font-black">{activeChat.property.priceDisplay}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  {activeChat.property.ownerPhone && (
                    <a
                      href={`tel:${activeChat.property.ownerPhone}`}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Call Owner"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Property Details Banner */}
              <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 text-blue-900 truncate">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium truncate">
                    Discussing: <strong>{activeChat.property.title}</strong>
                  </span>
                </div>
                <Link
                  href={`/properties/${activeChat.property.id}`}
                  className="text-blue-700 font-bold hover:underline shrink-0 ml-2"
                >
                  View Property
                </Link>
              </div>

              {/* Messages Thread - SCROLLS INTERNALLY ONLY (NEVER SCROLLS PAGE) */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-3"
              >
                {loadingChat && activeChat.messages.length === 0 ? (
                  <div className="flex items-center justify-center py-20 text-gray-400 text-xs gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading conversation...</span>
                  </div>
                ) : activeChat.messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Start the conversation! Say hello or use one of the quick replies below.
                  </div>
                ) : (
                  activeChat.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          m.isMine
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-gray-900 rounded-bl-xs border border-gray-200 shadow-xs'
                        }`}
                      >
                        <p className="break-words">{m.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            m.isMine ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {m.isMine && (
                            m.pending ? (
                              <Clock className="w-3 h-3 text-blue-200 animate-pulse" />
                            ) : m.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-blue-200" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* OLX-style Quick Action Chips */}
              <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
                </span>
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleSendMessage(qr)}
                    disabled={sending}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-xs font-semibold transition-colors border border-gray-200 cursor-pointer disabled:opacity-50"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Message Input Box - PINNED AT BOTTOM */}
              <div className="p-3 bg-white border-t border-gray-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-gray-800 mb-1">Select a conversation</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Choose an existing chat from the left panel or click &ldquo;Chat with Owner&rdquo; on any property to start an instant 2-way conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
