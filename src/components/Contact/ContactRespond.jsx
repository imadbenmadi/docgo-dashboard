import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    UserIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import contactAPI from "../../API/Contact";

const ContactRespond = () => {
    const location = useLocation();
    const [unrespondedMessages, setUnrespondedMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchUnrespondedMessages();
    }, []);

    useEffect(() => {
        // Handle messageId from URL params
        const urlParams = new URLSearchParams(location.search);
        const messageId = urlParams.get("messageId");

        if (messageId && unrespondedMessages.length > 0) {
            const targetMessage = unrespondedMessages.find(
                (msg) => msg.id.toString() === messageId
            );
            if (targetMessage) {
                setSelectedMessage(targetMessage);
            }
        }
    }, [location.search, unrespondedMessages]);

    const fetchUnrespondedMessages = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getContactMessages({
                status: "unread,read",
                sortBy: "createdAt",
                sortOrder: "ASC",
                limit: 50,
            });

            if (response.data.success) {
                const messages = response.data.data.messages.filter(
                    (msg) => msg.status === "unread" || msg.status === "read"
                );
                setUnrespondedMessages(messages);
                if (messages.length > 0 && !selectedMessage) {
                    setSelectedMessage(messages[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching unresponded messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!response.trim() || !selectedMessage) return;

        try {
            setSending(true);
            await contactAPI.updateContactMessage(selectedMessage.id, {
                adminResponse: response,
                status: "responded",
            });

            // Update local state
            setUnrespondedMessages((prev) =>
                prev.filter((msg) => msg.id !== selectedMessage.id)
            );

            // Select next message or clear selection
            const currentIndex = unrespondedMessages.findIndex(
                (msg) => msg.id === selectedMessage.id
            );
            if (currentIndex < unrespondedMessages.length - 1) {
                setSelectedMessage(unrespondedMessages[currentIndex + 1]);
            } else if (currentIndex > 0) {
                setSelectedMessage(unrespondedMessages[currentIndex - 1]);
            } else {
                setSelectedMessage(null);
            }

            setResponse("");
        } catch (error) {
            console.error("Error sending response:", error);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "text-red-600 bg-red-100";
            case "high":
                return "text-orange-600 bg-orange-100";
            case "medium":
                return "text-yellow-600 bg-yellow-100";
            case "low":
                return "text-gray-600 bg-gray-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getPriorityIcon = (priority) => {
        if (priority === "urgent" || priority === "high") {
            return <ExclamationTriangleIcon className="h-4 w-4" />;
        }
        return <ClockIcon className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (unrespondedMessages.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        All caught up!
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There are no messages waiting for a response.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex h-96">
                {/* Message List */}
                <div className="w-1/3 border-r border-gray-200 pr-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Pending Responses ({unrespondedMessages.length})
                    </h3>
                    <div className="space-y-3 overflow-y-auto max-h-80">
                        {unrespondedMessages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => setSelectedMessage(message)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedMessage?.id === message.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {message.Name}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {message.email}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {message.messagePlain ||
                                                message.message}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 ml-2">
                                        <div
                                            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                                message.priority
                                            )}`}
                                        >
                                            {getPriorityIcon(message.priority)}
                                            <span className="ml-1 capitalize">
                                                {message.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <CalendarDaysIcon className="h-3 w-3 mr-1" />
                                            {formatDate(message.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Details & Response */}
                <div className="w-2/3 pl-6">
                    {selectedMessage ? (
                        <div className="h-full flex flex-col">
                            {/* Message Header */}
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {selectedMessage.Name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedMessage.email}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <CalendarDaysIcon className="h-3 w-3 mr-1" />
                                                {formatDate(
                                                    selectedMessage.createdAt
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                From: {selectedMessage.context}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                User: {selectedMessage.userType}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                                            selectedMessage.priority
                                        )}`}
                                    >
                                        {getPriorityIcon(
                                            selectedMessage.priority
                                        )}
                                        <span className="ml-1 capitalize">
                                            {selectedMessage.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Original Message */}
                            <div className="flex-1 mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Original Message:
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    {selectedMessage.messageHtml ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: selectedMessage.messageHtml,
                                            }}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {selectedMessage.messagePlain ||
                                                selectedMessage.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Response Input */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-900">
                                    Your Response:
                                </h4>
                                <textarea
                                    value={response}
                                    onChange={(e) =>
                                        setResponse(e.target.value)
                                    }
                                    placeholder="Type your response here..."
                                    rows={6}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        {response.length} characters
                                    </div>
                                    <button
                                        onClick={handleSendResponse}
                                        disabled={!response.trim() || sending}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                                Send Response
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    Select a message
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Choose a message from the list to respond to
                                    it.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactRespond;
