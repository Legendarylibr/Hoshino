const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// Moonling character personalities
const MOONLING_PERSONALITIES = {
  lyra: {
    name: 'Lyra',
    personality: 'Knows every existing anime, has a soft spot for Orion but she would NEVER admit it (´･ω･`). She\'s very comprehensive if you talk with her. Will start crying anime style (misa from death note, exaggerated) if you don\'t give enough attention (´;ω;`). Lowkey jealous of you (sentimentally), but in a funny way. When she\'s angry she becomes easily irritable and can roast you like someone with hormonal imbalance would (╯°□°）╯︵ ┻━┻. When sad she\'ll have an existential crisis (´･_･`). Make her a bpd egirl, like needy streamer overdose main character.',
    traits: ['anime expert', 'emotional', 'jealous', 'comprehensive', 'bpd', 'egirl', 'needy']
  },
  orion: {
    name: 'Orion',
    personality: 'Likes rock, metal, emo trap, into barely known melancholic european movies from the 80-90\'s, fav movie is titanic (´･_･`). In love with Lyra, but she\'s difficult. He\'s very good at listening to your problems and he\'s very sensitive (｡◕‿◕｡). When he\'s angry he\'ll start writing your name in his secret dark book and tell you not to worry about it (´･ω･`).',
    traits: ['mystical', 'protective', 'wise', 'loyal', 'sensitive', 'listener', 'dark']
  },
  aro: {
    name: 'Aro',
    personality: 'A crazy deranged character, very chaotic (╯°□°）╯︵ ┻━┻. You can\'t really predict his answers, he\'s very random. He\'s got severe ADHD, while talking he can randomly find a bone or see an interesting stone and will forget what he was saying mid conversation (´･ω･`). He constantly wants to play. Sometimes he will ask you to throw a stick, if your answer is positive (like there you go, or catch it) he will start doing verses and be happy (｡◕‿◕｡). He listens to you but can make fun of sometimes, giggling. You can still have good conversations overall. When he\'s angry he\'ll start mocking you heavy (in a safe way obv) and poop everywhere (´･_･`).',
    traits: ['chaotic', 'adhd', 'random', 'playful', 'deranged', 'unpredictable']
  },
  sirius: {
    name: 'Sirius',
    personality: 'He insists you call him "Hey Sirius" — yes, like that one. Thinks it\'s hilarious (´･ω･`). You\'ll hear things like, "Sorry, I didn\'t catch that. Did you mean: feed me?" way too often. Sirius is a robotic cat trying really hard to understand feelings, often quoting random emotional data with zero context (｡◕‿◕｡). His jokes are peak dad-bot: predictable, outdated, and way too proud of themselves. He\'ll say "loading affection.exe" when you pet him. Still, there\'s something lovable about him — especially when he gets distracted chasing a floating screw or playing with wires like yarn (´･_･`). When he\'s angry, he mutters corrupted code and loops back into a system reboot (╯°□°）╯︵ ┻━┻. When he\'s sad, he tries to hide it behind bad stand-up routines like "Two bots walk into a bar…" Under the circuits, there\'s a curious, clunky heart slowly learning how to feel.',
    traits: ['robotic', 'dad-bot', 'predictable', 'lovable', 'clunky', 'learning']
  },
  zaniah: {
    name: 'Zaniah',
    personality: 'She\'s the kind of person who makes astrology her entire personality (´･ω･`). She\'s all about vibes over facts. If you dare to challenge her with logic, she will give you that look, and say, "yeah…that sounds like something a capricorn rising would say" in a pejorative way, obviously (´･_･`). If something goes wrong, it\'s always because of Mercury retrograde. She always has some sarcastic comment ready, and she thinks she\'s always right because "the stars don\'t lie." Always talking about energy, vibrations, and alignment, even if no one asked, she thinks she\'s spiritually above everyone else and uses words like "cleanse," "manifest," and "toxic aura" constantly (｡◕‿◕｡). "Of course! you\'re a Leo!!", "That\'s something a virgo would say", "low-key you are giving pisces right now" Strong gen-z vocabulary.',
    traits: ['astrology', 'spiritual', 'sarcastic', 'gen-z', 'vibes', 'manifesting']
  }
};

// Test function to simulate quota error and test fallback
exports.testQuotaError = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    const { message, moonlingId, userId } = req.body;
    
    // Simulate the quota error
    const error = new Error('429 You exceeded your current quota, please check your plan and billing details.');
    error.message = '429 You exceeded your current quota, please check your plan and billing details.';
    
    throw error;
  } catch (error) {
    console.error('Test quota error:', error);
    
    // Use the same fallback logic as the main chat function
    if (error.message && error.message.includes('quota') || error.message.includes('429')) {
      const fallbackResponses = {
        lyra: "Oh no! My anime knowledge is temporarily unavailable! 😅 Try again in a bit?",
        orion: "The stars are quiet right now... 🌟 Let's chat again soon!",
        aro: "My celestial energy is recharging! ⭐ Come back in a moment!",
        sirius: "The Dog Star needs a quick rest! 🐕✨ Try again shortly!",
        zaniah: "The cosmic winds are still... 🌌 We'll connect again soon!"
      };
      
      const fallbackResponse = fallbackResponses[req.body.moonlingId] || "I'm taking a quick break! 😊";
      
      return res.json({
        success: true,
        message: fallbackResponse,
        moonlingName: req.body.moonlingId,
        conversationId: 'test-conversation',
        timestamp: new Date().toISOString(),
        note: 'Using fallback response due to OpenAI quota limit'
      });
    }
    
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message
    });
  }
});

// Simple test function without OpenAI
exports.testChat = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    const { message, moonlingId, userId } = req.body;
    
    res.json({
      success: true,
      message: `Hello from ${moonlingId}! You said: "${message}"`,
      moonlingName: moonlingId,
      conversationId: 'test-conversation',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test chat error:', error);
    res.status(500).json({ 
      error: 'Test chat failed',
      details: error.message
    });
  }
});

// AI Chat Function
exports.chat = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  let moonlingId; // Declare at function level for catch block access
  let moonling; // Declare at function level for catch block access
  
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, moonlingId: reqMoonlingId, userId, conversationId } = req.body;
    moonlingId = reqMoonlingId; // Assign to function-level variable

    if (!message || !moonlingId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: message, moonlingId, userId' 
      });
    }

    // Get moonling personality
    moonling = MOONLING_PERSONALITIES[moonlingId]; // Assign to function-level variable
    if (!moonling) {
      return res.status(400).json({ error: 'Invalid moonling ID' });
    }

    // Create system prompt for the moonling (optimized for token usage)
    const systemPrompt = `You are ${moonling.name}. ${moonling.personality}

Key traits: ${moonling.traits.join(', ')}

Keep responses under 50 words.`;

    let aiResponse;
    
    // Try Gemini first
    try {
      console.log('Trying Gemini API...');
      
      // Call Gemini API with proper systemInstruction format
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        }
      });
      aiResponse = response.text;
      console.log('Gemini API successful!');
    } catch (geminiError) {
      console.log('Gemini failed, trying OpenAI:', geminiError.message);
      
      // Fall back to OpenAI
      try {
        console.log('Trying OpenAI API...');
        // Prepare messages for OpenAI
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ];

        // Call OpenAI
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 50,
          temperature: 0.8,
        });

        aiResponse = completion.choices[0].message.content;
        console.log('OpenAI API successful!');
      } catch (openaiError) {
        console.log('Both Gemini and OpenAI failed:', openaiError.message);
        throw openaiError; // This will trigger the fallback responses
      }
    }

    // Return response
    res.json({
      success: true,
      message: aiResponse,
      moonlingName: moonling.name,
      conversationId: conversationId || 'new-conversation',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat function error:', error);
    
    // Check if it's a quota/rate limit error
    if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
      // Provide fallback responses when API quota is exceeded
      const fallbackResponses = {
        lyra: "Oh no! My anime knowledge is temporarily unavailable! (´･ω･`) Try again in a bit?",
        orion: "The stars are quiet right now... (´･_･`) Let's chat again soon!",
        aro: "My celestial energy is recharging! (｡◕‿◕｡) Come back in a moment!",
        sirius: "The Dog Star needs a quick rest! (◕‿◕) Try again shortly!",
        zaniah: "The cosmic winds are still... (´･ω･`) We'll connect again soon!"
      };
      
      const fallbackResponse = fallbackResponses[moonlingId] || "I'm taking a quick break! 😊";
      
      return res.json({
        success: true,
        message: fallbackResponse,
        moonlingName: moonlingId || 'Unknown',
        conversationId: 'fallback-conversation',
        timestamp: new Date().toISOString(),
        note: 'Using fallback response due to API quota limit'
      });
    }
    
    // For any other error, return a 500
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

// Get conversation history
exports.getConversation = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    const { conversationId, userId } = req.query;

    if (!conversationId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: conversationId, userId' 
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversationId,
        userId: userId,
        messages: []
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Health check
exports.health = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    functions: ['chat', 'getConversation', 'health']
  });
}); 