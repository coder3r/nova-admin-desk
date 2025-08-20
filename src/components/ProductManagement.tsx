import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock products data
  const products = [
    {
      id: 1,
      title: "Premium Web Template",
      price: "$49",
      status: "Active",
      sales: 42,
      image: "📄"
    },
    {
      id: 2,
      title: "React Dashboard Kit",
      price: "$89",
      status: "Active", 
      sales: 28,
      image: "⚛️"
    },
    {
      id: 3,
      title: "Mobile App UI Kit",
      price: "$65",
      status: "Draft",
      sales: 15,
      image: "📱"
    }
  ];

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                    Product Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your product catalog
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate("/admin/products/add")}
              className="btn-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="glass-card border-0 shadow-premium animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary/30 border-border/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <div className="flex items-center border border-border/50 rounded-lg p-1">
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
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id}
              className="glass-card border-0 shadow-premium hover:shadow-accent transition-all duration-300 hover:scale-105 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {viewMode === 'grid' ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{product.image}</div>
                      <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{product.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="flex-1 border-border/50"
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{product.image}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-primary">{product.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.status}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="border-border/50"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Start by adding your first product"}
              </p>
              <Button
                onClick={() => navigate("/admin/products/add")}
                className="btn-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;