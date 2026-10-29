# FindBPM tempo planning MCP

Local calculations that help use results from [FindBPM](https://findbpm.net/), the browser-based BPM and key finder. FindBPM analyzes MP3, WAV, FLAC, and M4A audio on your device; this server never receives audio or performs audio analysis.

- `tempo_timing` converts a known BPM into milliseconds per beat, eighth and sixteenth notes, and bar, plus half/double-time readings.
- `compare_tempos` compares two reported rates and checks whether one may be a half/double-time interpretation of the other.
- `camelot_neighbors` lists common nearby Camelot codes for a known key estimate.
- `get_official_links` returns the official analyzer.

After you [find bpm](https://findbpm.net/) for a track, tap along to confirm whether the reported pulse is the beat you hear. At 120 BPM, one beat is 500 ms and a four-beat bar is 2 seconds. For a DJ transition, tempo and neighboring Camelot codes can narrow candidates, but listen to phrasing and harmony before using a mix.

## Run

Node.js 20.18.1 or newer:

```sh
npm install
npm test
node index.mjs
```

Configure your MCP client to start `node /absolute/path/to/findbpm-mcp/index.mjs` over stdio. No account, audio file, or network request is needed by this server. MIT license; see `LICENSE`.
