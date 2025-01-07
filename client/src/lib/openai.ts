import { useMutation } from "@tanstack/react-query";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const MODEL = "gpt-4o";

export async function sendMessage(message: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
  });
}
