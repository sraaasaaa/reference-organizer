"use client";

import { useState, useMemo } from "react";
import { Search, Plus, BookOpen, Folder, Database, MessageSquare, FileText, Brain, Target, Calendar, X, Quote, Filter, ExternalLink } from "lucide-react";
import "./assets/index.css";

import articlesData from "./data/articles.json";

interface Article {
  id: string;
  title: string;
  datasets: string[]; // Changed to array
  messageType: string;
  size: string;
  annotationModel: string;
  detectionModel: string;
  metrics: string[]; // Changed to array
  year: string;
  author: string;
  downloadUrl: string;
  collectionId: string;
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
  "Blogs+lettres+guides",
  "Tweets",
  "Conversations",
  "Commentaires Reddit",
  "Histoires"
];

const MESSAGE_TYPE_MAP: Record<string, string> = {
  "All": "All",
  "Blogs+lettres+guides": "Blogs/Letters/Guides",
  "Tweets": "Tweets",
  "Conversations": "Conversations",
  "Commentaires Reddit": "Reddit Comments",
  "Histoires": "Stories"
};

const COLLECTIONS: Omit<Collection, 'count'>[] = [
  { id: "1", name: "Research Papers" },
  { id: "2", name: "Review/Survey" },
  { id: "3", name: "Application/Case Study" },
  { id: "4", name: "Theoretical" },
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
    datasets: "", // Comma-separated string for input
    messageType: "",
    size: "",
    annotationModel: "",
    detectionModel: "",
    metrics: "", // Comma-separated string for input
    year: "",
    author: "",
    downloadUrl: "",
    collectionId: "1"
  });

  // Calculate dynamic collection counts
  const collectionsWithCounts: Collection[] = useMemo(() => {
    return COLLECTIONS.map(collection => {
      const count = articles.filter(article => article.collectionId === collection.id).length;
      return {
        ...collection,
        count
      };
    });
  }, [articles]);

  // Extract unique datasets for filter
  const uniqueDatasets = useMemo(() => {
    const allDatasets = articles.flatMap(article => article.datasets);
    const unique = [...new Set(allDatasets)];
    return ["All", ...unique.sort()];
  }, [articles]);

  // Extract unique years for filter
  const uniqueYears = useMemo(() => {
    const years = [...new Set(articles.map(article => article.year))];
    return ["All", ...years.sort((a, b) => b.localeCompare(a))];
  }, [articles]);

  const filteredAndSortedArticles = useMemo(() => {
    const filtered = articles.filter(article => {
      const matchesType = filterMessageType === "All" || article.messageType === filterMessageType;
      const matchesYear = filterYear === "All" || article.year === filterYear;
      const matchesDataset = filterDataset === "All" || article.datasets.includes(filterDataset);
      const matchesSearch = 
        (article.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        article.datasets.some(dataset => dataset.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.annotationModel?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (article.detectionModel?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (article.author?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        article.metrics.some(metric => metric.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCollection = article.collectionId === selectedCollection;
      return matchesType && matchesYear && matchesDataset && matchesSearch && matchesCollection;
    });

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
  }, [articles, filterMessageType, filterYear, filterDataset, searchTerm, sortBy, selectedCollection]);

  const handleAddArticle = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewArticle({
      title: "",
      datasets: "",
      messageType: "",
      size: "",
      annotationModel: "",
      detectionModel: "",
      metrics: "",
      year: "",
      author: "",
      downloadUrl: "",
      collectionId: "1"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewArticle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArticle.title || !newArticle.datasets || !newArticle.messageType) {
      alert("Veuillez remplir les champs obligatoires (Titre, Datasets, Type de données)");
      return;
    }
    
    const datasetsArray = newArticle.datasets.split(',').map(d => d.trim()).filter(d => d);
    const metricsArray = newArticle.metrics.split(',').map(m => m.trim()).filter(m => m);
    
    const articleToAdd: Article = {
      ...newArticle,
      id: Date.now().toString(),
      datasets: datasetsArray,
      metrics: metricsArray,
      citations: {
        apa: `${newArticle.author} (${newArticle.year}). ${newArticle.title}.`,
        iso690: `${newArticle.author}. ${newArticle.title} [en ligne]. ${newArticle.year}.`,
        mla: `${newArticle.author}. "${newArticle.title}". ${newArticle.year}.`
      }
    } as Article;
    
    setArticles(prev => [articleToAdd, ...prev]);
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
          
          <div className="main-filters">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, datasets, or metrics..."
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
                    {MESSAGE_TYPE_MAP[type] || type}
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
          <div className="sidebar">
            <div className="sidebar-header">
              <h2><Folder className="icon" /> Collections</h2>
            </div>
            <div className="collections-list">
              {collectionsWithCounts.map((collection) => (
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
                        <span className="category-badge">
                          {article.datasets.length > 0 
                            ? article.datasets[0] 
                            : "No Dataset"}
                        </span>
                      </div>
                      <p className="author"><Calendar className="icon inline mr-1" /> {article.year}</p>
                    </div>
                    <div className="card-content">
                      <div className="reference-details">
                        <p title={article.messageType}>
                          <MessageSquare className="icon inline mr-1" />
                          <span className="detail-label">Type:</span> {MESSAGE_TYPE_MAP[article.messageType] || article.messageType}
                        </p>
                        {article.datasets.length > 1 && (
                          <p>
                            <Database className="icon inline mr-1" />
                            <span className="detail-label">+{article.datasets.length - 1} more datasets</span>
                          </p>
                        )}
                        <p title={article.detectionModel}>
                          <Brain className="icon inline mr-1" />
                          <span className="detail-label">Detection Model:</span> {article.detectionModel?.length > 40 ? `${article.detectionModel.substring(0, 40)}...` : article.detectionModel || "—"}
                        </p>
                        {article.metrics.length > 0 && (
                          <p title={article.metrics.join(', ')}>
                            <Target className="icon inline mr-1" />
                            <span className="detail-label">Metrics:</span> {article.metrics[0]}{article.metrics.length > 1 ? ` (+${article.metrics.length - 1})` : ''}
                          </p>
                        )}
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
                  <label htmlFor="datasets">Datasets *</label>
                  <textarea
                    id="datasets"
                    name="datasets"
                    value={newArticle.datasets}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dataset1, Dataset2, Dataset3"
                    required
                  />
                  <p className="form-help">Separate multiple datasets with commas</p>
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
                      <option key={type} value={type}>{MESSAGE_TYPE_MAP[type] || type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="collectionId">Collection *</label>
                  <select
                    id="collectionId"
                    name="collectionId"
                    value={newArticle.collectionId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    {COLLECTIONS.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
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
                  <label htmlFor="metrics">Metrics</label>
                  <textarea
                    id="metrics"
                    name="metrics"
                    value={newArticle.metrics}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Accuracy, F1, BLEU"
                  />
                  <p className="form-help">Separate multiple metrics with commas</p>
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
                    {MESSAGE_TYPE_MAP[selectedArticle.messageType] || selectedArticle.messageType}
                  </span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Datasets</h4>
                <ul className="detail-list">
                  {selectedArticle.datasets.map((dataset, index) => (
                    <li key={index}>{dataset}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>Authors</h4>
                <p>{selectedArticle.author || "No authors listed"}</p>
              </div>
              
              <div className="detail-grid">
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
                  <h4>Metrics</h4>
                  <ul className="detail-list">
                    {selectedArticle.metrics.map((metric, index) => (
                      <li key={index}>{metric}</li>
                    ))}
                  </ul>
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