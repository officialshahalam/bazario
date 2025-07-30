"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import { useWebSocket } from "apps/seller-ui/src/context/websocket-context";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import ChatInput from "apps/seller-ui/src/shared/components/chats/ChatInput";

const ChatPage = () => {
  const searchParams = useSearchParams();
  const { seller } = useSeller();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const conversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();
  const socketContext = useWebSocket();
  const ws = socketContext?.ws;

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await getAxiosInstance("chatting").get(
        "/get-seller-conversations"
      );
      return res.data.conversations;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await getAxiosInstance("chatting").get(
        `/get-seller-messages/${conversationId}?page=1`
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    router.push(`?conversationId=${chat?.conversationId}`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "MARK_AS_SEEN",
          conversationId: chat?.conversationId,
        })
      );
    }
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
      ws.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      messageBody: message,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };
    ws.send(JSON.stringify(payload));

    setMessage("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;
        if (newMsg.conversationId === conversationId) {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => [
              ...old,
              {
                content: newMsg?.messageBody || newMsg.content || "",
                senderType: newMsg.senderType,
                seen: false,
                createdAt: newMsg?.createdAt || new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId == newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content }
              : chat
          )
        );
      }

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
    };
  }, [ws, conversationId]);

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timeOut = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeOut);
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  return (
    <div className="w-full">
      <div className="flex h-screen shadow-inner overflow-hidden bg-gray-950 text-gray-100">
        {/* Sidebar */}
        <div className="w-[320px] border-r border-gray-800 bg-gray-950">
          <div className="p-4 border-b border-gray-800 text-lg font-semibold">
            Messages
          </div>
          <div className="divide-y divide-gray-900">
            {isLoading ? (
              <div className="text-center py-5 text-sm">Loading...</div>
            ) : chats.length === 0 ? (
              <p className="text-center py-5 text-sm">
                No conversation available yet!
              </p>
            ) : (
              chats.map((chat) => {
                const isActive =
                  selectedChat?.conversationId === chat.conversationId;
                return (
                  <button
                    key={chat.conversationId}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full text-left px-4 py-3 transition ${
                      isActive ? "bg-blue-950" : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        alt={chat.user?.name}
                        src={
                          chat.user?.avatar[0].url ||
                          "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
                        }
                        width={36}
                        height={36}
                        className="rounded-full border w-[40px] h-[40px] object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">
                            {chat.user?.name}
                          </span>
                          {chat.user?.IsOnline && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 truncate max-w-[170px]">
                            {chat.lastMessage || ""}
                          </p>
                          {chat?.conversationId !==
                            selectedChat?.conversationId &&
                            chat?.unreadCount > 0 && (
                              <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                                {chat?.unreadCount}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col flex-1 bg-gray-950">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3">
                <Image
                  src={
                    selectedChat.user?.avatar[0].url ||
                    "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
                  }
                  alt={selectedChat.user.name}
                  width={40}
                  height={40}
                  className="rounded-full border w-[40px] h-[40px] object-cover"
                />
                <div>
                  <h2 className="text-white font-semibold text-base">
                    {selectedChat.user?.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {selectedChat.user?.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm"
                ref={messageContainerRef}
              >
                {messages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.senderType == "seller"
                        ? "items-end ml-auto"
                        : "items-start"
                    } max-w-[80%]`}
                  >
                    <div
                      className={`${
                        msg.senderType === "seller"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-200"
                      } px-4 py-2 rounded-lg shadow-sm w-fit`}
                    >
                      {msg.content}
                    </div>
                    <div
                      className={`text-[10px] text-gray-400 mt-1 flex items-center ${
                        msg.senderType === "seller"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                <div ref={scrollAnchorRef} />
              </div>

              {/* Input */}
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSend}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
