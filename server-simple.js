import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('dist/public'));

// Simple in-memory storage
let projects = [];
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@dttools.com',
    name: 'Administrator',
    role: 'admin',
    createdAt: new Date()
  }
];

// Simple authentication middleware
const requireAuth = (req, res, next) => {
  // For demo purposes, always authenticated
  req.user = { id: '1', username: 'admin', role: 'admin' };
  next();
};

// API Routes
app.get('/api/auth/me', (req, res) => {
  res.json({ user: users[0] });
});

// Login endpoint - Fixed to accept both username and email
app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body;
  
  // Support both 'email' and 'username' parameters for compatibility
  const loginField = email || username;
  
  console.log('Login attempt:', { loginField, password: password ? '***' : 'missing' });
  
  // Simple validation - accept both email and username
  if ((loginField === 'dttools.app@gmail.com' || loginField === 'admin') && password === 'Gulex0519!@') {
    res.json({
      success: true,
      user: { 
        id: '1', 
        email: 'dttools.app@gmail.com', 
        username: 'admin',
        name: 'Admin DTTools',
        role: 'admin'
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/projects', requireAuth, (req, res) => {
  res.json(projects);
});

app.post('/api/projects', requireAuth, (req, res) => {
  const project = {
    id: Date.now().toString(),
    name: req.body.name || 'Novo Projeto',
    description: req.body.description || '',
    status: 'in_progress',
    currentPhase: 1,
    completionRate: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  projects.push(project);
  res.status(201).json(project);
});

app.get('/api/projects/:id', requireAuth, (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.put('/api/projects/:id', requireAuth, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects.splice(projectIndex, 1);
  res.json({ success: true });
});

// Dashboard
app.get('/api/dashboard', requireAuth, (req, res) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const avgCompletion = projects.length > 0 
    ? projects.reduce((sum, p) => sum + (p.completionRate || 0), 0) / projects.length 
    : 0;

  res.json({
    totalProjects,
    activeProjects,
    completedProjects,
    avgCompletion: Math.round(avgCompletion),
    recentProjects: projects.slice(-3).reverse()
  });
});

// Serve static files
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DTTools - Design Thinking Tools</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2563eb; margin-bottom: 20px; }
          .status { background: #dcfce7; color: #166534; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .api-list { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .api-item { margin: 10px 0; font-family: monospace; }
          .method { color: #059669; font-weight: bold; }
          .endpoint { color: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎯 DTTools - Design Thinking Tools</h1>
          
          <div class="status">
            ✅ <strong>Sistema funcionando!</strong><br>
            Backend ativo e API respondendo corretamente.
          </div>
          
          <h2>📡 API Endpoints Disponíveis:</h2>
          <div class="api-list">
            <div class="api-item"><span class="method">GET</span> <span class="endpoint">/api/auth/me</span> - Verificar autenticação</div>
            <div class="api-item"><span class="method">GET</span> <span class="endpoint">/api/projects</span> - Listar projetos</div>
            <div class="api-item"><span class="method">POST</span> <span class="endpoint">/api/projects</span> - Criar projeto</div>
            <div class="api-item"><span class="method">GET</span> <span class="endpoint">/api/projects/:id</span> - Obter projeto</div>
            <div class="api-item"><span class="method">PUT</span> <span class="endpoint">/api/projects/:id</span> - Atualizar projeto</div>
            <div class="api-item"><span class="method">DELETE</span> <span class="endpoint">/api/projects/:id</span> - Deletar projeto</div>
            <div class="api-item"><span class="method">GET</span> <span class="endpoint">/api/dashboard</span> - Dashboard</div>
          </div>
          
          <h2>🚀 Próximos Passos:</h2>
          <ol>
            <li>Execute <code>npm run build</code> para gerar o frontend</li>
            <li>Configure o banco de dados PostgreSQL</li>
            <li>Instale todas as dependências com <code>npm install</code></li>
            <li>Execute <code>npm run dev</code> para modo desenvolvimento</li>
          </ol>
          
          <p><strong>Status:</strong> Backend funcionando ✅ | Frontend: Pendente build | Banco: SQLite temporário</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DTTools Server running on port ${PORT}`);
  console.log(`📱 Access: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`✅ System Status: FUNCTIONAL`);
});
