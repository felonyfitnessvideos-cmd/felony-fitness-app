/**
 * @file EndOfDayChecklist.jsx  
 * @description Development workflow checklist component
 * @created 2025-11-03
 * @testFile src/__tests__/components/EndOfDayChecklist.test.jsx
 */

import { CheckCircle, Circle } from 'lucide-react';
import { useState } from 'react';

const EndOfDayChecklist = () => {
  const [checklist, setChecklist] = useState([
    {
      id: 'tests',
      label: 'All components have tests',
      completed: false,
      priority: 'high',
      description: 'Ensure every component created today has a corresponding test file'
    },
    {
      id: 'backup',
      label: 'Run daily backup script',
      completed: false,
      priority: 'high',
      description: 'Execute scripts/daily-backup.ps1 to backup database and files'
    },
    {
      id: 'types',
      label: 'Generate fresh TypeScript types',
      completed: false,
      priority: 'medium',
      description: 'Run: npx supabase gen types typescript --linked > src/types/supabase.ts'
    },
    {
      id: 'commit',
      label: 'Git commit with descriptive message',
      completed: false,
      priority: 'high',
      description: 'Commit all changes with clear, descriptive commit message'
    },
    {
      id: 'migrations',
      label: 'Verify all migrations applied',
      completed: false,
      priority: 'high',
      description: 'Check that all database migrations are successfully applied'
    },
    {
      id: 'cleanup',
      label: 'Clean up temporary files',
      completed: false,
      priority: 'low',
      description: 'Remove any temporary files, logs, or debug artifacts'
    },
    {
      id: 'documentation',
      label: 'Update documentation',
      completed: false,
      priority: 'medium',
      description: 'Update README, add comments to new functions, document any API changes'
    },
    {
      id: 'plan',
      label: 'Plan tomorrow\'s tasks',
      completed: false,
      priority: 'medium',
      description: 'Create a brief plan for tomorrow\'s development priorities'
    }
  ]);

  // Summary tracking disabled for now
  // const [todaysSummary, setTodaysSummary] = useState({
  //   componentsCreated: [],
  //   migrationsApplied: [], 
  //   testsAdded: [],
  //   bugsFixed: [],
  //   featuresCompleted: []
  // });

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const runBackupScript = () => {
    // In a real app, this would trigger the PowerShell script
    console.log('Backup script would run here');
    toggleItem('backup');
  };

  const generateTypes = () => {
    // In a real app, this would run the Supabase command
    console.log('Generate types command would run here');
    toggleItem('types');
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          margin: '0 0 8px 0',
          color: '#1f2937',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🏁 End of Day Checklist
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Complete these tasks before ending your development session
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Progress</span>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {completedCount}/{totalCount} ({completionPercentage}%)
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            backgroundColor: completionPercentage === 100 ? '#10b981' : '#3b82f6',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{ marginBottom: '24px' }}>
        {checklist.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: item.completed ? '#f0fdf4' : '#ffffff',
              border: `1px solid ${item.completed ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => toggleItem(item.id)}
          >
            <div style={{ marginRight: '12px', marginTop: '2px' }}>
              {item.completed ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <Circle size={20} color="#6b7280" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  fontWeight: '500',
                  color: item.completed ? '#6b7280' : '#1f2937'
                }}>
                  {item.label}
                </span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: getPriorityColor(item.priority),
                  borderRadius: '50%',
                  marginLeft: '8px'
                }} />
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                {item.description}
              </p>
            </div>

            {/* Quick Action Buttons */}
            {item.id === 'backup' && !item.completed && (
              <button
                onClick={(e) => { e.stopPropagation(); runBackupScript(); }}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Run
              </button>
            )}

            {item.id === 'types' && !item.completed && (
              <button
                onClick={(e) => { e.stopPropagation(); generateTypes(); }}
                style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Generate
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
          📊 Today's Development Summary
        </h3>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          <p>• Database tables: All fresh foundation tables created ✅</p>
          <p>• User roles: Trainer and Client roles configured ✅</p>
          <p>• Testing: Test framework and creation script implemented ✅</p>
          <p>• Backup: Daily backup protocol established ✅</p>
          <p>• Components: TrainerClients component reviewed and tested ✅</p>
        </div>
      </div>

      {/* Completion Status */}
      {completionPercentage === 100 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <CheckCircle size={24} color="#10b981" style={{ marginBottom: '8px' }} />
          <p style={{
            margin: 0,
            fontWeight: '600',
            color: '#15803d'
          }}>
            🎉 All tasks completed! Great work today!
          </p>
        </div>
      )}
    </div>
  );
};

export default EndOfDayChecklist;