import express, { Request, Response } from "express";
import multer from "multer";
import { Layer, readPsd } from "ag-psd";
import * as fs from "fs";
import cors from "cors";
import "ag-psd/initialize-canvas";

const app = express();
const port = 3001;

const upload = multer({ dest: "uploads/" });

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Seja bem vindo ao PSD Reader!");
});

app.post(
  "/upload",
  upload.single("psdFile"),
  async (req: Request, res: Response) => {
    const psdFile = req.file;

    if (!psdFile) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      const psdBuffer = fs.readFileSync(psdFile.path);
      const psd = readPsd(psdBuffer);

      const layers = psd.children?.map((layer: Layer, index) => {
        const canvas = layer.children;
        console.log("psdcanvas", canvas);
        const imagesUrl = canvas?.map(({ canvas }) => {
          return canvas?.toDataURL();
        });
        return { id: index, name: layer.name, imagesUrl };
      });

      res.status(200).send({ layers });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
      res
        .status(400)
        .json({
          error:
            "Internal server error reading the PSD file, please try again.",
        });
    } finally {
      fs.unlinkSync(psdFile.path);
      console.log(`${psdFile.path} was removed.`);
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
