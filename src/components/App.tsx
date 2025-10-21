"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, BookOpen } from "lucide-react";

interface Reference {
  id: string;
  title: string;
  author: string;
  category: string;
  year: string;
  notes: string;
}

const CATEGORIES = [
  "All",
  "Academic",
  "Technology",
  "Science",
  "Literature",
  "History",
  "Business",
  "Health"
];

export default function ReferenceOrganizer() {
  const [references, setReferences] = useState<Reference[]>([
    {
      id: "1",
      title: "The Future of Artificial Intelligence",
      author: "Jane Smith",
      category: "Technology",
      year: "2023",
      notes: "Comprehensive overview of AI trends"
    },
    {
      id: "2",
      title: "Shakespeare's Influence on Modern Literature",
      author: "Robert Johnson",
      category: "Literature",
      year: "2022",
      notes: "Analysis of literary techniques"
    },
    {
      id: "3",
      title: "Climate Change and Global Economics",
      author: "Emily Chen",
      category: "Science",
      year: "2023",
      notes: "Economic impact analysis"
    }
  ]);
  
  const [filterCategory, setFilterCategory] = useState("All");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !category) return;
    
    const newReference: Reference = {
      id: Date.now().toString(),
      title,
      author,
      category,
      year,
      notes
    };
    
    setReferences([newReference, ...references]);
    
    // Reset form
    setTitle("");
    setAuthor("");
    setCategory("");
    setYear("");
    setNotes("");
  };

  const filteredReferences = references.filter(ref => {
    const matchesCategory = filterCategory === "All" || ref.category === filterCategory;
    const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ref.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">Reference Organizer</h1>
          <p className="mt-2 text-gray-600">Manage and organize your research references</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Add Reference Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Article title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Author name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter(cat => cat !== "All").map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2023"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Reference
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - References List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    References ({filteredReferences.length})
                  </CardTitle>
                  
                  <div className="flex gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        placeholder="Search references..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {filteredReferences.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No references found</h3>
                    <p className="mt-1 text-gray-500">
                      {searchTerm || filterCategory !== "All" 
                        ? "Try adjusting your search or filter" 
                        : "Add your first reference using the form"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReferences.map((ref) => (
                      <Card key={ref.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{ref.title}</h3>
                              <p className="text-sm text-gray-600">by {ref.author}</p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                              {ref.category}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {ref.year && (
                              <span className="flex items-center">
                                <span className="mr-1">📅</span> {ref.year}
                              </span>
                            )}
                            <span className="flex items-center">
                              <span className="mr-1">📝</span> {ref.notes || "No notes"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
