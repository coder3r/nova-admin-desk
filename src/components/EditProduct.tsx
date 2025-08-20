import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Link, Package, Save, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  badge: string;
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

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    author: "",
    price: "",
    originalPrice: "",
    discount: "",
    rating: "",
    reviews: "",
    category: "",
    badge: "",
    description: "",
    features: "",
    techStack: "",
    githubLink: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(res.status === 404 ? "Product not found" : "Failed to fetch product");
        }

        const data: Product = await res.json();

        let badgeValue = "";
        if (data.bestseller) badgeValue = "bestseller";
        else if (data.trending) badgeValue = "trending";
        else if (data.newArrival) badgeValue = "newArrival";

        setFormData({
          title: data.title,
          subtitle: data.subtitle || "",
          author: data.author,
          price: data.price.toString(),
          originalPrice: data.originalPrice?.toString() || "",
          discount: data.discount?.toString() || "",
          rating: data.rating?.toString() || "",
          reviews: data.reviews?.toString() || "",
          category: data.category,
          badge: badgeValue,
          description: data.description,
          features: data.features.join(", "),
          techStack: data.techStack.join(", "),
          githubLink: data.githubLink || ""
        });

        setTimeout(() => setIsInitialLoad(false), 100);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate, toast]);

  // Auto-calculate price using Math.round
  useEffect(() => {
    if (!isInitialLoad && formData.originalPrice && formData.discount) {
      const originalPrice = parseFloat(formData.originalPrice);
      const discount = parseFloat(formData.discount);

      if (!isNaN(originalPrice) && !isNaN(discount) && discount >= 0 && discount <= 100) {
        const discountAmount = (originalPrice * discount) / 100;
        const newPrice = originalPrice - discountAmount;
        const roundedPrice = Math.round(newPrice);
        setFormData(prev => ({
          ...prev,
          price: roundedPrice.toString()
        }));
      }
    } else if (!isInitialLoad && formData.originalPrice && !formData.discount) {
      const roundedPrice = Math.round(parseFloat(formData.originalPrice));
      setFormData(prev => ({
        ...prev,
        price: roundedPrice.toString()
      }));
    }
  }, [formData.originalPrice, formData.discount, isInitialLoad]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.author.trim()) errors.author = "Author is required";
    if (!formData.category) errors.category = "Category is required";
    if (formData.category === "Other" && !customCategory.trim()) {
      errors.customCategory = "Custom category is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Valid price is required";
    }
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.features.trim()) errors.features = "Features are required";
    if (!formData.techStack.trim()) errors.techStack = "Tech stack is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "category" && value !== "Other") setCustomCategory("");
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          author: formData.author,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice) || Number(formData.price),
          discount: Number(formData.discount) || 0,
          rating: Number(formData.rating) || 0,
          reviews: Number(formData.reviews) || 0,
          category: formData.category === "Other" ? customCategory : formData.category,
          description: formData.description,
          features: formData.features.split(",").map(f => f.trim()).filter(f => f),
          techStack: formData.techStack.split(",").map(t => t.trim()).filter(t => t),
          githubLink: formData.githubLink,
          bestseller: formData.badge === "bestseller",
          trending: formData.badge === "trending",
          newArrival: formData.badge === "newArrival"
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update product");
      }

      toast({ title: "Success!", description: "Product updated successfully!" });
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Loading Product</h3>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the product details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin/products")}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover-scale"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Edit Product
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update product information and details
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="glass-card border-0 shadow-premium animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Package className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Product Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                      validationErrors.title ? 'border-destructive' : 'focus:border-primary'
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.title}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-foreground">Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-foreground">Author *</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                      validationErrors.author ? 'border-destructive' : 'focus:border-primary'
                    }`}
                  />
                  {validationErrors.author && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.author}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full h-10 px-3 py-2 bg-secondary/30 border rounded-md text-sm transition-all duration-200 ${
                      validationErrors.category ? 'border-destructive' : 'border-border/50 focus:border-primary'
                    }`}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Love Letter">Love Letter</option>
                    <option value="Memory">Memory</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Other">Other</option>
                  </select>
                  {validationErrors.category && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.category}
                    </p>
                  )}

                  {formData.category === "Other" && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <Label htmlFor="customCategory" className="text-foreground">Specify Other Category *</Label>
                      <Input
                        id="customCategory"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          if (validationErrors.customCategory) {
                            setValidationErrors(prev => ({ ...prev, customCategory: "" }));
                          }
                        }}
                        className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                          validationErrors.customCategory ? 'border-destructive' : 'focus:border-primary'
                        }`}
                      />
                      {validationErrors.customCategory && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.customCategory}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="badge" className="text-foreground">Badge (Optional)</Label>
                  <select
                    id="badge"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 bg-secondary/30 border border-border/50 rounded-md text-sm focus:border-primary transition-all duration-200"
                  >
                    <option value="">Select Badge</option>
                    <option value="bestseller">🏆 Bestseller</option>
                    <option value="trending">🔥 Trending</option>
                    <option value="newArrival">✨ New Arrival</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`bg-secondary/30 border-border/50 transition-all duration-200 resize-none ${
                    validationErrors.description ? 'border-destructive' : 'focus:border-primary'
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Ratings */}
          <Card className="glass-card border-0 shadow-premium animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-accent" />
                Pricing & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Current Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                      validationErrors.price ? 'border-destructive' : 'focus:border-primary'
                    }`}
                    readOnly={formData.originalPrice && formData.discount ? true : false}
                  />
                  {formData.originalPrice && formData.discount && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Auto-calculated based on original price and discount
                    </p>
                  )}
                  {validationErrors.price && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.price}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-foreground">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-foreground">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleChange}
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-foreground">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviews" className="text-foreground">Number of Reviews</Label>
                  <Input
                    id="reviews"
                    name="reviews"
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={handleChange}
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features & Tech Stack */}
          <Card className="glass-card border-0 shadow-premium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-secondary" />
                Features & Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="features" className="text-foreground">Features (comma-separated) *</Label>
                <Textarea
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  rows={3}
                  className={`bg-secondary/30 border-border/50 transition-all duration-200 resize-none ${
                    validationErrors.features ? 'border-destructive' : 'focus:border-primary'
                  }`}
                />
                <p className="text-xs text-muted-foreground">
                  Separate each feature with a comma
                </p>
                {validationErrors.features && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.features}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack" className="text-foreground">Tech Stack (comma-separated) *</Label>
                <Input
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                    validationErrors.techStack ? 'border-destructive' : 'focus:border-primary'
                  }`}
                />
                <p className="text-xs text-muted-foreground">
                  Separate each technology with a comma
                </p>
                {validationErrors.techStack && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.techStack}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="glass-card border-0 shadow-premium animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Link className="w-5 h-5 text-primary" />
                Links & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="githubLink" className="text-foreground">GitHub Repository URL</Label>
                <Input
                  id="githubLink"
                  name="githubLink"
                  type="url"
                  value={formData.githubLink}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="p-4 bg-gradient-subtle rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Manual Delivery System
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This product will be delivered manually via Temp Link from the admin panel after payment. You don't need to add the Drive Download Link here.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="border-border/50 hover:bg-secondary/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="btn-accent text-white min-w-[140px] hover-scale shadow-glow transition-all duration-200"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProduct;