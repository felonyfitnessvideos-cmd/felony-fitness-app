/**
 * @file TrainerPrograms.jsx
 * @description Training program templates and building blocks for trainers
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Copy, Edit, Trash2, Users } from 'lucide-react';

const TrainerPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Mock program templates data
    setPrograms([
      {
        id: 1,
        name: "Beginner Strength Foundation",
        category: "strength",
        duration: "8 weeks",
        difficulty: "beginner",
        assignedClients: 3,
        exercises: 12,
        description: "A comprehensive strength training program for beginners focusing on compound movements and proper form."
      },
      {
        id: 2,
        name: "HIIT Fat Loss Circuit",
        category: "cardio",
        duration: "6 weeks", 
        difficulty: "intermediate",
        assignedClients: 7,
        exercises: 18,
        description: "High-intensity interval training program designed for maximum fat loss and conditioning."
      },
      {
        id: 3,
        name: "Powerlifting Prep",
        category: "strength",
        duration: "12 weeks",
        difficulty: "advanced",
        assignedClients: 2,
        exercises: 8,
        description: "Competition preparation program focusing on squat, bench press, and deadlift."
      }
    ]);
  }, []);

  const categories = [
    { value: 'all', label: 'All Programs' },
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio & Conditioning' },
    { value: 'mobility', label: 'Mobility & Recovery' },
    { value: 'sport', label: 'Sport Specific' }
  ];

  const filteredPrograms = selectedCategory === 'all' 
    ? programs 
    : programs.filter(program => program.category === selectedCategory);

  return (
    <div className="trainer-programs-container">
      <div className="programs-header">
        <h2><BarChart3 size={24} />Training Programs</h2>
        <div className="programs-actions">
          <button className="create-program-button">
            <Plus size={18} />
            Create New Program
          </button>
        </div>
      </div>

      <div className="programs-filters">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.value}
              className={`category-tab ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="programs-grid">
        {filteredPrograms.map(program => (
          <div key={program.id} className="program-card">
            <div className="program-header">
              <h3>{program.name}</h3>
              <div className="program-actions">
                <button className="action-btn" title="Edit Program">
                  <Edit size={16} />
                </button>
                <button className="action-btn" title="Duplicate Program">
                  <Copy size={16} />
                </button>
                <button className="action-btn danger" title="Delete Program">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="program-details">
              <div className="program-meta">
                <span className={`difficulty-badge ${program.difficulty}`}>
                  {program.difficulty}
                </span>
                <span className="duration">{program.duration}</span>
              </div>

              <p className="program-description">{program.description}</p>

              <div className="program-stats">
                <div className="stat">
                  <span className="stat-value">{program.exercises}</span>
                  <span className="stat-label">Exercises</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{program.assignedClients}</span>
                  <span className="stat-label">Clients Assigned</span>
                </div>
              </div>
            </div>

            <div className="program-footer">
              <button className="assign-button">
                <Users size={16} />
                Assign to Client
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="programs-help">
        <h3>Program Building Blocks</h3>
        <p>Create custom training programs using our exercise library and pro routines. 
           Assign programs to clients and track their progress automatically.</p>
        <ul>
          <li>Choose from 500+ exercises</li>
          <li>Use proven pro routine templates</li>
          <li>Set progressive overload schemes</li>
          <li>Track client compliance and results</li>
        </ul>
      </div>
    </div>
  );
};

export default TrainerPrograms;
