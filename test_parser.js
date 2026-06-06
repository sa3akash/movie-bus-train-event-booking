const fs = require('fs');
const vttText = `WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nstoryboard-medium.jpg#xywh=0,0,160,90\n\n2\n00:00:05.000 --> 00:00:10.000\nstoryboard-medium.jpg#xywh=160,0,160,90`;

const parseVttTime = (timeStr) => {
  const parts = timeStr.trim().split(':');
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return parseInt(m) * 60 + parseFloat(s);
  }
  return parseFloat(timeStr) || 0;
};

const normalizedText = vttText.replace(/\r\n/g, '\n');
const blocks = normalizedText.split('\n\n');
const parsedThumbnails = [];

for (const block of blocks) {
  const lines = block.split('\n').filter(l => l.trim() !== '' && !l.includes('WEBVTT'));
  
  let timeMatch = null;
  let timeLineIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    timeMatch = lines[i].match(/(.*) --> (.*)/);
    if (timeMatch) {
      timeLineIndex = i;
      break;
    }
  }

  if (timeMatch && timeLineIndex + 1 < lines.length) {
    const startTime = parseVttTime(timeMatch[1]);
    const endTime = parseVttTime(timeMatch[2]);
    
    const urlLine = lines[timeLineIndex + 1].trim();
    const [filename, hash] = urlLine.split('#xywh=');
    if (hash) {
      const [x, y, w, h] = hash.split(',').map(Number);
      parsedThumbnails.push({
        startTime,
        endTime,
        filename,
        x, y, w, h
      });
    } else {
      parsedThumbnails.push({
        startTime,
        endTime,
        filename: urlLine,
        x: 0, y: 0, w: 160, h: 90
      });
    }
  }
}
console.log(parsedThumbnails);
