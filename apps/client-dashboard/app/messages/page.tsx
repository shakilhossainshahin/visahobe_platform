'use client';

import React, { useState } from 'react';
import { Container, Card, Badge, Button } from '@visahobe/ui';

interface ThreadMessage {
  id: string;
  sender: 'specialist' | 'applicant' | 'system';
  senderName: string;
  role: string;
  avatarText: string;
  content: string;
  timestamp: string;
  verifiedBadge?: boolean | undefined;
}

const INITIAL_MESSAGES: ThreadMessage[] = [
  {
    id: 'msg-1',
    sender: 'specialist',
    senderName: 'Sarah Jenkins',
    role: 'Senior Immigration Specialist (MOM Reg #EP-8842)',
    avatarText: 'SJ',
    content:
      'Hello Tanvir, welcome to your VisaHobe Workspace. I am assigned as your primary case specialist for your Singapore Employment Pass application. We have verified your degree credentials with DataFlow and confirmed a passing score on the COMPASS framework.',
    timestamp: 'Nov 04, 2026 • 10:15 AM',
    verifiedBadge: true,
  },
  {
    id: 'msg-2',
    sender: 'system',
    senderName: 'VisaHobe Automation Engine',
    role: 'Automated Audit',
    avatarText: '🤖',
    content:
      'Audit Notice: Degree certificate (BSc in Computer Science) verified and approved by Lead Verifier. 20/20 foundational points recorded.',
    timestamp: 'Nov 04, 2026 • 10:16 AM',
  },
  {
    id: 'msg-3',
    sender: 'applicant',
    senderName: 'Tanvir Ahmed',
    role: 'Primary Applicant',
    avatarText: 'TA',
    content:
      'Thank you Sarah! That is great news. Could you clarify what bank statements are needed for the proof of funds submission?',
    timestamp: 'Nov 05, 2026 • 02:40 PM',
  },
  {
    id: 'msg-4',
    sender: 'specialist',
    senderName: 'Sarah Jenkins',
    role: 'Senior Immigration Specialist (MOM Reg #EP-8842)',
    avatarText: 'SJ',
    content:
      'Under MOM guidelines, we require your official 6-month bank statement showing regular monthly salary credit transfers matching your current employment contract. You can upload it directly into your Document Vault tab whenever ready.',
    timestamp: 'Nov 06, 2026 • 09:30 AM',
    verifiedBadge: true,
  },
];

export default function CaseMessagesPage() {
  const [messages, setMessages] = useState<ThreadMessage[]>(INITIAL_MESSAGES);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);

    const newMsg: ThreadMessage = {
      id: `msg-${Date.now()}`,
      sender: 'applicant',
      senderName: 'Tanvir Ahmed',
      role: 'Primary Applicant',
      avatarText: 'TA',
      content: replyText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');
    setIsSending(false);
  };

  return (
    <div className="py-8 md:py-12 bg-[#F8FAFC] min-h-screen">
      <Container size="2xl">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand" size="sm">
                  Encrypted Channel
                </Badge>
                <span className="text-xs text-[#64748B] font-medium">Case #VH-2026-SG-4921</span>
              </div>
              <h1 className="text-2xl font-display font-extrabold text-[#0D3B2E]">
                Specialist Communications & Live Updates
              </h1>
              <p className="text-xs text-[#475569]">
                Direct line to your assigned Ministry of Manpower certified case verifiers.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#0D3B2E] text-white font-bold flex items-center justify-center text-sm">
                SJ
              </div>
              <div className="flex flex-col text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0D3B2E]">Sarah Jenkins</span>
                  <span className="text-[10px] text-[#15803D]">● Online</span>
                </div>
                <span className="text-[11px] text-[#64748B]">Lead Immigration Verifier</span>
              </div>
            </div>
          </div>

          {/* Messages Thread Container */}
          <Card variant="default" className="bg-white p-6 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col gap-4 divide-y divide-[#F8FAFC]">
              {messages.map((msg) => {
                const isSystem = msg.sender === 'system';
                const isApplicant = msg.sender === 'applicant';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="py-2 flex items-center justify-center text-center">
                      <div className="px-4 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs text-[#475569] max-w-xl">
                        <span className="font-semibold text-[#0D3B2E] mr-1.5">
                          {msg.senderName}:
                        </span>
                        <span>{msg.content}</span>
                        <span className="block text-[10px] text-[#94A3B8] mt-0.5">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`pt-4 first:pt-0 flex gap-3.5 ${
                      isApplicant ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                        isApplicant
                          ? 'bg-[#E3EFEA] text-[#0D3B2E] border border-[#0D3B2E]/20'
                          : 'bg-[#0D3B2E] text-white shadow-xs'
                      }`}
                    >
                      {msg.avatarText}
                    </div>

                    <div
                      className={`flex flex-col gap-1 max-w-xl ${
                        isApplicant ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#0D3B2E]">{msg.senderName}</span>
                        {msg.verifiedBadge && (
                          <Badge variant="brand" size="sm">
                            Verified Specialist
                          </Badge>
                        )}
                        <span className="text-[10px] text-[#94A3B8]">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isApplicant
                            ? 'bg-[#0D3B2E] text-white rounded-tr-xs'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-tl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer Form */}
            <form
              onSubmit={handleSendMessage}
              className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message-reply"
                  className="text-xs font-bold uppercase tracking-wider text-[#0D3B2E]"
                >
                  Message Case Specialist
                </label>
                <textarea
                  id="message-reply"
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ask a question about your document verification, timeline, or embassy appointment..."
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  🔒 Messages are encrypted and archived in accordance with legal retention
                  policies.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyText.trim() || isSending}
                >
                  Send Reply
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
