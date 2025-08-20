import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Grid,
  List,
  MoreVertical,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Activity,
  Loader2,
  Github
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  title: string;
  subtitle: string;
  author: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  features: string[];
  techStack: string[];
  githubLink: string;
  bestseller?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;

    setLoadingDelete(id);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        toast({ title: "Success", description: "Product deleted successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } finally {
      setLoadingDelete(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];
  
  const getBadge = (product: Product) => {
    if (product.bestseller) return { text: "🏆 Bestseller", class: "bg-amber-100 text-amber-700" };
    if (product.trending) return { text: "🔥 Trending", class: "bg-red-100 text-red-700" };
    if (product.newArrival) return { text: "✨ New", class: "bg-blue-100 text-blue-700" };
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Loading Products</h3>
            <p className="text-sm text-muted-foreground">Fetching your product catalog...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover-scale"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                    Product Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your source code products
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/admin/products/add')}
              className="btn-primary text-white hover-scale shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="glass-card border-0 shadow-premium animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 py-2 bg-secondary/30 border border-border/50 rounded-md text-sm focus:border-primary transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {filteredProducts.length} of {products.length} products
                </div>
                
                <div className="flex items-center border border-border/50 rounded-lg p-1 bg-secondary/20">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <Card className="glass-card border-0 shadow-premium animate-fade-in">
            <CardContent className="p-12 text-center">
              <Package className="w-20 h-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search criteria" 
                  : "Start by adding your first product"}
              </p>
              <Button
                onClick={() => navigate('/admin/products/add')}
                className="btn-primary text-white hover-scale shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredProducts.map((product, index) => (
              <Card 
                key={product._id}
                className="glass-card border-0 shadow-premium hover:shadow-accent transition-all duration-300 hover-scale animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">by {product.author}</p>
                        <Badge variant="secondary" className="mt-2">{product.category}</Badge>
                        {getBadge(product) && (
                          <Badge className={`ml-2 ${getBadge(product)!.class}`}>
                            {getBadge(product)!.text}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="flex-1 border-border/50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(product._id, product.title)}
                          disabled={loadingDelete === product._id}
                          className="text-destructive hover:text-destructive"
                        >
                          {loadingDelete === product._id ? 
                            <Loader2 className="w-4 h-4 animate-spin" /> : 
                            <Trash2 className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">by {product.author}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-primary">${product.price}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="border-border/50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;