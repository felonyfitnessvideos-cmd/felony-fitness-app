/**
 * @file CalculatorDashboard.jsx
 * @description Unified fitness calculator dashboard for trainers
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @project Felony Fitness
 * 
 * Features:
 * - Four specialized calculators: Strength, Body Comp, Heart Rate, Macros
 * - Save results directly to client profiles in Supabase
 * - Tab-based navigation between calculators
 * - Real-time calculations with input validation
 */

import { Activity, Calculator, Dumbbell, Heart, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { updateClientMetrics } from '../../services/trainerService';
import { supabase } from '../../supabaseClient';
import {
  calculate1RM,
  calculateBodyComp,
  calculateHeartZones,
  calculateMacros,
  getPercentageChart
} from '../../utils/fitnessCalculators';
import './CalculatorDashboard.css';

const CalculatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('strength');
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load saved state from localStorage or use defaults
  const loadSavedState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`calculator_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Strength Calculator State
  const [strengthData, setStrengthData] = useState(() => 
    loadSavedState('strength', { liftName: '', weight: '', reps: '' })
  );
  const [strengthResults, setStrengthResults] = useState(() => 
    loadSavedState('strengthResults', null)
  );

  // Body Comp Calculator State
  const [bodyCompData, setBodyCompData] = useState(() =>
    loadSavedState('bodyComp', { weight: '', height: '', bodyFat: '', gender: 'male', activityLevel: '1.5' })
  );
  const [bodyCompResults, setBodyCompResults] = useState(() =>
    loadSavedState('bodyCompResults', null)
  );

  // Heart Rate Calculator State
  const [heartRateData, setHeartRateData] = useState(() =>
    loadSavedState('heartRate', { age: '', restingHR: '' })
  );
  const [heartRateResults, setHeartRateResults] = useState(() =>
    loadSavedState('heartRateResults', null)
  );

  // Macro Calculator State
  const [macroData, setMacroData] = useState(() =>
    loadSavedState('macro', { lbm: '', tdee: '', goal: '0', proteinRatio: '1.0' })
  );
  const [macroResults, setMacroResults] = useState(() =>
    loadSavedState('macroResults', null)
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calculator_strength', JSON.stringify(strengthData));
  }, [strengthData]);

  useEffect(() => {
    localStorage.setItem('calculator_strengthResults', JSON.stringify(strengthResults));
  }, [strengthResults]);

  useEffect(() => {
    localStorage.setItem('calculator_bodyComp', JSON.stringify(bodyCompData));
  }, [bodyCompData]);

  useEffect(() => {
    localStorage.setItem('calculator_bodyCompResults', JSON.stringify(bodyCompResults));
  }, [bodyCompResults]);

  useEffect(() => {
    localStorage.setItem('calculator_heartRate', JSON.stringify(heartRateData));
  }, [heartRateData]);

  useEffect(() => {
    localStorage.setItem('calculator_heartRateResults', JSON.stringify(heartRateResults));
  }, [heartRateResults]);

  useEffect(() => {
    localStorage.setItem('calculator_macro', JSON.stringify(macroData));
  }, [macroData]);

  useEffect(() => {
    localStorage.setItem('calculator_macroResults', JSON.stringify(macroResults));
  }, [macroResults]);

  // Load trainer clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user?.id) {
        console.log('📊 [CalculatorDashboard] No user ID available');
        return;
      }
      
      console.log('📊 [CalculatorDashboard] Loading clients for user:', user.id);
      
      try {
        // Query trainer_clients directly to get the actual row IDs
        const { data, error } = await supabase
          .from('trainer_clients')
          .select(`
            id,
            client_id,
            full_name,
            email,
            user_profiles!trainer_clients_client_id_fkey (
              first_name,
              last_name,
              email
            )
          `)
          .eq('trainer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [CalculatorDashboard] Error loading clients:', error);
          setClients([]);
          return;
        }

        console.log('📊 [CalculatorDashboard] Raw client data:', data);
        
        // Transform to build display names
        const formattedClients = (data || []).map(row => {
          const profile = row.user_profiles;
          const displayName = profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : row.full_name || row.email || profile?.email || 'Unknown Client';
          
          return {
            id: row.id, // This is the actual trainer_clients.id UUID we need
            client_id: row.client_id,
            full_name: displayName,
            email: row.email || profile?.email || ''
          };
        });
        
        console.log('📊 [CalculatorDashboard] Formatted clients:', formattedClients);
        setClients(formattedClients);
      } catch (error) {
        console.error('❌ [CalculatorDashboard] Error loading clients:', error);
        setClients([]);
      }
    };
    loadClients();
  }, [user]);

  // Load saved metrics when client is selected
  useEffect(() => {
    const loadClientMetrics = async () => {
      if (!selectedClientId) {
        // Don't clear data - let localStorage persistence handle it
        // This allows personal calculator use without selecting a client
        return;
      }

      try {
        const { data, error } = await supabase
          .from('trainer_clients')
          .select('metrics')
          .eq('id', selectedClientId)
          .single();

        if (error) {
          console.error('Error loading client metrics:', error);
          return;
        }

        const metrics = data?.metrics || {};
        console.log('📊 Loaded metrics for client:', metrics);

        // Populate strength data if exists
        if (metrics.strength) {
          setStrengthData({
            liftName: metrics.strength.liftName || '',
            weight: metrics.strength.weight?.toString() || '',
            reps: metrics.strength.reps?.toString() || ''
          });
          setStrengthResults(metrics.strength);
        }

        // Populate body comp data if exists
        if (metrics.bodyComp) {
          // Note: We don't store the input values, just results, so we can't pre-fill inputs
          setBodyCompResults(metrics.bodyComp);
        }

        // Populate heart rate data if exists
        if (metrics.heartRate) {
          // Same - just show results
          setHeartRateResults(metrics.heartRate);
        }

        // Populate macro data if exists
        if (metrics.macros) {
          setMacroResults(metrics.macros);
        }

      } catch (error) {
        console.error('Error loading client metrics:', error);
      }
    };

    loadClientMetrics();
  }, [selectedClientId]);

  // Auto-populate macro calculator with body comp results
  useEffect(() => {
    if (bodyCompResults && activeTab === 'macros') {
      setMacroData(prev => ({
        ...prev,
        lbm: bodyCompResults.lbmLbs.toString(),
        tdee: bodyCompResults.tdee.toString()
      }));
    }
  }, [bodyCompResults, activeTab]);

  // Helper to format last saved timestamp
  const formatLastSaved = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Calculate 1RM
  const handleStrengthCalculate = () => {
    const weight = parseFloat(strengthData.weight);
    const reps = parseInt(strengthData.reps);
    
    if (!weight || !reps) {
      alert('Please enter both weight and reps');
      return;
    }

    const oneRepMax = calculate1RM(weight, reps);
    const percentages = getPercentageChart(oneRepMax);

    setStrengthResults({
      liftName: strengthData.liftName || 'Unknown Lift',
      weight,
      reps,
      oneRepMax,
      percentages
    });
  };

  // Calculate Body Comp
  const handleBodyCompCalculate = () => {
    const weight = parseFloat(bodyCompData.weight);
    const height = parseFloat(bodyCompData.height);
    const bodyFat = bodyCompData.bodyFat ? parseFloat(bodyCompData.bodyFat) : null;
    const activityLevel = parseFloat(bodyCompData.activityLevel);

    if (!weight || !height) {
      alert('Please enter both weight and height');
      return;
    }

    const results = calculateBodyComp(weight, height, bodyCompData.gender, activityLevel, bodyFat);
    setBodyCompResults(results);
  };

  // Calculate Heart Rate Zones
  const handleHeartRateCalculate = () => {
    const age = parseInt(heartRateData.age);
    const restingHR = parseInt(heartRateData.restingHR);

    if (!age || !restingHR) {
      alert('Please enter both age and resting heart rate');
      return;
    }

    const results = calculateHeartZones(age, restingHR);
    setHeartRateResults(results);
  };

  // Calculate Macros
  const handleMacroCalculate = () => {
    const lbm = parseFloat(macroData.lbm);
    const tdee = parseFloat(macroData.tdee);
    const goal = parseInt(macroData.goal);
    const proteinRatio = parseFloat(macroData.proteinRatio);

    if (!lbm || !tdee) {
      alert('Please enter both LBM and TDEE');
      return;
    }

    const results = calculateMacros(tdee, lbm, goal, proteinRatio);
    setMacroResults(results);
  };

  // Generic save handler
  const handleSave = async (category, data) => {
    if (!selectedClientId) {
      alert('Please select a client first');
      return;
    }

    if (!data) {
      alert('Please calculate results first');
      return;
    }

    setLoading(true);
    setSaveStatus('');

    try {
      await updateClientMetrics(selectedClientId, category, data);
      setSaveStatus('✅ Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving metrics:', error);
      setSaveStatus('❌ Error saving data');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-dashboard">
      <header className="calculator-header">
        <div className="header-content">
          <Calculator size={32} />
          <div>
            <h1>Calculator Dashboard</h1>
            <p>Professional fitness calculators with client profile integration</p>
          </div>
        </div>

        {/* Client Selector */}
        <div className="client-selector">
          <select
            id="client-select"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="client-dropdown"
          >
            <option value="">Select Client (optional - to save results)</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.full_name || client.email}
              </option>
            ))}
          </select>
        </div>

        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('✅') ? 'success' : 'error'}`}>
            {saveStatus}
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="calculator-tabs">
        <button
          className={`tab-button ${activeTab === 'strength' ? 'active' : ''}`}
          onClick={() => setActiveTab('strength')}
        >
          <Dumbbell size={20} />
          <span>Strength Commander</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'bodyComp' ? 'active' : ''}`}
          onClick={() => setActiveTab('bodyComp')}
        >
          <Activity size={20} />
          <span>Body Comp Engine</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'heartRate' ? 'active' : ''}`}
          onClick={() => setActiveTab('heartRate')}
        >
          <Heart size={20} />
          <span>Zone Master</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'macros' ? 'active' : ''}`}
          onClick={() => setActiveTab('macros')}
        >
          <Utensils size={20} />
          <span>Macro Architect</span>
        </button>
      </nav>

      {/* Calculator Content */}
      <div className="calculator-content">
        {/* STRENGTH COMMANDER */}
        {activeTab === 'strength' && (
          <div className="calculator-card">
            <div className="card-header">
              <Dumbbell size={24} />
              <h2>Strength Commander (1RM Calculator)</h2>
            </div>
            <p className="card-description">Calculate one-rep max using the Epley formula</p>

            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="lift-name">Lift Name</label>
                <input
                  id="lift-name"
                  type="text"
                  placeholder="e.g., Bench Press"
                  value={strengthData.liftName}
                  onChange={(e) => setStrengthData({ ...strengthData, liftName: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="weight">Weight (lbs)</label>
                <input
                  id="weight"
                  type="number"
                  placeholder="225"
                  value={strengthData.weight}
                  onChange={(e) => setStrengthData({ ...strengthData, weight: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="reps">Reps</label>
                <input
                  id="reps"
                  type="number"
                  placeholder="5"
                  value={strengthData.reps}
                  onChange={(e) => setStrengthData({ ...strengthData, reps: e.target.value })}
                />
              </div>
            </div>

            <button className="calculate-button" onClick={handleStrengthCalculate}>
              Calculate 1RM
            </button>

            {strengthResults && (
              <div className="results-section">
                <div className="results-header">
                  <h3>Results</h3>
                  {strengthResults.lastUpdated && (
                    <span className="last-saved">Last saved: {formatLastSaved(strengthResults.lastUpdated)}</span>
                  )}
                </div>
                <div className="result-highlight">
                  <span className="result-label">Estimated 1RM:</span>
                  <span className="result-value">{strengthResults.oneRepMax} lbs</span>
                </div>

                <h4>Training Zones & Percentages</h4>
                <table className="percentage-table">
                  <thead>
                    <tr>
                      <th>%</th>
                      <th>Weight</th>
                      <th>Reps</th>
                      <th>Training Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strengthResults.percentages.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.label}</strong></td>
                        <td>{row.weight} lbs</td>
                        <td>{row.reps}</td>
                        <td className="zone-label">{row.zone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  className="save-button"
                  onClick={() => handleSave('strength', strengthResults)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save to Client Profile'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* BODY COMP ENGINE */}
        {activeTab === 'bodyComp' && (
          <div className="calculator-card">
            <div className="card-header">
              <Activity size={24} />
              <h2>Body Comp Engine (LBM & TDEE)</h2>
            </div>
            <p className="card-description">Calculate lean body mass (Boer) and TDEE (Katch-McArdle)</p>

            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="body-weight">Weight (lbs)</label>
                <input
                  id="body-weight"
                  type="number"
                  placeholder="180"
                  value={bodyCompData.weight}
                  onChange={(e) => setBodyCompData({ ...bodyCompData, weight: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="body-height">Height (inches)</label>
                <input
                  id="body-height"
                  type="number"
                  placeholder="72"
                  value={bodyCompData.height}
                  onChange={(e) => setBodyCompData({ ...bodyCompData, height: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="body-fat">
                  Body Fat % <span style={{ fontSize: '0.85em', fontWeight: 'normal', color: '#888' }}>(optional)</span>
                </label>
                <input
                  id="body-fat"
                  type="number"
                  placeholder="15"
                  min="5"
                  max="50"
                  step="0.1"
                  value={bodyCompData.bodyFat}
                  onChange={(e) => setBodyCompData({ ...bodyCompData, bodyFat: e.target.value })}
                />
                <small style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                  {bodyCompData.bodyFat ? 'Using actual body fat % for precise LBM' : 'Will estimate LBM using Boer Formula'}
                </small>
              </div>
              <div className="input-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={bodyCompData.gender}
                  onChange={(e) => setBodyCompData({ ...bodyCompData, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="activity-level">Activity Level</label>
                <select
                  id="activity-level"
                  value={bodyCompData.activityLevel}
                  onChange={(e) => setBodyCompData({ ...bodyCompData, activityLevel: e.target.value })}
                >
                  <option value="1.2">Sedentary (1.2x)</option>
                  <option value="1.375">Light Activity (1.375x)</option>
                  <option value="1.5">Moderate (1.5x)</option>
                  <option value="1.725">Very Active (1.725x)</option>
                  <option value="1.9">Extreme (1.9x)</option>
                </select>
              </div>
            </div>

            <button className="calculate-button" onClick={handleBodyCompCalculate}>
              Calculate Body Composition
            </button>

            {bodyCompResults && (
              <div className="results-section">
                <div className="results-header">
                  <h3>Results</h3>
                  {bodyCompResults.lastUpdated && (
                    <span className="last-saved">Last saved: {formatLastSaved(bodyCompResults.lastUpdated)}</span>
                  )}
                </div>
                {bodyCompResults.method && (
                  <div style={{ 
                    marginBottom: '12px', 
                    padding: '8px 12px', 
                    background: 'rgba(50, 50, 50, 0.5)',
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    color: 'var(--text-color)'
                  }}>
                    <strong>{bodyCompResults.method === 'actual' ? '✓ Actual' : 'ⓘ Estimated'}:</strong>{' '}
                    {bodyCompResults.method === 'actual' 
                      ? 'Using your actual body fat % for precise lean mass calculation'
                      : 'LBM estimated using Boer Formula (add body fat % for more accuracy)'}
                  </div>
                )}
                <div className="results-grid">
                  <div className="result-highlight">
                    <span className="result-label">Lean Body Mass:</span>
                    <span className="result-value">{bodyCompResults.lbmLbs} lbs</span>
                  </div>
                  <div className="result-highlight">
                    <span className="result-label">BMR:</span>
                    <span className="result-value">{bodyCompResults.bmr} cal</span>
                  </div>
                  <div className="result-highlight">
                    <span className="result-label">TDEE:</span>
                    <span className="result-value">{bodyCompResults.tdee} cal</span>
                  </div>
                </div>

                <button
                  className="save-button"
                  onClick={() => handleSave('bodyComp', bodyCompResults)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save to Client Profile'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ZONE MASTER */}
        {activeTab === 'heartRate' && (
          <div className="calculator-card">
            <div className="card-header">
              <Heart size={24} />
              <h2>Zone Master (Heart Rate Zones)</h2>
            </div>
            <p className="card-description">Calculate training zones using Karvonen formula</p>

            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="age">Age (years)</label>
                <input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={heartRateData.age}
                  onChange={(e) => setHeartRateData({ ...heartRateData, age: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="resting-hr">Resting HR (bpm)</label>
                <input
                  id="resting-hr"
                  type="number"
                  placeholder="60"
                  value={heartRateData.restingHR}
                  onChange={(e) => setHeartRateData({ ...heartRateData, restingHR: e.target.value })}
                />
              </div>
            </div>

            <button className="calculate-button" onClick={handleHeartRateCalculate}>
              Calculate Heart Rate Zones
            </button>

            {heartRateResults && (
              <div className="results-section">
                <div className="results-header">
                  <h3>Results</h3>
                  {heartRateResults.lastUpdated && (
                    <span className="last-saved">Last saved: {formatLastSaved(heartRateResults.lastUpdated)}</span>
                  )}
                </div>
                <div className="result-highlight">
                  <span className="result-label">Max Heart Rate:</span>
                  <span className="result-value">{heartRateResults.maxHR} bpm</span>
                </div>

                <h4>Training Zones</h4>
                <table className="zones-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Range (bpm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heartRateResults.zones.map((zone, idx) => (
                      <tr key={idx}>
                        <td>{zone.name}</td>
                        <td>{zone.min} - {zone.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  className="save-button"
                  onClick={() => handleSave('heartRate', heartRateResults)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save to Client Profile'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MACRO ARCHITECT */}
        {activeTab === 'macros' && (
          <div className="calculator-card">
            <div className="card-header">
              <Utensils size={24} />
              <h2>Macro Architect (Nutrition Split)</h2>
            </div>
            <p className="card-description">Calculate macro split with residual method (Protein locked to LBM, Fat at 30%, Carbs fill remainder)</p>

            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="lbm">Lean Body Mass (lbs)</label>
                <input
                  id="lbm"
                  type="number"
                  placeholder="150"
                  value={macroData.lbm}
                  onChange={(e) => setMacroData({ ...macroData, lbm: e.target.value })}
                />
                {bodyCompResults && (
                  <small className="input-hint">Auto-filled from Body Comp: {bodyCompResults.lbmLbs} lbs</small>
                )}
              </div>
              <div className="input-group">
                <label htmlFor="tdee-macro">TDEE (calories)</label>
                <input
                  id="tdee-macro"
                  type="number"
                  placeholder="2500"
                  value={macroData.tdee}
                  onChange={(e) => setMacroData({ ...macroData, tdee: e.target.value })}
                />
                {bodyCompResults && (
                  <small className="input-hint">Auto-filled from Body Comp: {bodyCompResults.tdee} cal</small>
                )}
              </div>
              <div className="input-group">
                <label htmlFor="goal">Goal Adjustment</label>
                <select
                  id="goal"
                  value={macroData.goal}
                  onChange={(e) => setMacroData({ ...macroData, goal: e.target.value })}
                >
                  <option value="-500">Cut (-500 cal)</option>
                  <option value="-250">Mini Cut (-250 cal)</option>
                  <option value="0">Maintain (0 cal)</option>
                  <option value="250">Mini Bulk (+250 cal)</option>
                  <option value="500">Bulk (+500 cal)</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="protein-ratio">Protein Ratio (g/lb LBM)</label>
                <input
                  id="protein-ratio"
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={macroData.proteinRatio}
                  onChange={(e) => setMacroData({ ...macroData, proteinRatio: e.target.value })}
                />
              </div>
            </div>

            <button className="calculate-button" onClick={handleMacroCalculate}>
              Calculate Macros
            </button>

            {macroResults && (
              <div className="results-section">
                <div className="results-header">
                  <h3>Results</h3>
                  {macroResults.lastUpdated && (
                    <span className="last-saved">Last saved: {formatLastSaved(macroResults.lastUpdated)}</span>
                  )}
                </div>
                <div className="result-highlight macro-total">
                  <span className="result-label">Total Calories:</span>
                  <span className="result-value">{macroResults.totalCals} cal</span>
                </div>

                <div className="macro-breakdown">
                  <div className="macro-card protein">
                    <h4>Protein</h4>
                    <div className="macro-value">{macroResults.protein.g}g</div>
                    <div className="macro-details">
                      {macroResults.protein.cals} cal ({macroResults.protein.pct}%)
                    </div>
                  </div>
                  <div className="macro-card fat">
                    <h4>Fat</h4>
                    <div className="macro-value">{macroResults.fat.g}g</div>
                    <div className="macro-details">
                      {macroResults.fat.cals} cal ({macroResults.fat.pct}%)
                    </div>
                  </div>
                  <div className="macro-card carbs">
                    <h4>Carbs</h4>
                    <div className="macro-value">{macroResults.carbs.g}g</div>
                    <div className="macro-details">
                      {macroResults.carbs.cals} cal ({macroResults.carbs.pct}%)
                    </div>
                  </div>
                </div>

                <button
                  className="save-button"
                  onClick={() => handleSave('macros', macroResults)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save to Client Profile'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorDashboard;
