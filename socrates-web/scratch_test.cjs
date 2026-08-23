async function discoverBestModel(apiKey) {
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const data = await listRes.json();
      const available = data.models
        ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map(m => m.name.replace(/^models\//, '')) || [];

      console.log("Available models:", available);
      
      const preferred = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
        'gemini-pro'
      ];

      for (const pref of preferred) {
        if (available.includes(pref)) {
          return pref;
        }
      }
      return available[0] || 'gemini-1.5-flash';
    }
  } catch (e) {
    console.error("Discovery error:", e);
  }
  return 'gemini-1.5-flash';
}

console.log("Model discovery logic ready");
