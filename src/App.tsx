import { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Settings, Trash2, Plus, Edit2, X, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Product, CartItem, Slide } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ cartCount, onOpenCart, onOpenAdmin, onGoHome }: { cartCount: number, onOpenCart: () => void, onOpenAdmin: () => void, onGoHome: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onGoHome}>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
        <span className="text-white font-bold text-xl">S</span>
      </div>
      <h1 className="text-white font-bold text-xl tracking-tight hidden sm:block">StreamStore</h1>
    </div>
    <div className="flex items-center gap-4">
      <button 
        onClick={onOpenAdmin}
        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Settings size={24} />
      </button>
      <button 
        onClick={onOpenCart}
        className="relative p-2 text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-lg shadow-blue-600/30"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </nav>
);

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    fetch('/api/slides').then(res => res.json()).then(setSlides);
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden rounded-3xl mt-24 mb-12">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-black/60 z-10" />
      <AnimatePresence mode="wait">
        <motion.img 
          key={current}
          src={slides[current].image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
        />
      </AnimatePresence>
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-16">
        <AnimatePresence mode="wait">
          <motion.h2
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none max-w-2xl"
          >
            {slides[current].message}
          </motion.h2>
        </AnimatePresence>
        <p className="text-blue-400 mt-4 font-medium tracking-wide uppercase text-sm">Qualidade Premium & Entrega Rápida</p>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onClick }: { service: Service, onClick: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
  >
    <div className="w-20 h-20 flex items-center justify-center p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/10 transition-colors">
      <img src={service.logo} alt={service.name} className="max-w-full max-h-full object-contain" />
    </div>
    <span className="text-white font-semibold text-lg">{service.name}</span>
  </motion.div>
);

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
  >
    <div className="h-48 overflow-hidden relative">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
        R$ {product.price.toFixed(2)}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-white font-bold text-xl mb-2">{product.name}</h3>
      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.description}</p>
      {product.observations && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-6">
          <p className="text-blue-400 text-xs font-medium italic">Obs: {product.observations}</p>
        </div>
      )}
      <button
        onClick={() => onAddToCart(product)}
        className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
      >
        <Plus size={18} />
        Adicionar ao Carrinho
      </button>
    </div>
  </motion.div>
);

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: CartItem[], 
  onRemove: (id: number) => void,
  onUpdateQuantity: (id: number, delta: number) => void
}) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const message = `*Novo Pedido - StreamStore*\n\n` +
      items.map(item => `- ${item.name} (${item.quantity}x): R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n') +
      `\n\n*Total: R$ ${total.toFixed(2)}*` +
      `\n\n_Aguardando instruções para pagamento._`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5585982349916?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                <ShoppingCart className="text-blue-500" /> Carrinho
              </h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <ShoppingCart size={64} strokeWidth={1} />
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <img src={item.image} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                    <div className="flex-grow">
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <p className="text-blue-400 font-bold">R$ {item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700"
                        >
                          -
                        </button>
                        <span className="text-white font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-400 font-medium">Total</span>
                  <span className="text-white text-3xl font-black">R$ {total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                >
                  <Check size={20} />
                  Fazer Pedido via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Admin Panel ---

const AdminPanel = ({ 
  services, 
  onClose,
  onRefresh
}: { 
  services: Service[], 
  onClose: () => void,
  onRefresh: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'products' | 'slides'>('services');
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetch('/api/slides').then(res => res.json()).then(setSlides);
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingService?.id ? 'PUT' : 'POST';
    const url = editingService?.id ? `/api/services/${editingService.id}` : '/api/services';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingService)
    });
    setEditingService(null);
    onRefresh();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct?.id ? 'PUT' : 'POST';
    const url = editingProduct?.id ? `/api/products/${editingProduct.id}` : '/api/products';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });
    setEditingProduct(null);
    fetch('/api/products').then(res => res.json()).then(setProducts);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSlide?.id ? 'PUT' : 'POST';
    const url = editingSlide?.id ? `/api/slides/${editingSlide.id}` : '/api/slides';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingSlide)
    });
    setEditingSlide(null);
    fetch('/api/slides').then(res => res.json()).then(setSlides);
  };

  const handleDeleteService = async (id: number) => {
    if (confirm('Excluir este serviço excluirá todos os seus produtos. Continuar?')) {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Excluir este produto?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetch('/api/products').then(res => res.json()).then(setProducts);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (confirm('Excluir este slide?')) {
      await fetch(`/api/slides/${id}`, { method: 'DELETE' });
      fetch('/api/slides').then(res => res.json()).then(setSlides);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'service' | 'product' | 'slide') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'service') {
          setEditingService(prev => ({ ...prev, logo: reader.result as string }));
        } else if (type === 'product') {
          setEditingProduct(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setEditingSlide(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-white flex items-center gap-4">
            <Settings className="text-blue-500" size={40} /> Painel ADM
          </h1>
          <button onClick={onClose} className="bg-zinc-900 p-3 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('services')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'services' ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400"
            )}
          >
            Serviços
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'products' ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400"
            )}
          >
            Produtos / Planos
          </button>
          <button 
            onClick={() => setActiveTab('slides')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'slides' ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400"
            )}
          >
            Slides
          </button>
        </div>

        {activeTab === 'services' ? (
          <div className="space-y-6">
            <button 
              onClick={() => setEditingService({ name: '', logo: '' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Plus size={20} /> Novo Serviço
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(s => (
                <div key={s.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={s.logo} className="w-12 h-12 object-contain bg-white/10 p-2 rounded-lg" alt="" />
                    <span className="text-white font-bold">{s.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingService(s)} className="p-2 text-zinc-400 hover:text-blue-500"><Edit2 size={20} /></button>
                    <button onClick={() => handleDeleteService(s.id)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-6">
            <button 
              onClick={() => setEditingProduct({ name: '', price: 0, description: '', observations: '', service_id: services[0]?.id })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Plus size={20} /> Novo Plano
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex gap-4">
                  <img src={p.image} className="w-24 h-24 object-cover rounded-xl" alt="" />
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="text-white font-bold">{p.name}</h4>
                      <span className="text-blue-400 font-bold">R$ {p.price.toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">{services.find(s => s.id === p.service_id)?.name}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEditingProduct(p)} className="text-sm bg-zinc-800 px-3 py-1 rounded-lg text-zinc-400 hover:text-blue-500 flex items-center gap-1">
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-sm bg-zinc-800 px-3 py-1 rounded-lg text-zinc-400 hover:text-red-500 flex items-center gap-1">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => setEditingSlide({ message: '', image: '' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Plus size={20} /> Novo Slide
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {slides.map(s => (
                <div key={s.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex gap-4">
                  <img src={s.image} className="w-24 h-24 object-cover rounded-xl" alt="" />
                  <div className="flex-grow">
                    <h4 className="text-white font-bold">{s.message}</h4>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEditingSlide(s)} className="text-sm bg-zinc-800 px-3 py-1 rounded-lg text-zinc-400 hover:text-blue-500 flex items-center gap-1">
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={() => handleDeleteSlide(s.id)} className="text-sm bg-zinc-800 px-3 py-1 rounded-lg text-zinc-400 hover:text-red-500 flex items-center gap-1">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {editingService && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onSubmit={handleSaveService}
                className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-full max-w-md space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">{editingService.id ? 'Editar' : 'Novo'} Serviço</h2>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Nome</label>
                  <input 
                    required
                    value={editingService.name} 
                    onChange={e => setEditingService({...editingService, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Logo (URL ou Upload)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      value={editingService.logo} 
                      onChange={e => setEditingService({...editingService, logo: e.target.value})}
                      className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    />
                    <label className="cursor-pointer bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700 transition-colors">
                      <Plus size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'service')} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingService(null)} className="flex-grow bg-zinc-800 text-white font-bold py-3 rounded-xl">Cancelar</button>
                  <button type="submit" className="flex-grow bg-blue-600 text-white font-bold py-3 rounded-xl">Salvar</button>
                </div>
              </motion.form>
            </div>
          )}

          {editingSlide && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onSubmit={handleSaveSlide}
                className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-full max-w-md space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">{editingSlide.id ? 'Editar' : 'Novo'} Slide</h2>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Mensagem</label>
                  <input 
                    required
                    value={editingSlide.message} 
                    onChange={e => setEditingSlide({...editingSlide, message: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Imagem (URL ou Upload)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      value={editingSlide.image} 
                      onChange={e => setEditingSlide({...editingSlide, image: e.target.value})}
                      className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    />
                    <label className="cursor-pointer bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700 transition-colors">
                      <Plus size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'slide')} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingSlide(null)} className="flex-grow bg-zinc-800 text-white font-bold py-3 rounded-xl">Cancelar</button>
                  <button type="submit" className="flex-grow bg-blue-600 text-white font-bold py-3 rounded-xl">Salvar</button>
                </div>
              </motion.form>
            </div>
          )}

          {editingProduct && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onSubmit={handleSaveProduct}
                className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-full max-w-2xl space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-white">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Serviço</label>
                    <select 
                      value={editingProduct.service_id}
                      onChange={e => setEditingProduct({...editingProduct, service_id: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Nome do Plano</label>
                    <input 
                      required
                      value={editingProduct.name} 
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Preço (R$)</label>
                    <input 
                      type="number" step="0.01" required
                      value={editingProduct.price} 
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Imagem</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        value={editingProduct.image} 
                        onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                      />
                      <label className="cursor-pointer bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700 transition-colors">
                        <Plus size={20} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'product')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descrição</label>
                  <textarea 
                    value={editingProduct.description} 
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-24"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Observações</label>
                  <input 
                    value={editingProduct.observations} 
                    onChange={e => setEditingProduct({...editingProduct, observations: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingProduct(null)} className="flex-grow bg-zinc-800 text-white font-bold py-3 rounded-xl">Cancelar</button>
                  <button type="submit" className="flex-grow bg-blue-600 text-white font-bold py-3 rounded-xl">Salvar</button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'service' | 'admin'>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetch(`/api/products?serviceId=${selectedService.id}`)
        .then(res => res.json())
        .then(setProducts);
    }
  }, [selectedService]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'admin05052011' && loginForm.pass === 'admin085$_#') {
      setIsAdminAuth(true);
    } else {
      alert('Credenciais inválidas');
    }
  };

  const refreshData = () => {
    fetch('/api/services').then(res => res.json()).then(setServices);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      
      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setView('admin')}
        onGoHome={() => { setView('home'); setSelectedService(null); }}
      />

      <main className="max-w-7xl mx-auto px-6 pb-24">
        {view === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HeroCarousel />
            <div className="mb-12">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Nossos Serviços</h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onClick={() => { setSelectedService(service); setView('service'); }} 
                />
              ))}
            </div>
          </motion.div>
        )}

        {view === 'service' && selectedService && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button 
              onClick={() => setView('home')}
              className="mt-24 mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Voltar para Home
            </button>
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 bg-white/5 p-4 rounded-3xl border border-zinc-800">
                <img src={selectedService.logo} alt={selectedService.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedService.name}</h2>
                <p className="text-blue-400 font-medium tracking-wide">Escolha o melhor plano para você</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          </motion.div>
        )}

        {view === 'admin' && (
          <div className="mt-24">
            {!isAdminAuth ? (
              <div className="max-w-md mx-auto bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
                    <Settings className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Acesso Restrito</h2>
                  <p className="text-zinc-400 text-sm">Painel de Administração</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Usuário</label>
                    <input 
                      type="text" 
                      value={loginForm.user}
                      onChange={e => setLoginForm({...loginForm, user: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Senha</label>
                    <input 
                      type="password" 
                      value={loginForm.pass}
                      onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-4">
                    Entrar no Painel
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView('home')}
                    className="w-full text-zinc-500 hover:text-white text-sm font-medium transition-colors mt-2"
                  >
                    Voltar para o site
                  </button>
                </form>
              </div>
            ) : (
              <AdminPanel 
                services={services} 
                onClose={() => setView('home')} 
                onRefresh={refreshData}
              />
            )}
          </div>
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      <footer className="border-t border-zinc-900 py-12 px-6 text-center">
        <p className="text-zinc-500 text-sm">© 2024 StreamStore. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="text-zinc-400 hover:text-blue-500 transition-colors"><ExternalLink size={20} /></a>
        </div>
      </footer>
    </div>
  );
}
