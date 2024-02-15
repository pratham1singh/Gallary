const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://singhpratham191:pratham808121@cluster0.ye7pub7.mongodb.net/Gallary");

const schema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
});
const Login = mongoose.model("Login", schema);

app.get("/", (req, res) => {
  res.send("Gallery it is");
});

app.post("/SignUp", async (req, res) => {
  try {
    let result = await Login.find(req.body);
    
    if (result.length == 0) {
      let data = new Login(req.body);
      await data.save();
      
      res.send({ result: true });
    } else {
      console.log(result)
      res.send({ result: false });
    }
  } catch (e) {
    res.send({ result: false });
  }
});

app.post("/Login", async (req, res) => {
  console.log("LL")
  try {
    let result = await Login.find(req.body);
    if (result.length != 0) {
      res.send({ result: true });
    } else {
      res.send({ result: false });
    }
  } catch (e) {
    res.send({ result: false });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  let n = 0;

  fs.readdir(__dirname + "/" + "uploads", (err, items) => {
    try{
      if (err) {
        console.error("Error reading uploads directory:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      for (let i = 0; i < items.length; i++) {
        if (items[i].startsWith(req.body.email)) n += 1;
      }
      n += 1;
      const oldPath = path.join(__dirname, "uploads", req.file.filename);
      const desiredFilename =
        req.body.email + n + path.extname(req.file.originalname);
      const newPath = path.join(__dirname, "uploads", desiredFilename);
  
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("File renamed successfully.");
        res.json({ filename: desiredFilename });
      });
    }
    catch(e){
      res.send(e)
    }
  });
});

app.post("/images", async (req, res) => {
  const username = req.body.username;
  try {
    const items = await fs.promises.readdir(path.join(__dirname, "uploads"));
    const userImages = items.filter((image) => image.startsWith(username));
    const imageUrls = userImages.map((image) => `/uploads/${image}`);
    console.log(userImages)
    res.json(imageUrls);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const imageDirectory = path.join(__dirname, "uploads");

// Endpoint to retrieve image data or URL
app.get("/img/uploads/:imageName", (req, res) => {
  try{
    const { imageName } = req.params;
  const imagePath = path.join(imageDirectory, imageName);

  // Check if the image file exists
  if (fs.existsSync(imagePath)) {
    // Read the image file and send it as a response
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error("Error reading image file:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      // Set the appropriate content type for the response
      res.setHeader("Content-Type", "image/jpeg");
      // Send the image data as the response
      res.send(data);
    });
  } else {
    // If the image file does not exist, return a 404 Not Found error
    res.status(404).json({ error: "Image not found" });
  }
  } catch(e){console.log(e)}
});


app.listen(process.env.PORT || 3001, () => {
  console.log("Server is running on port 3001");
});
