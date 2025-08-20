import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
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
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Add New Product
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a new product listing
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <Card className="glass-card border-0 shadow-premium animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="w-5 h-5 text-primary" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Add Product Form
              </h3>
              <p className="text-muted-foreground mb-4">
                This feature is under development
              </p>
              <Button
                onClick={() => navigate("/admin/dashboard")}
                className="btn-primary text-white"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddProduct;