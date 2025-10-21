"use client";

import { useState } from "react";
import { Search, Plus, BookOpen, Folder, Database, MessageSquare, FileText, Brain, Target, Calendar, X, Quote } from "lucide-react";
import "./assets/index.css";

import articlesData from "./data/articles.json";

interface Article {
  id: string;
  title: string;
  dataset: string;
  messageType: string;
  size: string;
  annotationModel: string;
  detectionModel: string;
  metric: string;
  year: string;
  author: string;
  citations: {
    apa: string;
    iso690: string;
    mla: string;
  };
}

interface Collection {
  id: string;
  name: string;
  count: number;
}

const MESSAGE_TYPES = [
  "All",
  "Text Analysis",
  "Network Data",
  "Multimodal",
  "Medical Text",
  "Satellite Images",
  "Audio"
];

const COLLECTIONS: Collection[] = [
  { id: "1", name: "Research Papers", count: 12 },
  { id: "2", name: "Book References", count: 8 },
  { id: "3", name: "Articles", count: 15 },
  { id: "4", name: "Thesis", count: 5 },
];

export default function ReferenceOrganizer() {
  const [articles, setArticles] = useState<Article[]>(articlesData as Article[]);
  const [filterMessageType, setFilterMessageType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  

  const [newArticle, setNewArticle] = useState({
    title: "",
    dataset: "",
    messageType: "",
    size: "",
    annotationModel: "",
    detectionModel: "",
    metric: "",
    year: "",
    author: ""
  });

  const filteredArticles = articles.filter(article => {
    const matchesType = filterMessageType === "All" || article.messageType === filterMessageType;
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.dataset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.annotationModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.detectionModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddArticle = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Réinitialiser le formulaire
    setNewArticle({
      title: "",
      dataset: "",
      messageType: "",
      size: "",
      annotationModel: "",
      detectionModel: "",
      metric: "",
      year: "",
      author: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewArticle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!newArticle.title || !newArticle.dataset || !newArticle.messageType) {
      alert("Veuillez remplir les champs obligatoires (Titre, Dataset, Type de données)");
      return;
    }
    
    // Créer le nouvel article avec citations vides (à remplir selon vos besoins)
    const articleToAdd: Article = {
      ...newArticle,
      id: Date.now().toString(),
      citations: {
        apa: `${newArticle.author} (${newArticle.year}). ${newArticle.title}.`,
        iso690: `${newArticle.author}. ${newArticle.title} [en ligne]. ${newArticle.year}.`,
        mla: `${newArticle.author}. "${newArticle.title}". ${newArticle.year}.`
      }
    };
    
    // Ajouter à la liste
    setArticles(prev => [articleToAdd, ...prev]);
    
    // Fermer la modale et réinitialiser
    handleCloseModal();
  };

  const handleCiteArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsCitationModalOpen(true);
  };

  const handleCloseCitationModal = () => {
    setIsCitationModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        <header className="app-header">
          <h1>References Organizer</h1>
          <p>Manage and organize your research articles</p>
        </header>

        {/* Filtres en haut */}
        <div className="filters-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, dataset, or models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Message Type</label>
            <select 
              value={filterMessageType} 
              onChange={(e) => setFilterMessageType(e.target.value)}
              className="filter-select"
            >
              {MESSAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select className="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="content-layout">
          {/* Collections à gauche */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h2><Folder className="icon" /> Collections</h2>
            </div>
            <div className="collections-list">
              {COLLECTIONS.map((collection) => (
                <button
                  key={collection.id}
                  className={`collection-item ${selectedCollection === collection.id ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  <span>{collection.name}</span>
                  <span className="collection-count">{collection.count}</span>
                </button>
              ))}
            </div>
            
            <div className="sidebar-footer">
              <button className="add-collection-btn">
                <Plus className="icon" />
                New Collection
              </button>
            </div>
          </div>

          {/* Résultats en cartes */}
          <div className="main-content">
            <div className="content-header">
              <h2>References ({filteredArticles.length})</h2>
              <button className="add-reference-btn" onClick={handleAddArticle}>
                <Plus className="icon" />
                Add Article
              </button>
            </div>
            
            {filteredArticles.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="references-grid">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="reference-card">
                    <div className="card-header">
                      <div className="card-title">
                        <h3>{article.title}</h3>
                        <span className="category-badge">{article.messageType}</span>
                      </div>
                      <p className="author"><Calendar className="icon inline mr-1" /> {article.year}</p>
                    </div>
                    <div className="card-content">
                      <div className="reference-details">
                        <p>
                          <Database className="icon inline mr-1" />
                          <span className="detail-label">Dataset:</span> {article.dataset}
                        </p>
                        <p>
                          <Target className="icon inline mr-1" />
                          <span className="detail-label">Detection Model:</span> {article.detectionModel}
                        </p>
                        <p>
                          <FileText className="icon inline mr-1" />
                          <span className="detail-label">Author:</span> {article.author}
                        </p>
                      </div>
                      <div className="card-actions">
                        <button className="view-btn">
                          <BookOpen className="icon" />
                          View Details
                        </button>
                        <button 
                          className="cite-btn"
                          onClick={() => handleCiteArticle(article)}
                        >
                          <Quote className="icon" />
                          Cite
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale d'ajout d'article */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Article</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X className="icon" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newArticle.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Article title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={newArticle.author}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Author name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dataset">Dataset *</label>
                  <input
                    type="text"
                    id="dataset"
                    name="dataset"
                    value={newArticle.dataset}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dataset name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="messageType">Message Type *</label>
                  <select
                    id="messageType"
                    name="messageType"
                    value={newArticle.messageType}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select type</option>
                    {MESSAGE_TYPES.filter(type => type !== "All").map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    value={newArticle.year}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Publication year"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={newArticle.size}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dataset size"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="annotationModel">Annotation Model</label>
                  <input
                    type="text"
                    id="annotationModel"
                    name="annotationModel"
                    value={newArticle.annotationModel}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Model name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="detectionModel">Detection Model</label>
                  <input
                    type="text"
                    id="detectionModel"
                    name="detectionModel"
                    value={newArticle.detectionModel}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Model name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="metric">Metric</label>
                  <input
                    type="text"
                    id="metric"
                    name="metric"
                    value={newArticle.metric}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Evaluation metric"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de citation */}
      {isCitationModalOpen && selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content citation-modal">
            <div className="modal-header">
              <h2>Cite This Article</h2>
              <button className="modal-close" onClick={handleCloseCitationModal}>
                <X className="icon" />
              </button>
            </div>
            
            <div className="citation-content">
              <div className="citation-item">
                <h3>APA Style</h3>
                <div className="citation-text">
                  {selectedArticle.citations.apa}
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(selectedArticle.citations.apa)}
                >
                  Copy
                </button>
              </div>
              
              <div className="citation-item">
                <h3>ISO 690</h3>
                <div className="citation-text">
                  {selectedArticle.citations.iso690}
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(selectedArticle.citations.iso690)}
                >
                  Copy
                </button>
              </div>
              
              <div className="citation-item">
                <h3>MLA Style</h3>
                <div className="citation-text">
                  {selectedArticle.citations.mla}
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(selectedArticle.citations.mla)}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
