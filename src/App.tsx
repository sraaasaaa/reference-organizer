"use client";

import { useState, useMemo } from "react";
import { Search, Plus, BookOpen, Folder, Database, MessageSquare, FileText, Brain, Target, Calendar, X, Quote, Filter, ExternalLink } from "lucide-react";
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
  downloadUrl: string; // Ajout de l'URL de téléchargement
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
  const [filterYear, setFilterYear] = useState("All");
  const [filterDataset, setFilterDataset] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCollection, setSelectedCollection] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: "",
    dataset: "",
    messageType: "",
    size: "",
    annotationModel: "",
    detectionModel: "",
    metric: "",
    year: "",
    author: "",
    downloadUrl: "" // Ajout du champ URL
  });

  // Extraire les années uniques pour le filtre
  const uniqueYears = useMemo(() => {
    const years = [...new Set(articles.map(article => article.year))];
    return ["All", ...years.sort((a, b) => b.localeCompare(a))];
  }, [articles]);

  // Extraire les datasets uniques pour le filtre
  const uniqueDatasets = useMemo(() => {
    const datasets = [...new Set(articles.map(article => article.dataset))];
    return ["All", ...datasets.sort()];
  }, [articles]);

  const filteredAndSortedArticles = useMemo(() => {
    // Filtrage
    const filtered = articles.filter(article => {
      const matchesType = filterMessageType === "All" || article.messageType === filterMessageType;
      const matchesYear = filterYear === "All" || article.year === filterYear;
      const matchesDataset = filterDataset === "All" || article.dataset === filterDataset;
      const matchesSearch = 
        (article.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (article.dataset?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (article.annotationModel?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (article.detectionModel?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (article.author?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return matchesType && matchesYear && matchesDataset && matchesSearch;
    });

    // Tri
    switch (sortBy) {
      case "newest":
        return [...filtered].sort((a, b) => 
          b.year.localeCompare(a.year) || a.title.localeCompare(b.title)
        );
      case "oldest":
        return [...filtered].sort((a, b) => 
          a.year.localeCompare(b.year) || a.title.localeCompare(b.title)
        );
      case "title":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [articles, filterMessageType, filterYear, filterDataset, searchTerm, sortBy]);

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
      author: "",
      downloadUrl: ""
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

  const handleViewDetails = (article: Article) => {
    setSelectedArticle(article);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleCiteArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsCitationModalOpen(true);
  };

  const handleCloseCitationModal = () => {
    setIsCitationModalOpen(false);
    setSelectedArticle(null);
  };

  const handleDownloadRedirect = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("No download URL available for this article");
    }
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        <header className="app-header">
          <h1>References Organizer</h1>
          <p>Manage and organize your research articles</p>
        </header>

        <div className="filters-section">
          <div className="filters-header">
            <h2>Filters</h2>
          </div>
          
          {/* Filtres principaux */}
          <div className="main-filters">
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
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
            
            <button 
              className="filter-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? <X className="icon" /> : <Filter className="icon" />}
              {showAdvancedFilters ? "Hide Filters" : "More Filters"}
            </button>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>Year</label>
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="filter-select"
                >
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Dataset</label>
                <select 
                  value={filterDataset} 
                  onChange={(e) => setFilterDataset(e.target.value)}
                  className="filter-select"
                >
                  {uniqueDatasets.map((dataset) => (
                    <option key={dataset} value={dataset}>
                      {dataset.length > 30 ? `${dataset.substring(0, 30)}...` : dataset}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
              <h2>References ({filteredAndSortedArticles.length})</h2>
              <button className="add-reference-btn" onClick={handleAddArticle}>
                <Plus className="icon" />
                Add Article
              </button>
            </div>
            
            {filteredAndSortedArticles.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="references-grid">
                {filteredAndSortedArticles.map((article) => (
                  <div key={article.id} className="reference-card">
                    <div className="card-header">
                      <div className="card-title">
                        <h3 title={article.title}>{article.title.length > 50 ? `${article.title.substring(0, 50)}...` : article.title}</h3>
                        <span className="category-badge">{article.messageType}</span>
                      </div>
                      <p className="author"><Calendar className="icon inline mr-1" /> {article.year}</p>
                    </div>
                    <div className="card-content">
                      <div className="reference-details">
                        <p title={article.dataset}>
                          <span className="detail-label">Dataset:</span> {article.dataset?.length > 40 ? `${article.dataset.substring(0, 40)}...` : article.dataset || "—"}
                        </p>
                        <p title={article.detectionModel}>
                          <div className="icon inline mr-1" />
                          <span className="detail-label">Detection Model:</span> {article.detectionModel?.length > 40 ? `${article.detectionModel.substring(0, 40)}...` : article.detectionModel || "—"}
                        </p>
                        <p title={article.author}>
                          <div className="icon inline mr-1" />
                          <span className="detail-label">Author:</span> {article.author?.length > 40 ? `${article.author.substring(0, 40)}...` : article.author || "—"}
                        </p>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="view-btn"
                          onClick={() => handleViewDetails(article)}
                        >
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
                
                <div className="form-group">
                  <label htmlFor="downloadUrl">Download URL</label>
                  <input
                    type="url"
                    id="downloadUrl"
                    name="downloadUrl"
                    value={newArticle.downloadUrl}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/download"
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

      {/* Modale de détails */}
      {isDetailsModalOpen && selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h2>Article Details</h2>
              <button className="modal-close" onClick={handleCloseDetailsModal}>
                <X className="icon" />
              </button>
            </div>
            
            <div className="details-content">
              <div className="detail-section">
                <h3>{selectedArticle.title}</h3>
                <div className="detail-meta">
                  <span className="meta-item">
                    <Calendar className="icon inline mr-1" />
                    {selectedArticle.year}
                  </span>
                  <span className="meta-item category-badge">
                    {selectedArticle.messageType}
                  </span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Authors</h4>
                <p>{selectedArticle.author || "No authors listed"}</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <h4>Dataset</h4>
                  <p>{selectedArticle.dataset || "—"}</p>
                </div>
                
                <div className="detail-item">
                  <h4>Size</h4>
                  <p>{selectedArticle.size || "—"}</p>
                </div>
                
                <div className="detail-item">
                  <h4>Annotation Model</h4>
                  <p>{selectedArticle.annotationModel || "—"}</p>
                </div>
                
                <div className="detail-item">
                  <h4>Detection Model</h4>
                  <p>{selectedArticle.detectionModel || "—"}</p>
                </div>
                
                <div className="detail-item">
                  <h4>Metric</h4>
                  <p>{selectedArticle.metric || "—"}</p>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Access</h4>
                <button 
                  className="download-btn"
                  onClick={() => handleDownloadRedirect(selectedArticle.downloadUrl)}
                  disabled={!selectedArticle.downloadUrl}
                >
                  <ExternalLink className="icon" />
                  Go to Official Download Site
                </button>
              </div>
            </div>
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