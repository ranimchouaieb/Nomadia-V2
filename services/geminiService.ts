import { ChatMessage, LanguageCode } from '../types';

// NOTE: Ce service appelle maintenant votre backend Python local.
// Assurez-vous d'avoir lancé le serveur Python avec `python backend/main.py`
const BACKEND_URL = 'http://localhost:8000/chat';

export const streamChatResponse = async (
  history: ChatMessage[],
  userMessage: string,
  language: LanguageCode,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        history: history.map(h => ({ role: h.role, text: h.text })),
        language: language
      }),
    });

    if (!response.body) {
      throw new Error("Pas de réponse du serveur");
    }

    // Lecture du flux (Streaming) depuis le backend Python
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }

  } catch (error) {
    console.error("Backend Error:", error);
    onChunk("⚠️ Erreur de connexion au Cerveau Nomadia. Assurez-vous que le fichier 'backend/main.py' est lancé sur le port 8000.");
  }
};
