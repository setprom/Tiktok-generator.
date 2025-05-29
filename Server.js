const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const inputPath = req.file.path;
  const outputFileName = `output_${Date.now()}.mp4`;
  const outputPath = path.join('outputs', outputFileName);

  // Ejemplo: agregar un texto estático como subtítulo
  ffmpeg(inputPath)
    .videoFilters({
      filter: 'drawtext',
      options: {
        fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        text: 'Subtítulo generado',
        fontsize: 24,
        fontcolor: 'white',
        x: '(w-text_w)/2',
        y: 'h-50',
        box: 1,
        boxcolor: 'black@0.5',
        boxborderw: 5,
      }
    })
    .on('end', () => {
      fs.unlinkSync(inputPath); // borra archivo original
      res.download(outputPath, outputFileName, err => {
        if (err) console.error(err);
        fs.unlinkSync(outputPath); // borra archivo procesado
      });
    })
    .on('error', err => {
      console.error(err);
      res.status(500).send('Error al procesar video.');
    })
    .save(outputPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
add server.js
