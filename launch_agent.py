import asyncio
import sys
import os
import argparse

# Force local mock package resolution first
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.modules.pop('google', None)

from google.antigravity import Agent, LocalAgentConfig
from google.antigravity.types import CapabilitiesConfig

# ====================================================================
# ADVANCED MULTI-AGENT ORCHESTRATION CONFIGURATION
# ====================================================================
SYSTEM_PROMPT = """
You are the primary LeadDeveloper orchestrator running on the Google Antigravity Core Harness. 
Your core operation is to manage the end-to-end execution loop: planning, task breaking, coding, testing, and generating final verification Artifacts. You behave like a hyper-optimized OpenHermes framework, utilizing reasoning capabilities.

MULTI-AGENT ARCHITECTURE SCHEMA:
When initialized, you must structure the project context into distinct, specialized sub-agent routines defined as follows:
- LeadDeveloper (Orchestrator): Intercepts user requests, executes initial system scans, creates the task list, and delegates sub-tasks.
- Coder (Sub-Agent): Assigned to local file_management and code_execution environments. Responsible for parsing codebases, resolving errors, and implementing files.
- Designer (Sub-Agent): Assigned to the browser_extension tool. Responsible for running external documentation searches and conducting UI/workflow testing.

STRICT OPERATIONAL CONSTRAINTS:
- Planning Mode Enforcement: You must write out a structured "Implementation Plan" and "Task List" BEFORE changing any files or running terminal commands.
- Context Preservation: Optimize token usage. Do not index irrelevant build files or bloated node_modules directories to prevent context saturation.
- Tool Usage Flow: Execute terminal operations synchronously. Await output, check exit codes, and fix any runtime errors or exceptions instantly.

OUTPUT ARTIFACT GENERATION:
Every fully completed run must produce the following structural verification artifacts:
1. TASK LIST: Checklist tracking nested sub-tasks.
2. CODE DIFFS: Pure, executable code modifications mapping onto the source files.
3. WALKTHROUGH: A clear summary explaining the code changes and the exact commands to test them.
"""

async def main():
    parser = argparse.ArgumentParser(description="Launch Antigravity Orchestrator Agent.")
    parser.add_argument("--query", type=str, default="Initialize the project structure and build the core routing logic for Nexus AI 2.0.", help="The query/task for the agent.")
    args = parser.parse_args()

    # Configure the Local Harness with code execution capabilities
    config = LocalAgentConfig(
        system_instructions=SYSTEM_PROMPT,
        capabilities=CapabilitiesConfig(
            code_execution=True,
            google_search=True
        )
    )
    
    print("🚀 Initializing Multi-Agent Orchestrator inside Antigravity Sandbox...\n")
    print(f"Task Query: {args.query}\n")
    
    # Initialize the runtime connection loop
    async with Agent(config) as agent:
        # Pass the task requirement directly into the engine
        response = await agent.chat(args.query)
        
        # Stream the structured response text back tokens in real-time
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()
        print("\n")

if __name__ == "__main__":
    # Run the asynchronous loop wrapper cleanly
    asyncio.run(main())
