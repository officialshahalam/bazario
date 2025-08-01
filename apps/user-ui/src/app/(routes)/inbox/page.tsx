"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "apps/user-ui/src/context/websocket-context";
import useRequireAuth from "apps/user-ui/src/hooks/useRequireAuth";
import ChatInput from "apps/user-ui/src/shared/components/chats/ChatInput";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { isProtected } from "packages/utills/protected";
import React, { useEffect, useRef, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const { user } = useRequireAuth();
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
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversation"],
    queryFn: async () => {
      const res = await getAxiosInstance("chatting").get(
        "/get-user-conversations",
        isProtected
      );
      return res?.data?.conversations;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await getAxiosInstance("chatting").get(
        `/get-messages/${conversationId}?page=1`,
        isProtected
      );
      setPage(1);
      setHasMore(res?.data?.hasMore);
      setHasFetchedOnce(true);
      return res?.data?.messages.reverse();
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
    ws?.send(
      JSON.stringify({
        type: "MARK_AS_SEEN",
        conversationId: chat?.conversationId,
      })
    );
    router.push(`?conversationId=${chat?.conversationId}`);
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const payload = {
      fromUserId: user?.id,
      toUserId: selectedChat?.seller?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "user",
    };
    ws?.send(JSON.stringify(payload));

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId
          ? { ...chat, lastMessage: payload?.messageBody }
          : chat
      )
    );
    setMessage("");
    scrollToBottom();
  };

  const loadMoreMessage = async () => {
    const nextPage = page + 1;
    const res = await getAxiosInstance("chatting").get(
      `/get-messages/${conversationId}?page=${nextPage}`,
      isProtected
    );
    queryClient.setQueryData(["messages", conversationId], (old: any[]) => [
      ...res?.data?.messages.reverse(),
      ...old,
    ]);
    setPage(nextPage);
    setHasMore(res?.data?.hasMore);
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  const getLastMessage = (chat: any) => chat?.lastMessage || "";

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
                content: newMsg?.content,
                senderType: newMsg.senderType,
                seen: false,
                createdAt: new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
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
  }, [ws, queryClient]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    if (conversation) setChats(conversation);
  }, [conversation]);

  useEffect(() => {
    if (message.length > 0) scrollToBottom();
  }, [message]);

  return (
    <div className="w-full">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          {/* sidebar */}
          <div className="w-[320px] border-r border-r-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No Conversation</div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat?.conversationId;
                  console.log("char is", chat);
                  return (
                    <button
                      key={chat?.conversationId}
                      onClick={() => handleChatSelect(chat)}
                      className={`w-full text-left px-4 py-3 transition-all hover:bg-gray-100 ${
                        isActive ? "bg-blue-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            chat?.seller?.avatar ||
                            "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
                          }
                          alt={chat?.seller?.name}
                          width={36}
                          height={36}
                          className="rounded-full border w-10 h-10 object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {chat?.seller?.name}
                            </span>
                            {chat?.seller?.isOnline && (
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
          {/* Chat Container */}
          <div className="flex flex-col flex-1 bg-gray-100">
            {selectedChat ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-b-gray-200 bg-white flex items-center gap-4">
                  <Image
                    src={
                      selectedChat?.seller?.avatar ||
                      "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
                    }
                    alt={selectedChat?.seller?.name}
                    width={40}
                    height={40}
                    className="rounded-full border border-gray-200 w-10 h-10 object-cover"
                  />
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat?.seller?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat?.seller?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 text-sm"
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded-md"
                        onClick={loadMoreMessage}
                      >
                        Load Previous Message
                      </button>
                    </div>
                  )}
                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg?.senderType === "user"
                          ? "items-end ml-auto"
                          : "items-start"
                      } max-w-[80%]`}
                    >
                      <div
                        className={`${
                          msg?.senderType === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800"
                        } px-4 py-2 rounded-lg shadow-sm w-fit`}
                      >
                        {msg?.text || msg?.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 mt-1 flex items-center ${
                          msg?.senderType === "user"
                            ? "mr-1 justify-end"
                            : "ml-1"
                        }`}
                      >
                        {msg?.time ||
                          new Date(msg?.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef} />
                </div>
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
