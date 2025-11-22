/**
 * @file TrainerResources.jsx
 * @description Resource library for trainer materials and client handouts
 * @project Felony Fitness
 * 
 * This component provides access to training resources stored in Supabase Storage:
 * - Workout templates and guides
 * - Nutrition plans and meal prep guides
 * - Client handouts and educational materials
 * - Form templates and assessments
 * 
 * Files are dynamically loaded from the 'trainer-resources' storage bucket
 * and can be previewed, downloaded, or shared with clients.
 */

import {
    Download,
    Eye,
    FileText,
    Folder,
    Search,
    X
} from 'lucide-react';
import { useState } from 'react';
import './TrainerResources.css';

/**
 * Static list of training manual chapters
 * 
 * TODO: Refactor to load dynamically from trainer-resources storage bucket
 * This would allow trainers to upload new resources via the bucket policies
 * without requiring code changes. Implementation approach:
 * 1. Import useEffect and supabase: import { useEffect, useState } from 'react';
 * 2. Import: import { supabase } from '../../supabaseClient';
 * 3. Use supabase.storage.from('trainer-resources').list() in useEffect
 * 4. Transform file list to match current resource shape
 * 5. Keep this array as fallback if bucket loading fails
 * 6. Add loading state and error handling
 */
const TRAINING_RESOURCES = [
    {
        id: 1,
        name: 'Chapter 1',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter1-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 2,
        name: 'Chapter 2',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter2-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 3,
        name: 'Chapter 3',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter3-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 4,
        name: 'Chapter 4',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter4-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 5,
        name: 'Chapter 5',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter5-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 6,
        name: 'Chapter 6',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter6-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 7,
        name: 'Chapter 7',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter7-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 8,
        name: 'Chapter 8',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter8-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 9,
        name: 'Chapter 9',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter9-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 10,
        name: 'Chapter 10',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter10-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 11,
        name: 'Chapter 11',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter11-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 12,
        name: 'Chapter 12',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter12-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 13,
        name: 'Chapter 13',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter13-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 14,
        name: 'Chapter 14',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter14-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 15,
        name: 'Chapter 15',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter15-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 16,
        name: 'Chapter 16',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter16-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 17,
        name: 'Chapter 17',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter17-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 18,
        name: 'Chapter 18',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter18-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 19,
        name: 'Chapter 19',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Chapter19-compressed.pdf',
        size: 0,
        type: 'pdf'
    },
    {
        id: 20,
        name: 'Glossary',
        url: 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/trainer-manual-chapters/Glossary-compressed.pdf',
        size: 0,
        type: 'pdf'
    }
];

/**
 * TrainerResources component for managing training materials
 * 
 * @component
 * @returns {JSX.Element} Resource library interface with file listing and preview
 * 
 * @example
 * <TrainerResources />
 */
const TrainerResources = () => {
    /** @type {[string, Function]} Search/filter query */
    const [searchQuery, setSearchQuery] = useState('');
    
    /** @type {[string, Function]} Active tab selection */
    const [activeTab, setActiveTab] = useState('resources');

    /**
     * Handle download by fetching the file and creating a blob
     * This forces a download instead of opening in the browser
     * 
     * @param {string} url - URL of the file to download
     * @param {string} fileName - Name of the file
     */
    const handleDownload = async (url, fileName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up the blob URL
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening in new tab if download fails
            window.open(url, '_blank');
        }
    };

    /**
     * Get file icon based on file type
     * 
     * @param {string} type - File type
     * @returns {JSX.Element} Icon component for the file type
     */
    const getFileIcon = (type) => {
        if (type === 'pdf') {
            return <FileText size={18} className="file-icon pdf" />;
        }
        return <FileText size={18} className="file-icon default" />;
    };

    // Filter resources based on search query
    const filteredResources = TRAINING_RESOURCES.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="trainer-resources-container">
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <Folder size={18} />
                    <span>Resources</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('forms')}
                >
                    <FileText size={18} />
                    <span>Forms</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'misc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('misc')}
                >
                    <Folder size={18} />
                    <span>Misc</span>
                </button>
            </div>

            {activeTab === 'resources' && (
                <div className="resources-header">
                    <div className="header-actions">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="clear-search">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'forms' && (
                <div className="tab-content-wrapper">
                    <div className="forms-section">
                        <div className="empty-state">
                            <FileText size={64} />
                            <h3>Forms Section</h3>
                            <p>Client intake forms, assessment templates, and waivers will be available here.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'misc' && (
                <div className="tab-content-wrapper">
                    <div className="misc-section">
                        <div className="empty-state">
                            <Folder size={64} />
                            <h3>Miscellaneous Resources</h3>
                            <p>Additional training materials and resources will be available here.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="tab-content-wrapper">
                    {filteredResources.length === 0 && (
                        <div className="empty-state">
                            <Folder size={64} />
                            <h3>No Resources Found</h3>
                            <p>No files match your search. Try a different query.</p>
                        </div>
                    )}

                    {filteredResources.length > 0 && (
                        <div className="resources-grid">
                            {filteredResources.map((file) => (
                                <div key={file.id} className={`resource-card ${file.placeholder ? 'placeholder' : ''}`}>
                                    <div className="card-header">
                                        {getFileIcon(file.type)}
                                        <h3>{file.name}</h3>
                                    </div>

                                    {file.placeholder && (
                                        <div className="placeholder-badge">Coming Soon</div>
                                    )}

                                    <div className="card-actions">
                                        <button
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="action-btn view-btn"
                                            title="View file"
                                            disabled={file.placeholder}
                                        >
                                            <Eye size={16} />
                                            <span>View</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownload(file.url, `${file.name}.pdf`)}
                                            className="action-btn download-btn"
                                            title="Download file"
                                            disabled={file.placeholder}
                                        >
                                            <Download size={16} />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainerResources;
