const express = require("express");
const path = require("path")
const fs = require("fs");
const { Readable } = require("stream");

const app = express();

app.use(express.static(path.join(__dirname, "frontend/dist")));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/tts-stream", (req, res) => {
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Accept-Ranges", "bytes");

  const filePath = "./public/song.mp3";
  const stream = fs.createReadStream(filePath);

  console.log(`[STREAM START] ${new Date().toISOString()} ${req.ip}`);

  let chunkCount = 0;
  let bytesSent = 0;

  // Fires for every chunk
  stream.on("data", (chunk) => {
    chunkCount++;
    bytesSent += chunk.length;

    if (chunkCount % 10 == 1) {
      console.log(
        `[CHUNK] #${chunkCount} | ${
          chunk.length
        } bytes | ${new Date().toISOString()}`
      );
    }
  });

  // Fires when file is fully streamed
  stream.on("end", () => {
    console.log(
      `[STREAM END] chunks=${chunkCount} bytes=${bytesSent} time=${new Date().toISOString()}`
    );
  });

  // File read error
  stream.on("error", (err) => {
    console.error("[STREAM ERROR]", err);
    res.destroy(err);
  });

  // Client closes connection (pause, stop, tab closed)
  req.on("close", () => {
    console.log(
      `[CLIENT DISCONNECTED] after ${chunkCount} chunks at ${new Date().toISOString()}`
    );
    stream.destroy();
  });

  stream.pipe(res);
});

app.get("/tts-stream-error", (req, res) => {
  res.setHeader("Content-Type", "audio/mpeg");

  const stream = fs.createReadStream("./public/song.mp3", {
    highWaterMark: 16 * 1024,
  }); // smaller chunks

  const readable = new Readable({
    read() {},
  });
  let startTime = Date.now();

  stream.on("data", (chunk) => {
    stream.pause(); // pause original stream

    setTimeout(() => {
      // Stop streaming after 3 seconds to trigger error
      if (Date.now() - startTime >= 3000) {
        console.log("💥 Simulating fatal stream failure");
        res.destroy(); // <-- this triggers audio.onerror
        return;
      }

      const ok = readable.push(chunk);
      if (ok) stream.resume();
    }, 200); // smaller delay so playback starts normally
  });

  stream.on("end", () => readable.push(null));

  readable.pipe(res);
});

app.get("/tts-stream-slow", (req, res) => {
  res.setHeader("Content-Type", "audio/mpeg");

  const stream = fs.createReadStream("./public/song.mp3", {
    highWaterMark: 16 * 1024,
  }); // smaller chunks

  const readable = new Readable({
    read() {},
  });

  stream.on("data", (chunk) => {
    stream.pause(); // pause original stream

    setTimeout(() => {
      const ok = readable.push(chunk); // push chunk after delay
      if (ok) stream.resume();
    }, 1000);
  });

  stream.on("end", () => readable.push(null));

  readable.pipe(res);
});

app.listen(3000, () => console.log("Server running http://localhost:3000"));