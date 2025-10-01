# WBM MIDI Packet Parser

TypeScript library for parsing raw MIDI byte data into structured command objects. This general-purpose MIDI parser provides type-safe parsing of MIDI 1.0 protocol messages with comprehensive support for all standard MIDI message types.

## Key Features

- **Complete MIDI Protocol Support**: Handles all MIDI 1.0 message types including Note On/Off, Control Change, Program Change, Pitch Bend, and System messages
- **State Machine Parser**: Robust state-based parsing engine for proper MIDI protocol handling
- **TypeScript Interfaces**: Fully typed MIDI command structures for type-safe development
- **Error Handling**: Validates byte values and provides error reporting for malformed data
- **Lightweight**: Size-limited builds under 10KB for optimal performance
- **Multiple Formats**: Supports CJS, ESM, and UMD module formats
- **System Messages**: Support for Start, Stop, Continue, and System Reset commands

## Architecture

Built with TSDX for professional TypeScript library development, featuring automated testing, linting, and size analysis. Implements a comprehensive state machine for accurate MIDI protocol parsing.

## General Purpose Library

Designed as a general-purpose MIDI parsing solution suitable for any application requiring MIDI data processing, from music software to hardware control systems.

## Dependencies

- TypeScript
- TSDX