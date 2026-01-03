const express = require("express");
const path = require("path");
const say = require("say");
const os = require("os");
const fs = require("fs");
const fs2 = require("fs/promises");
const { spawn } = require("child_process");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

//This take 2.5s
app.post("/tts", async (req, res) => {
  let { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  text = await fs2.readFile("11-0.txt");

  text = text.slice(0, 10000);

  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `tts-${Date.now()}.wav`);

  say.export(text, null, 1.0, filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "TTS failed" });
    }

    res.setHeader("Content-Type", "audio/wav");
    res.sendFile(filePath, () => {
      fs.unlink(filePath, () => {}); // cleanup
    });
  });
});


app.post("/tts-stream", async (req, res) => {
  let { text } = req.body;
  if (!text) return res.status(400).end();

  text = await fs2.readFile("11-0.txt");

  text = text.slice(0, 10000);


  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Transfer-Encoding", "chunked");
  
  const tts = spawn("espeak-ng", [
    "--stdout",
    "-s", "150",
    text
  ]);

  tts.stdout.pipe(res);

  tts.stderr.on("data", console.error);
  tts.on("close", () => res.end());
});

app.listen(3000, () => console.log("Server running"));
