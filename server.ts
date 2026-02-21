import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("store.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    observations TEXT,
    image TEXT,
    FOREIGN KEY (service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    image TEXT NOT NULL
  );
`);

// Seed initial data if empty
const serviceCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
if (serviceCount.count === 0) {
  const insertService = db.prepare("INSERT INTO services (name, logo) VALUES (?, ?)");
  const insertProduct = db.prepare("INSERT INTO products (service_id, name, price, description, observations, image) VALUES (?, ?, ?, ?, ?, ?)");

  const services = [
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_with_text.svg" },
    { name: "Canva", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Canva_logo.svg" },
    { name: "Prime Video", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" },
    { name: "Paramount+", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg" },
    { name: "CapCut", logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/CapCut_logo.svg" }
  ];

  services.forEach(s => {
    const result = insertService.run(s.name, s.logo);
    const serviceId = result.lastInsertRowid;

    if (s.name === "Netflix") {
      insertProduct.run(serviceId, "4K 30 Dias | 1 tela com PIN", 24.90, "Acesso premium 4K por 30 dias.", "Entrega imediata via WhatsApp.", "https://picsum.photos/seed/netflix1/400/300");
      insertProduct.run(serviceId, "Somente pra TV 4K 30 Dias | 1 tela com PIN", 19.90, "Exclusivo para Smart TV.", "PIN de segurança incluso.", "https://picsum.photos/seed/netflix2/400/300");
      insertProduct.run(serviceId, "4K 7 Dias Compartilhada [Promoção]", 8.90, "Acesso compartilhado por 7 dias.", "Preço promocional.", "https://picsum.photos/seed/netflix3/400/300");
      insertProduct.run(serviceId, "4K 30 Dias Compartilhada", 13.90, "Acesso compartilhado por 30 dias.", "Melhor custo-benefício.", "https://picsum.photos/seed/netflix4/400/300");
    } else if (s.name === "Canva") {
      insertProduct.run(serviceId, "Canva Pro", 15.90, "Acesso total ao Canva Pro.", "Ativação no seu e-mail.", "https://picsum.photos/seed/canva/400/300");
    } else if (s.name === "Spotify") {
      insertProduct.run(serviceId, "Spotify Premium - Link 3 Meses", 20.90, "3 meses de Spotify Premium.", "Link de convite familiar.", "https://picsum.photos/seed/spotify/400/300");
    } else if (s.name === "Prime Video") {
      insertProduct.run(serviceId, "Conta Completa", 12.90, "Acesso total ao Prime Video.", "30 dias de validade.", "https://picsum.photos/seed/prime/400/300");
    } else if (s.name === "Paramount+") {
      insertProduct.run(serviceId, "Conta Completa", 18.90, "Acesso total ao Paramount+.", "30 dias de validade.", "https://picsum.photos/seed/paramount/400/300");
    } else if (s.name === "CapCut") {
      insertProduct.run(serviceId, "CapCut Pro 7 Dias Privado", 7.90, "Acesso privado por 7 dias.", "Recursos Pro liberados.", "https://picsum.photos/seed/capcut1/400/300");
      insertProduct.run(serviceId, "CapCut Pro 28 Dias Privado", 20.90, "Acesso privado por 28 dias.", "Melhor para editores.", "https://picsum.photos/seed/capcut2/400/300");
    }
  });
}

// Seed slides if empty
const slideCount = db.prepare("SELECT COUNT(*) as count FROM slides").get() as { count: number };
if (slideCount.count === 0) {
  const insertSlide = db.prepare("INSERT INTO slides (message, image) VALUES (?, ?)");
  insertSlide.run("Melhor loja de streamings", "https://picsum.photos/seed/stream0/1200/600");
  insertSlide.run("Promoções exclusivas", "https://picsum.photos/seed/stream1/1200/600");
  insertSlide.run("Serviços digitais para você", "https://picsum.photos/seed/stream2/1200/600");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' })); // For base64 images

  // API Routes
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.get("/api/products", (req, res) => {
    const { serviceId } = req.query;
    let products;
    if (serviceId) {
      products = db.prepare("SELECT * FROM products WHERE service_id = ?").all(serviceId);
    } else {
      products = db.prepare("SELECT * FROM products").all();
    }
    res.json(products);
  });

  app.post("/api/services", (req, res) => {
    const { name, logo } = req.body;
    const result = db.prepare("INSERT INTO services (name, logo) VALUES (?, ?)").run(name, logo);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/services/:id", (req, res) => {
    const { name, logo } = req.body;
    db.prepare("UPDATE services SET name = ?, logo = ? WHERE id = ?").run(name, logo, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE service_id = ?").run(req.params.id);
    db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/products", (req, res) => {
    const { service_id, name, price, description, observations, image } = req.body;
    const result = db.prepare("INSERT INTO products (service_id, name, price, description, observations, image) VALUES (?, ?, ?, ?, ?, ?)").run(service_id, name, price, description, observations, image);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, price, description, observations, image } = req.body;
    db.prepare("UPDATE products SET name = ?, price = ?, description = ?, observations = ?, image = ? WHERE id = ?").run(name, price, description, observations, image, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/slides", (req, res) => {
    const slides = db.prepare("SELECT * FROM slides").all();
    res.json(slides);
  });

  app.post("/api/slides", (req, res) => {
    const { message, image } = req.body;
    const result = db.prepare("INSERT INTO slides (message, image) VALUES (?, ?)").run(message, image);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/slides/:id", (req, res) => {
    const { message, image } = req.body;
    db.prepare("UPDATE slides SET message = ?, image = ? WHERE id = ?").run(message, image, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/slides/:id", (req, res) => {
    db.prepare("DELETE FROM slides WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
