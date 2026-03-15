const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const pty = require('node-pty');
const { Client } = require('ssh2');
const os = require('os');

// Configuration
const PORT = 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/terminus_db';
const APP_PASSWORD = '221200';

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await initDefaultCommands();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas
const connectionSchema = new mongoose.Schema({
  name: String,
  host: String,
  port: { type: Number, default: 22 },
  username: String,
  authType: { type: String, enum: ['password', 'key'], default: 'password' },
  password: String,
  privateKey: String,
  createdAt: { type: Date, default: Date.now }
});

const commandSchema = new mongoose.Schema({
  name: String,
  command: String,
  description: String,
  category: { type: String, default: 'General' },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const commandGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#a855f7' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  fontSize: { type: Number, default: 14 },
  fontFamily: { type: String, default: 'Consolas, monospace' },
  theme: { type: String, default: 'dark' },
  themeColor: { type: String, default: '#0ea5e9' },
  scrollback: { type: Number, default: 10000 },
  cursorStyle: { type: String, default: 'block' },
  cursorBlink: { type: Boolean, default: true },
  fontWeight: { type: String, default: 'normal' },
  terminalTheme: { type: String, default: 'defaultDark' }
});

const Connection = mongoose.model('Connection', connectionSchema);
const Command = mongoose.model('Command', commandSchema);
const CommandGroup = mongoose.model('CommandGroup', commandGroupSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// Terminal sessions storage
const terminalSessions = new Map();
const sshSessions = new Map();

// Helper: Get default shell based on platform
function getDefaultShell() {
  const platform = os.platform();
  console.log('[Backend] Platform:', platform);
  if (platform === 'win32') {
    const shell = process.env.COMSPEC || 'cmd.exe';
    console.log('[Backend] Windows shell:', shell);
    return shell;
  }
  const shell = process.env.SHELL || '/bin/bash';
  console.log('[Backend] Unix shell:', shell);
  return shell;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authentication
  socket.on('auth', (password) => {
    // Password check disabled
    if (true) {
      socket.emit('auth-success');
      console.log('Client authenticated:', socket.id);
    } else {
      socket.emit('auth-failed', 'Invalid password');
      socket.disconnect();
    }
  });

  // Create local terminal
  socket.on('terminal:create', (options = {}) => {
    try {
      console.log('[Backend] terminal:create received, socket:', socket.id);
      const shell = options.shell || getDefaultShell();
      const cwd = options.cwd || os.homedir();
      console.log('[Backend] Spawning shell:', shell, 'cwd:', cwd);

      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: options.cols || 80,
        rows: options.rows || 24,
        cwd: cwd,
        env: process.env
      });

      console.log('[Backend] PTY spawned, process pid:', ptyProcess.pid);

      const sessionId = `${socket.id}:${Date.now()}`;
      terminalSessions.set(sessionId, { pty: ptyProcess, socketId: socket.id });

      // Send terminal output to client
      ptyProcess.onData((data) => {
        // console.log('[Backend] PTY data:', data.substring(0, 50));
        socket.emit('terminal:data', { sessionId, data });
      });

      // Handle exit
      ptyProcess.onExit(({ exitCode, signal }) => {
        console.log('[Backend] PTY exited, code:', exitCode, 'signal:', signal);
        terminalSessions.delete(sessionId);
      });

      socket.emit('terminal:created', { sessionId });
      console.log('Terminal created:', sessionId);
    } catch (error) {
      console.error('Error creating terminal:', error);
      socket.emit('terminal:error', { error: error.message });
    }
  });

  // Handle terminal input from client - registered once per socket
  socket.on('terminal:input', ({ sessionId, data }) => {
    console.log('[Backend] terminal:input received:', sessionId, 'data:', data);
    const session = terminalSessions.get(sessionId);
    console.log('[Backend] Session found:', !!session);
    // Verify the session belongs to this socket
    if (session && session.socketId === socket.id && session.pty) {
      session.pty.write(data);
      console.log('[Backend] Written to PTY');
    } else {
      console.log('[Backend] Session not found or no PTY');
    }
  });

  // Handle terminal resize - registered once per socket
  socket.on('terminal:resize', ({ sessionId, cols, rows }) => {
    const session = terminalSessions.get(sessionId);
    if (session && session.socketId === socket.id && session.pty) {
      session.pty.resize(cols, rows);
    }
  });

  // Handle terminal close - registered once per socket
  socket.on('terminal:close', ({ sessionId }) => {
    const session = terminalSessions.get(sessionId);
    if (session && session.socketId === socket.id) {
      session.pty.kill();
      terminalSessions.delete(sessionId);
    }
  });

  // Create SSH connection
  socket.on('ssh:connect', async (config) => {
    console.log('[Backend] SSH connect called!');
    try {
      console.log('[Backend] SSH connect request:', {
        host: config.host,
        port: config.port,
        username: config.username,
        authType: config.authType,
        hasPassword: !!config.password,
        hasPrivateKey: !!config.privateKey,
        passwordValue: config.password
      });

      const conn = new Client();
      const sessionId = `${socket.id}:ssh:${Date.now()}`;

      await new Promise((resolve, reject) => {
        conn.on('ready', resolve);
        conn.on('error', (err) => {
          console.log('[Backend] SSH connection error:', err.message);
          reject(err);
        });

        const connectConfig = {
          host: config.host,
          port: config.port || 22,
          username: config.username,
          readyTimeout: 20000,
          tryKeyboard: true,
          // Explicitly force password auth
          algorithms: ['aes256-ctr', 'aes192-ctr', 'aes128-ctr']
        };

        // Debug: Log what we're sending
        console.log('[Backend] Full config:', JSON.stringify({
          host: connectConfig.host,
          port: connectConfig.port,
          username: connectConfig.username,
          hasPassword: !!config.password,
          passwordLength: config.password ? config.password.length : 0
        }));

        // Just use password directly
        connectConfig.password = config.password;

        console.log('[Backend] Connect config password:', connectConfig.password ? 'SET' : 'NOT SET');

        conn.connect(connectConfig);
      });

      // Store session (no local PTY for SSH)
      sshSessions.set(sessionId, { conn, socketId: socket.id });

      // Define handlers for this specific session
      const inputHandler = ({ sessionId: incomingSessionId, data }) => {
        if (incomingSessionId !== sessionId) return;
        console.log('[Backend] SSH input, data:', data);
        const session = sshSessions.get(sessionId);
        if (session && session.stream) {
          session.stream.write(data);
        }
      };

      const resizeHandler = ({ sessionId: incomingSessionId, cols, rows }) => {
        if (incomingSessionId !== sessionId) return;
        // SSH2 doesn't easily support resize after connect
      };

      const closeHandler = ({ sessionId: incomingSessionId }) => {
        if (incomingSessionId !== sessionId) return;
        const session = sshSessions.get(sessionId);
        if (session) {
          if (session.pty) session.pty.kill();
          if (session.stream) session.stream.close();
          session.conn.end();
          sshSessions.delete(sessionId);
        }
        // Remove listeners for this session
        socket.off('ssh:input', inputHandler);
        socket.off('ssh:resize', resizeHandler);
        socket.off('ssh:close', closeHandler);
      };

      // Register handlers
      socket.on('ssh:input', inputHandler);
      socket.on('ssh:resize', resizeHandler);
      socket.on('ssh:close', closeHandler);

      // Get SSH shell
      conn.shell({ term: 'xterm-256color', cols: config.cols || 80, rows: config.rows || 24 }, (err, stream) => {
        if (err) {
          socket.emit('ssh:error', { sessionId, error: err.message });
          return;
        }

        console.log('[Backend] SSH shell ready, sessionId:', sessionId);

        // Store stream and handler references
        sshSessions.set(sessionId, { conn, stream, socketId: socket.id, inputHandler, resizeHandler, closeHandler });

        // SSH stream data -> emit to client
        stream.on('data', (data) => {
          console.log('[Backend] SSH data to client, length:', data.length);
          socket.emit('ssh:data', { sessionId, data: data.toString() });
        });

        // Handle SSH stream close
        stream.on('close', () => {
          console.log('[Backend] SSH stream closed');
          conn.end();
          sshSessions.delete(sessionId);
          // Remove listeners for this session
          socket.off('ssh:input', inputHandler);
          socket.off('ssh:resize', resizeHandler);
          socket.off('ssh:close', closeHandler);
          socket.emit('ssh:closed', { sessionId });
        });
      });

      socket.emit('ssh:connected', { sessionId });
      console.log('SSH connected:', config.host);
    } catch (error) {
      console.error('SSH error:', error);
      socket.emit('ssh:error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Clean up terminal sessions
    for (const [sessionId, session] of terminalSessions.entries()) {
      if (session.socketId === socket.id) {
        session.pty.kill();
        terminalSessions.delete(sessionId);
      }
    }

    // Clean up SSH sessions
    for (const [sessionId, session] of sshSessions.entries()) {
      if (session.socketId === socket.id) {
        session.pty.kill();
        session.conn.end();
        sshSessions.delete(sessionId);
      }
    }
  });
});

// REST API Routes

// Connections
app.get('/api/connections', async (req, res) => {
  try {
    const connections = await Connection.find().sort({ createdAt: -1 });
    // Return password (needed for SSH connections)
    const connectionsWithPassword = connections.map(c => ({
      ...c.toObject(),
      password: c.password || '',
      privateKey: c.privateKey || ''
    }));
    res.json(connectionsWithPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/connections', async (req, res) => {
  try {
    const connection = new Connection(req.body);
    await connection.save();
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/connections/:id', async (req, res) => {
  try {
    const existing = await Connection.findById(req.params.id);
    const updates = { ...req.body };

    // Preserve old password if new one is empty
    if (!updates.password && existing.password) {
      updates.password = existing.password;
    }
    if (!updates.privateKey && existing.privateKey) {
      updates.privateKey = existing.privateKey;
    }

    const connection = await Connection.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/connections/:id', async (req, res) => {
  try {
    await Connection.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Commands
app.get('/api/commands', async (req, res) => {
  try {
    const commands = await Command.find().sort({ createdAt: -1 });
    console.log('[Backend] Returning commands:', commands.map(c => ({ name: c.name, command: c.command })));
    res.json(commands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/commands', async (req, res) => {
  try {
    console.log('[Backend] Received command:', req.body);
    const command = new Command(req.body);
    await command.save();
    res.json(command);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/commands/:id', async (req, res) => {
  try {
    await Command.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/commands/:id', async (req, res) => {
  try {
    const command = await Command.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(command);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Command Groups
app.get('/api/command-groups', async (req, res) => {
  try {
    const groups = await CommandGroup.find().sort({ order: 1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/command-groups', async (req, res) => {
  try {
    const group = new CommandGroup(req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/command-groups/:id', async (req, res) => {
  try {
    await CommandGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/command-groups/:id', async (req, res) => {
  try {
    const group = await CommandGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize default commands if none exist
const initDefaultCommands = async () => {
  const count = await Command.countDocuments();
  if (count === 0) {
    const defaultCommands = [
      { name: 'System Info', command: 'uname -a && uptime', description: 'Show system information', category: 'System' },
      { name: 'Disk Usage', command: 'df -h', description: 'Show disk usage', category: 'System' },
      { name: 'Memory Usage', command: 'free -m', description: 'Show memory usage', category: 'System' },
      { name: 'Process List', command: 'ps aux | head -20', description: 'Show running processes', category: 'System' },
      { name: 'Network Info', command: 'ip addr && netstat -tuln', description: 'Show network information', category: 'Network' },
      { name: 'Last Logins', command: 'last -10', description: 'Show last 10 logins', category: 'System' },
      { name: 'Service Status', command: 'systemctl list-units --type=service --state=running | head -20', description: 'Show running services', category: 'Service' },
      { name: 'CPU Info', command: 'lscpu', description: 'Show CPU information', category: 'System' },
    ];
    await Command.insertMany(defaultCommands);
    console.log('[Backend] Default commands initialized');
  }
};

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test SSH connection
app.post('/api/test-ssh', async (req, res) => {
  const { host, port, username, authType, password, privateKey } = req.body;

  const conn = new Client();

  try {
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve);
      conn.on('error', reject);

      const config = {
        host,
        port: port || 22,
        username,
        readyTimeout: 10000
      };

      if (authType === 'key' && privateKey) {
        config.privateKey = privateKey;
      } else {
        config.password = password;
      }

      conn.connect(config);
    });

    conn.end();
    res.json({ success: true, message: 'Connection successful!' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
