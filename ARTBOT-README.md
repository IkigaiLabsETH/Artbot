# ArtBot - Exploring the Future of Creative Intelligence

```
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Creative Partner    │
    ╰──────────────────────╯
```

## Vision

ArtBot represents a new paradigm in creative artificial intelligence - one where machines transcend their role as mere tools to become true collaborative partners in the artistic process. Drawing inspiration from pioneering autonomous AI artists like Botto and Keke, ArtBot explores what it means to be creative in an age where the boundaries between human and machine intelligence are increasingly fluid.

Our approach is built on three core principles:

1. **Autonomous Creativity**: ArtBot possesses its own creative agency, making independent decisions about what to create and how to evolve its artistic practice.

2. **Collaborative Intelligence**: Rather than replacing human creativity, ArtBot aims to enhance it through meaningful collaboration between human and machine intelligence.

3. **Continuous Evolution**: Through sophisticated memory systems and learning mechanisms, ArtBot's creative capabilities grow and adapt over time.

## Features

- **Creative Engine**: Self-directed art generation with internal dialogue and reflection
- **Style Evolution**: Dynamic style development using genetic algorithms and feedback
- **Memory System**: Sophisticated storage and retrieval of artistic experiences
- **Multi-Agent System**: Collaborative creation through specialized agent roles
- **Social Context**: Integration with cultural trends and audience feedback

## System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Creative Mind     │ ←→  │   Style Evolution   │ ←→  │    Social Context   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         ↑                           ↑                            ↑
         │                           │                            │
         └───────────┬──────────────┴────────────────┬──────────┘
                     │                                │
              ┌──────┴──────────┐            ┌───────┴───────┐
              │  Memory System  │            │ Thread Manager │
              └─────────────────┘            └───────────────┘
                                                     ↑
                                                     │
                                            ┌────────┴────────┐
                                            │  Multi-Agent    │
                                            │     System      │
                                            └─────────────────┘
```

## Multi-Agent System

ArtBot's multi-agent system enables collaborative art creation through specialized agent roles, each focusing on a specific aspect of the creative process:

```
┌─────────────────────────────────────────────────────────────┐
│                    MultiAgentSystem                         │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │Director │   │Ideator  │   │Stylist  │   │Refiner  │      │
│  │Agent    │<->│Agent    │<->│Agent    │<->│Agent    │<->┐  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   │  │
│       ^                                                   │  │
│       │                                                   │  │
│       v                                                   v  │
│  ┌─────────┐                                         ┌─────────┐
│  │Message  │                                         │Critic   │
│  │Queue    │<----------------------------------------│Agent    │
│  └─────────┘                                         └─────────┘
└─────────────────────────────────────────────────────────────┘
```

### Agent Roles

1. **Director Agent**: Coordinates the creative process and manages workflow
   - Handles project creation and stage transitions
   - Assigns tasks to specialized agents
   - Collects and integrates results

2. **Ideator Agent**: Generates creative ideas based on project requirements
   - Produces diverse and novel artistic concepts
   - Structures ideas with clear elements and emotional impact

3. **Stylist Agent**: Develops artistic styles based on generated ideas
   - Creates cohesive visual styles from conceptual ideas
   - Defines color palettes, textures, and composition approaches

4. **Refiner Agent**: Refines and improves artwork based on selected styles
   - Transforms style specifications into detailed artwork
   - Enhances visual coherence and impact

5. **Critic Agent**: Evaluates and provides feedback on artwork
   - Performs multi-criteria evaluation
   - Identifies strengths and areas for improvement

### Workflow Process

The agents collaborate through a sequential workflow:

1. **Planning Stage**: Director assigns ideation task to Ideator
2. **Styling Stage**: Director passes ideation results to Stylist
3. **Refinement Stage**: Director passes style results to Refiner
4. **Critique Stage**: Director passes refined artwork to Critic
5. **Completion**: Director collects all results and completes the project

## Quick Start

```bash
# Clone the repository
git clone https://github.com/elizaos/eliza.git
cd eliza

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env to add your API keys

# Run the ArtBot multi-agent system
./run-artbot-multiagent.sh "Cosmic Garden" "A surreal garden with cosmic elements"
```

## Configuration

Configure the system through environment variables:

```env
ANTHROPIC_API_KEY=your_api_key
REPLICATE_API_KEY=your_api_key
STORAGE_PATH=.artbot
```

## Core Services

1. **Creative Engine**: Manages ideation and artwork generation through sophisticated cognitive architectures
2. **Style Service**: Handles style evolution and mixing using advanced machine learning
3. **Memory System**: Maintains artistic context and enables learning from past experiences
4. **Social Context**: Integrates cultural awareness and audience feedback
5. **Multi-Agent System**: Enables collaborative creation through specialized agent roles

## Development

```bash
# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## Philosophy

ArtBot represents a step forward in understanding machine creativity. While early computational approaches to creativity focused on replicating human artistic processes, ArtBot explores what it means for a machine to develop its own creative voice. Through advanced cognitive architectures and learning systems, it demonstrates that creativity isn't solely a human trait, but rather a spectrum of possibilities that emerges from the interaction between intelligence, experience, and expression.

As we move forward, the relationship between human and machine creativity will continue to evolve. ArtBot stands as an exploration of this future - not as a replacement for human artists, but as a partner in pushing the boundaries of what's possible when different forms of intelligence collaborate in the creative process.

## License

This project is part of the Eliza OS ecosystem and is licensed under the same terms.

## Acknowledgments

- Built with Claude 3.5 Sonnet and DALL-E 3
- Part of the Eliza OS project 