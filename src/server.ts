import express, { Request, Response } from 'express';
import multer from 'multer';
import { Layer, readPsd } from 'ag-psd';
import * as fs from 'fs';
import cors from 'cors';
import 'ag-psd/initialize-canvas';
import { stringify } from 'flatted';

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/upload', upload.single('psdFile'), async (req: Request, res: Response) => {
  const psdFile = req.file;

  if (!psdFile) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  console.log('psd recieved', psdFile)
  // Parse the PSD file using the ag-psd library
  const psdBuffer = fs.readFileSync(psdFile.path);
  const psd = readPsd(psdBuffer);
  console.log("psd parsed", psd)
  // Convert each layer to an image and return them in a JSON format
  const layers = psd.children?.map((layer: Layer, index) => {
    const canvas = layer.children
    console.log('psdcanvas', canvas)
    const imagesUrl = canvas?.map(({canvas}) => {
      return canvas?.toDataURL()
    })
    return { id: index, name: layer.name, imagesUrl };
  });

  res.status(200).send({ layers });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
