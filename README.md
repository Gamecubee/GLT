# Guitar Learning Tool

GLT helps you learn the guitar using different tools that cover different areas of the learning process.

## Requirements
- Node.js **>= 20**
- **pnpm**

## Tools

### First tool: Chords

Chords helps you learn common chord shapes based on the **CAGED** system.
The tool generates a chord prompt made of a root, a chord type and a shape, once you try to play the chord yourself, it lets you reveal the diagram of the chord.

**Training pool**
- **Root pool**
  - `FULL`: all 12 roots (C, C#/Db, D, …, B)
  - `CAGED`: only C A G E D, with optional extra roots
- **CAGED mode** (when Root pool = CAGED)
  - `LOCK`: if the root is one of C/A/G/E/D, the shape is forced to match that letter
  - `RANDOM`: shape stays random
- **Chord types**: toggle which types can appear (see Supported chord types below)
- **CAGED shapes**: toggle which shapes can appear (E/A/D/G/C)
- **Accidental display**: show roots as `sharp`, `flat`, or `both` (e.g. C#/D♭)

**Session**
- Auto mode on/off
- Pause/resume
- Prompt duration (seconds)
- Reveal duration (seconds)

**Keyboard**
- Press **Space** to Reveal (from prompt) or Next (from revealed).

#### Currently supported chord types 
- Major
- Minor
- 7
- Min7
- Maj7
- Power5

#### Currently supported shapes
- E, A, D, G ,C
  
### Roadmap and future tools
- History
- countdown animation
- refined ui, phone friendly
- other guitar tools for notes, scales ecc..
