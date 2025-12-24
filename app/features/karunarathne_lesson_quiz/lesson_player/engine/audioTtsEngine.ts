import * as Speech from "expo-speech";

export class AudioTtsEngine {
  speak(text: string) {
    Speech.stop();
    Speech.speak(text, {
      rate: 0.9,
      pitch: 1.0,
      language: "en-US",
    });
  }

  stop() {
    Speech.stop();
  }
}
