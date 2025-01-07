export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  try {
    console.log('Requesting speech synthesis for:', text);
    const response = await fetch("/api/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed: ${response.status}`);
    }

    console.log('Speech synthesis successful');
    return response.arrayBuffer();
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error;
  }
}