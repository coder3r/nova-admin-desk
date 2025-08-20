import { ArrowLeft, Link, Package, Save, Star, Upload, Image, CheckCircle, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AddProduct = () => {
  const [form, setForm] = useState({
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { toast } = useToast();

  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Auto-calculate price using Math.round()
  useEffect(() => {
    if (form.originalPrice && form.discount) {
      const originalPrice = parseFloat(form.originalPrice);
      const discount = parseFloat(form.discount);

      if (
        !isNaN(originalPrice) &&
        !isNaN(discount) &&
        discount >= 0 &&
        discount <= 100
      ) {
        const discountAmount = (originalPrice * discount) / 100;
        const newPrice = originalPrice - discountAmount;
        setForm((prev) => ({
          ...prev,
          price: Math.round(newPrice).toString(),
        }));
      }
    } else if (form.originalPrice && !form.discount) {
      setForm((prev) => ({
        ...prev,
        price: Math.round(parseFloat(form.originalPrice)).toString(),
      }));
    }
  }, [form.originalPrice, form.discount]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.author.trim()) errors.author = "Author is required";
    if (!form.category) errors.category = "Category is required";
    if (form.category === "Other" && !customCategory.trim()) {
      errors.customCategory = "Custom category is required";
    }
    if (!form.originalPrice || parseFloat(form.originalPrice) <= 0) {
      errors.originalPrice = "Valid original price is required";
    }
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.features.trim()) errors.features = "Features are required";
    if (!form.techStack.trim()) errors.techStack = "Tech stack is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
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

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          category: form.category === "Other" ? customCategory : form.category,
          price: Number(form.price),
          originalPrice: Number(form.originalPrice),
          discount: Number(form.discount),
          rating: Number(form.rating),
          reviews: Number(form.reviews),
          features: form.features.split(",").map((f) => f.trim()),
          techStack: form.techStack.split(",").map((t) => t.trim()),
          bestseller: form.badge === "bestseller",
          trending: form.badge === "trending",
          newArrival: form.badge === "newArrival",
        }),
      });

      if (res.ok) {
        toast({
          title: "Success!",
          description: "Product added successfully",
        });
        navigate("/admin/products");
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to add product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Add New Product
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a new source code product listing
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
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Festival Greeting Hub"
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
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="e.g., SEASONAL CELEBRATIONS"
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
                    value={form.author}
                    onChange={handleChange}
                    placeholder="e.g., ROMANCE LAB"
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
                    value={form.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm({ ...form, category: value });
                      if (value !== "Other") setCustomCategory("");
                      if (validationErrors.category) {
                        setValidationErrors(prev => ({ ...prev, category: "" }));
                      }
                    }}
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

                  {form.category === "Other" && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <Label htmlFor="customCategory" className="text-foreground">
                        Specify Other Category *
                      </Label>
                      <Input
                        id="customCategory"
                        name="customCategory"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          if (validationErrors.customCategory) {
                            setValidationErrors(prev => ({ ...prev, customCategory: "" }));
                          }
                        }}
                        placeholder="e.g., Portfolio, Dashboard"
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
                    value={form.badge}
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
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Detailed description of your product..."
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
                  <Label htmlFor="originalPrice" className="text-foreground">Original Price ($) *</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="599"
                    className={`bg-secondary/30 border-border/50 transition-all duration-200 ${
                      validationErrors.originalPrice ? 'border-destructive' : 'focus:border-primary'
                    }`}
                  />
                  {validationErrors.originalPrice && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.originalPrice}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-foreground">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={handleChange}
                    placeholder="50"
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Current Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="1"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="299"
                    className="bg-secondary/30 border-border/50 focus:border-primary transition-all duration-200"
                    readOnly={form.originalPrice && form.discount ? true : false}
                  />
                  {form.originalPrice && form.discount && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Auto-calculated based on original price and discount
                    </p>
                  )}
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
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.8"
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
                    value={form.reviews}
                    onChange={handleChange}
                    placeholder="210"
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
                  value={form.features}
                  onChange={handleChange}
                  placeholder="10+ festival templates, Animated decorations, Festival countdowns, Photo sharing wall"
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
                <Label htmlFor="techStack" className="text-foreground">
                  Tech Stack (comma-separated) *
                </Label>
                <Input
                  id="techStack"
                  name="techStack"
                  value={form.techStack}
                  onChange={handleChange}
                  placeholder="React, Firebase, Tailwind CSS, TypeScript"
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
                  value={form.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo"
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
              disabled={loading}
              className="border-border/50 hover:bg-secondary/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary text-white min-w-[140px] hover-scale shadow-glow transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProduct;