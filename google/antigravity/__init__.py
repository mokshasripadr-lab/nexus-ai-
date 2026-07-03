import os
import sys
import asyncio
from typing import AsyncGenerator

# Set up local paths to make imports clean
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from . import types
from .types import CapabilitiesConfig

class LocalAgentConfig:
    def __init__(self, system_instructions: str = None, capabilities: CapabilitiesConfig = None, api_key: str = None):
        self.system_instructions = system_instructions
        self.capabilities = capabilities
        self.api_key = api_key

class ChatResponse:
    def __init__(self, text_stream):
        self._text_stream = text_stream

    def __aiter__(self) -> AsyncGenerator[str, None]:
        return self._stream_tokens()

    async def _stream_tokens(self) -> AsyncGenerator[str, None]:
        # If it's a real genai streaming response
        if hasattr(self._text_stream, '__iter__') or hasattr(self._text_stream, '__aiter__'):
            for chunk in self._text_stream:
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.01) # Yield to event loop
        else:
            yield str(self._text_stream)

    async def text(self) -> str:
        full_text = ""
        async for token in self:
            full_text += token
        return full_text

class Agent:
    def __init__(self, config: LocalAgentConfig):
        self.config = config
        self.model = None

    async def __aenter__(self):
        import google.generativeai as genai
        # Initialize Gemini API
        api_key = self.config.api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set. Please export GEMINI_API_KEY or configure it.")
        
        genai.configure(api_key=api_key)
        # Select the model. gemini-2.5-flash is stable and fast.
        model_name = "gemini-2.5-flash"
        
        # Configure tools
        tools = []
        if self.config.capabilities and self.config.capabilities.code_execution:
            tools.append({"code_execution": {}})
            
        self.model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=self.config.system_instructions,
            tools=tools if tools else None
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    async def chat(self, query: str) -> ChatResponse:
        import google.generativeai as genai
        # Run generative API with streaming
        loop = asyncio.get_running_loop()
        
        def run_stream():
            return self.model.generate_content(query, stream=True)
            
        response_stream = await loop.run_in_executor(None, run_stream)
        return ChatResponse(response_stream)
