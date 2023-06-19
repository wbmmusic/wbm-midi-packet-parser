type States = "awaiting-control-byte"
  | "awaiting-note"
  | "awaiting-velocity"
  | "awaiting-controller"
  | "awaiting-value"
  | "awaiting-program"
  | "awaiting-channel-pressure"
  | "awaiting-pitch-lsb"
  | "awaiting-pitch-msb"
  | "awaiting-song"


interface NoteOn {
  type: "note-on",
  channel: number,
  note: number,
  velocity: number
  data: number[]
}

interface NoteOff {
  type: "note-off",
  channel: number,
  note: number,
  velocity: number
  data: number[]
}

interface ControlChange {
  type: "control-change",
  channel: number,
  controller: number,
  value: number
}

interface PolyAftertouch {
  type: "poly-aftertouch",
  channel: number,
  note: number,
  pressure: number
}

interface ChannelAftertouch {
  type: "channel-aftertouch",
  channel: number,
  pressure: number
  data: number[]
}

interface ProgramChange {
  type: "program-change",
  channel: number,
  program: number,
  data: number[]
}

interface PitchBend {
  type: "pitch-bend",
  channel: number,
  pitch: number,
  data: number[]
}

interface SongSelect {
  type: "song-select",
  song: number,
  data: number[]
}

interface SystemReset {
  type: "system-reset",
  data: number[]
}

interface SingleByte {
  type: "start" | "stop" | "continue" | "reset",
}

type CommandType = NoteOn
  | NoteOff
  | PolyAftertouch
  | ControlChange
  | ProgramChange
  | ChannelAftertouch
  | PitchBend
  | SongSelect
  | SystemReset
  | SingleByte

interface ParsedCommands {
  error?: string;
  commands: CommandType[]
}


export const parseMidi = (packet: number[]): ParsedCommands => {
  let state: States = "awaiting-control-byte"

  let messages: CommandType[] = []
  let message: CommandType | null = null

  const addMessageToMessages = () => messages.push(JSON.parse(JSON.stringify(message)))

  packet.forEach(byte => {
    if (byte > 255) throw new Error('Byte value is greater than 255')
    else if (byte > 127) {
      message = null

      if (byte > 255) throw new Error('Byte out of range - greater than 255')

      if (byte >= 128 && byte <= 143) {
        console.log("Note Off")
        message = {
          type: "note-off",
          channel: byte - 128,
          note: 0,
          velocity: 0,
          data: [byte]
        }
        state = "awaiting-note"

      } else if (byte >= 144 && byte <= 159) {
        console.log("Note On")
        message = {
          type: "note-on",
          channel: byte - 144,
          note: 0,
          velocity: 0,
          data: [byte]
        }
        state = "awaiting-note"

      } else if (byte >= 160 && byte <= 175) {
        console.log("Poly Aftertouch")
        message = {
          type: "poly-aftertouch",
          channel: byte - 160,
          note: 0,
          pressure: 0
        }
        state = "awaiting-note"

      } else if (byte >= 176 && byte <= 191) {
        console.log("Control Change")
        message = {
          type: "control-change",
          channel: byte - 176,
          controller: 0,
          value: 0
        }
        state = "awaiting-controller"

      } else if (byte >= 192 && byte <= 207) {
        console.log("Program Change")
        message = {
          type: "program-change",
          channel: byte - 192,
          program: 0,
          data: [byte]
        }
        state = "awaiting-program"

      } else if (byte >= 208 && byte <= 223) {
        console.log("Channel Aftertouch")
        message = {
          type: "channel-aftertouch",
          channel: byte - 208,
          pressure: 0,
          data: [byte]
        }
        state = "awaiting-channel-pressure"

      } else if (byte >= 224 && byte <= 239) {
        console.log("Pitch Bend")
        message = {
          type: "pitch-bend",
          channel: byte - 224,
          pitch: 0,
          data: [byte]
        }
        state = "awaiting-pitch-lsb"

      } else if (byte == 243) {
        console.log("Song Select")
        message = { type: "song-select", song: 0, data: [243] }
        state = "awaiting-song"

      } else if (byte == 250) {
        console.log("Start")
        message = { type: "start", }
        messages.push(message)
        state = "awaiting-control-byte"

      } else if (byte == 251) {
        console.log("Continue")
        message = { type: "continue", }
        messages.push(message)
        state = "awaiting-control-byte"

      } else if (byte == 252) {
        console.log("Stop")
        message = { type: "stop", }
        messages.push(message)
        state = "awaiting-control-byte"

      } else if (byte == 255) {
        console.log("System reset")
        message = { type: "system-reset", data: [255] }
        messages.push(message)
        state = "awaiting-control-byte"

      } else {
        console.log("Unhandled Control Byte", byte)
      }


    } else {
      switch (state) {
        case "awaiting-note":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "note-off" || message.type === "note-on") {
            console.log("NOTE", byte)
            message.note = byte
            message.data[1] = byte
            state = "awaiting-velocity"
          }
          break;

        case "awaiting-velocity":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "note-off" || message.type === "note-on") {
            console.log("VEL", byte)
            message.velocity = byte
            message.data[2] = byte
            addMessageToMessages()
            state = "awaiting-note"
          }
          break;

        case "awaiting-controller":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "control-change") {
            message.controller = byte
            state = "awaiting-value"
          }
          break;

        case "awaiting-value":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "control-change") {
            message.value = byte
            addMessageToMessages()
            state = "awaiting-controller"
          }
          break;

        case "awaiting-program":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "program-change") {
            message.program = byte
            message.data[1] = byte
            addMessageToMessages()
            state = "awaiting-control-byte"
          }
          break;

        case "awaiting-channel-pressure":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "channel-aftertouch") {
            message.pressure = byte
            message.data[1] = byte
            addMessageToMessages()
            state = "awaiting-control-byte"
          }
          break;

        case "awaiting-pitch-lsb":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "pitch-bend") {
            console.log("pitch lsb", byte)
            message.pitch = byte
            message.data[1] = byte
            state = "awaiting-pitch-msb"
          }
          break;

        case "awaiting-song":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "song-select") {
            console.log("Song Number", byte)
            message.song = byte
            message.data[1] = byte
            addMessageToMessages()
            state = "awaiting-control-byte"
          }
          break;

        case "awaiting-pitch-msb":
          if (!message) throw new Error('NO MESSAGE HERE')
          if (message.type === "pitch-bend") {
            console.log("pitch msb", byte)
            message.pitch = (byte << 7) | message.pitch
            message.data[2] = byte
            addMessageToMessages()
            state = "awaiting-control-byte"
          }
          break;


        default:
          console.log("Unhandled byte in switch type")
          break;
      }
    }

  })

  return { commands: messages }
}