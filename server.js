const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const session = require("express-session");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "buildly-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// MongoDB Connection - Optimized for Vercel
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB...");

    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/buildly";
    console.log("Connecting to:", mongoUri.replace(/:[^:@]+@/, ":****@")); // Hide password in logs

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error; // Throw error instead of silently continuing
  }
};

// Connect on startup
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB on startup:", err.message);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["builder", "architect", "contractor", "supervisor", "client"],
    required: true,
  },
  company: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["planning", "active", "completed", "on-hold"],
    default: "planning",
  },
  startDate: Date,
  endDate: Date,
  budget: Number,
  createdAt: { type: Date, default: Date.now },
});

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "blocked"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  dueDate: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["project", "task", "edit", "delete"],
    required: true,
  },
  description: { type: String, required: true },
  relatedId: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Project = mongoose.model("Project", projectSchema);
const Task = mongoose.model("Task", taskSchema);
const Activity = mongoose.model("Activity", activitySchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "buildly-jwt-secret"
    );
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

app.get("/chatbot", (req, res) => {
  res.sendFile(__dirname + "/public/chatbot.html");
});

// Authentication Routes
app.post("/api/register", async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();

    const { username, email, password } = req.body;
    const emailLower = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: emailLower }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email: emailLower,
      password: hashedPassword,
      role: "builder", // Default role
      company: "",
      phone: "",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "buildly-jwt-secret",
      { expiresIn: "24h" }
    );

    req.session.userId = user._id;
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ============ PROJECT API ROUTES ============

// Get all projects for user
app.get("/api/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Create project
app.post("/api/projects", authMiddleware, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = new Project({
      name,
      description,
      status: status || "planning",
      owner: req.userId,
    });
    await project.save();

    // Log activity
    await new Activity({
      user: req.userId,
      type: "project",
      description: `Created project "${name}"`,
      relatedId: project._id.toString(),
    }).save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
app.put("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, description, status },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await new Activity({
      user: req.userId,
      type: "edit",
      description: `Updated project "${name}"`,
      relatedId: project._id.toString(),
    }).save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Unassign tasks from this project
    await Task.updateMany({ project: req.params.id }, { project: null });

    await new Activity({
      user: req.userId,
      type: "delete",
      description: `Deleted project "${project.name}"`,
    }).save();

    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ============ TASK API ROUTES ============

// Get all tasks for user
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.userId })
      .populate({
        path: "project",
        select: "name",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Task fetch error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, status } = req.body;
    const task = new Task({
      title,
      description,
      project: projectId || null,
      status: status || "pending",
      createdBy: req.userId,
    });
    await task.save();

    await new Activity({
      user: req.userId,
      type: "task",
      description: `Created task "${title}"`,
      relatedId: task._id.toString(),
    }).save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, projectId } = req.body;
    const updateData = {
      title,
      description,
      status,
      project: projectId || null,
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      updateData,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ============ ACTIVITY API ROUTES ============

// Get activities for user
app.get("/api/activities", authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Clear activities
app.delete("/api/activities", authMiddleware, async (req, res) => {
  try {
    await Activity.deleteMany({ user: req.userId });
    res.json({ message: "Activities cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear activities" });
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate response
    const result = await model.generateContent(message);
    const response = result.response;
    const aiReply = response.text();

    res.json({
      reply: aiReply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(500).json({
      error: "Failed to get response from AI",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Buildly server running on port ${PORT}`);
});
