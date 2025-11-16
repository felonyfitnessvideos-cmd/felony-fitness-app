/**
 * @file BugReportMessaging.jsx
 * @description Bug reporting component for beta users and admin response system
 * @author Felony Fitness Development Team
 * 
 * FEATURES:
 * - Beta users can submit bug reports with priority/category selection
 * - Admins can view all bug reports from all users
 * - Thread-based conversation system (bug_report_replies)
 * - Status management (open → in_progress → resolved/closed/wont_fix)
 * - Priority levels (low/medium/high/critical)
 * - Categories (bug/feature_request/ui_ux/performance/other)
 * - Automatic browser info capture
 * - Real-time updates via Supabase subscriptions
 */

import { AlertCircle, Bug, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { supabase } from '../supabaseClient.js';
import {
    BUG_CATEGORY,
    BUG_PRIORITY,
    BUG_STATUS,
    getAllBugReports,
    getBugReports,
    handleBugReportError,
    replyToBugReport,
    submitBugReport,
    subscribeToBugReports,
    updateBugReportPriority,
    updateBugReportStatus
} from '../utils/bugReportingUtils';

/**
 * Bug Report Messaging Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {boolean} props.isBeta - Whether current user is beta tester
 * 
 * @returns {JSX.Element|null} Bug reporting interface or null if unauthorized
 */
const BugReportMessaging = ({ isAdmin = false, isBeta = false }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [bugReports, setBugReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [newCategory, setNewCategory] = useState('bug');
    const [newPriority, setNewPriority] = useState('medium');
    const [sendLoading, setSendLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showNewReportForm, setShowNewReportForm] = useState(false);
    const [_currentUserName, setCurrentUserName] = useState(''); // Prefix with _ to indicate unused
    const messagesEndRef = useRef(null);

    // Load user profile
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('first_name, last_name, email')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                const fullName = `${data?.first_name || ''} ${data?.last_name || ''}`.trim();
                setCurrentUserName(fullName || user?.email || 'You');
            } catch (error) {
                console.error('Error loading user profile:', error);
                setCurrentUserName(user?.email || 'You');
            }
        };

        loadUserProfile();
    }, [user]);

    // Load bug reports
    const loadBugReports = useCallback(async () => {
        try {
            setLoading(true);
            const reports = isAdmin ? await getAllBugReports() : await getBugReports();
            setBugReports(reports || []);

            // Auto-select first report if available
            if (reports.length > 0 && !selectedReport) {
                setSelectedReport(reports[0]);
            }
        } catch (error) {
            console.error('Error loading bug reports:', error);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, selectedReport]);

    // Load bug reports on mount
    useEffect(() => {
        if (user && (isAdmin || isBeta)) {
            loadBugReports();
        }
    }, [user, isAdmin, isBeta, loadBugReports]);

    // Subscribe to real-time updates
    useEffect(() => {
        if (!user || (!isAdmin && !isBeta)) return;

        let subscription = null;

        const setupSubscription = async () => {
            subscription = await subscribeToBugReports(() => {
                loadBugReports();
            });
        };

        setupSubscription();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [user, isAdmin, isBeta, loadBugReports]);

    // Set default message for admin when selecting a new report
    useEffect(() => {
        if (isAdmin && selectedReport) {
            // Check if there are any admin replies already
            const hasAdminReply = selectedReport.replies?.some(reply => reply.is_admin_reply);
            
            // Only set default message if there are no admin replies yet
            if (!hasAdminReply && !newMessage) {
                setNewMessage("Thank you for your report. Our team will look into the issue and inform you when we have it resolved.");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, selectedReport]);

    // Don't render if user is neither admin nor beta (after all hooks)
    if (!isAdmin && !isBeta) {
        return null;
    }

    // Submit new bug report
    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sendLoading) return;

        setSendLoading(true);
        try {
            await submitBugReport({
                message: newMessage.trim(),
                category: newCategory,
                priority: newPriority
            });

            // Clear form
            setNewMessage('');
            setNewCategory('bug');
            setNewPriority('medium');
            setShowNewReportForm(false);

            // Reload reports
            await loadBugReports();

            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Error submitting bug report:', error);
            alert(`Failed to submit bug report: ${handleBugReportError(error)}`);
        } finally {
            setSendLoading(false);
        }
    };

    // Reply to bug report
    const handleReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedReport || sendLoading) return;

        setSendLoading(true);
        try {
            await replyToBugReport(selectedReport.id, newMessage.trim());

            // Clear input
            setNewMessage('');

            // Reload reports to show new reply
            await loadBugReports();

            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Error replying to bug report:', error);
            alert(`Failed to send reply: ${handleBugReportError(error)}`);
        } finally {
            setSendLoading(false);
        }
    };

    // Update bug status (admin only)
    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await updateBugReportStatus(reportId, newStatus);
            await loadBugReports();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${handleBugReportError(error)}`);
        }
    };

    // Update bug priority (admin only)
    const handlePriorityChange = async (reportId, newPriority) => {
        try {
            await updateBugReportPriority(reportId, newPriority);
            await loadBugReports();
        } catch (error) {
            console.error('Error updating priority:', error);
            alert(`Failed to update priority: ${handleBugReportError(error)}`);
        }
    };

    // Get initials from a name
    const getInitials = (name) => {
        if (!name) return '?';
        
        let nameToProcess = name.trim();
        
        if (nameToProcess.includes('@')) {
            const localPart = nameToProcess.split('@')[0];
            nameToProcess = localPart.replace(/[._-]/g, ' ');
        }
        
        const names = nameToProcess.split(' ').filter(n => n.length > 0);
        
        if (names.length === 0) return '?';
        if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
        
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case BUG_STATUS.OPEN: return '#f97316'; // orange
            case BUG_STATUS.IN_PROGRESS: return '#3b82f6'; // blue
            case BUG_STATUS.RESOLVED: return '#22c55e'; // green
            case BUG_STATUS.CLOSED: return '#6b7280'; // gray
            case BUG_STATUS.WONT_FIX: return '#ef4444'; // red
            default: return '#9ca3af';
        }
    };

    // Get priority badge color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case BUG_PRIORITY.CRITICAL: return '#dc2626'; // red
            case BUG_PRIORITY.HIGH: return '#f97316'; // orange
            case BUG_PRIORITY.MEDIUM: return '#fbbf24'; // yellow
            case BUG_PRIORITY.LOW: return '#22c55e'; // green
            default: return '#9ca3af';
        }
    };

    // Format status text
    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                Loading bug reports...
            </div>
        );
    }

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: isCollapsed ? 'auto' : '500px',
            transition: 'height 0.3s ease'
        }}>
            {/* Header */}
            <div 
                style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '1rem',
                    borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0,
                    cursor: 'pointer'
                }}
                onClick={() => {
                    const newCollapsedState = !isCollapsed;
                    setIsCollapsed(newCollapsedState);
                    if (!newCollapsedState) {
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 350);
                    }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            {isAdmin ? <AlertCircle size={20} style={{ color: '#ef4444' }} /> : <Bug size={20} style={{ color: '#ef4444' }} />}
                            {bugReports.filter(r => r.status === 'open').length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    {bugReports.filter(r => r.status === 'open').length}
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: 0, color: 'white' }}>
                            {isAdmin ? 'Bug Reports (Admin)' : 'Report a Bug'}
                        </h3>
                    </div>
                    {isCollapsed ? <ChevronDown size={20} style={{ color: '#ef4444' }} /> : <ChevronUp size={20} style={{ color: '#ef4444' }} />}
                </div>
            </div>

            {/* Content - Only show when expanded */}
            {!isCollapsed && (
                <>
                    {/* Report List / Selector */}
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.2)'
                    }}>
                        {bugReports.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#888' }}>
                                {isBeta && !isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowNewReportForm(true);
                                        }}
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Bug size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Submit Your First Bug Report
                                    </button>
                                )}
                                {isAdmin && <p>No bug reports yet.</p>}
                            </div>
                        ) : (
                            <>
                                {isBeta && !isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowNewReportForm(!showNewReportForm);
                                        }}
                                        style={{
                                            background: showNewReportForm ? 'rgba(239, 68, 68, 0.2)' : '#ef4444',
                                            color: 'white',
                                            border: showNewReportForm ? '1px solid #ef4444' : 'none',
                                            borderRadius: '6px',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem',
                                            width: '100%'
                                        }}
                                    >
                                        <Bug size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {showNewReportForm ? 'Cancel' : 'New Bug Report'}
                                    </button>
                                )}
                                
                                <select
                                    value={selectedReport?.id || ''}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        const report = bugReports.find(r => r.id === e.target.value);
                                        setSelectedReport(report);
                                        setShowNewReportForm(false);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        width: '100%'
                                    }}
                                >
                                    {bugReports.map(report => (
                                        <option key={report.id} value={report.id} style={{ background: '#1a1a1a' }}>
                                            [{formatStatus(report.status)}] {report.message_text.substring(0, 50)}...
                                            {isAdmin && report.reporter && ` - ${report.reporter.first_name} ${report.reporter.last_name}`}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>

                    {/* New Bug Report Form */}
                    {showNewReportForm && (
                        <form onSubmit={handleSubmitReport} style={{
                            padding: '1rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(239, 68, 68, 0.05)'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    Category
                                </label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        width: '100%'
                                    }}
                                >
                                    <option value="bug" style={{ background: '#1a1a1a' }}>Bug</option>
                                    <option value="feature_request" style={{ background: '#1a1a1a' }}>Feature Request</option>
                                    <option value="ui_ux" style={{ background: '#1a1a1a' }}>UI/UX Issue</option>
                                    <option value="performance" style={{ background: '#1a1a1a' }}>Performance</option>
                                    <option value="other" style={{ background: '#1a1a1a' }}>Other</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    Priority
                                </label>
                                <select
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        width: '100%'
                                    }}
                                >
                                    <option value="low" style={{ background: '#1a1a1a' }}>Low</option>
                                    <option value="medium" style={{ background: '#1a1a1a' }}>Medium</option>
                                    <option value="high" style={{ background: '#1a1a1a' }}>High</option>
                                    <option value="critical" style={{ background: '#1a1a1a' }}>Critical</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', color: '#fff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    Description
                                </label>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Describe the bug or issue..."
                                    disabled={sendLoading}
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sendLoading || !newMessage.trim()}
                                style={{
                                    width: '100%',
                                    background: sendLoading || !newMessage.trim() ? 'rgba(239, 68, 68, 0.3)' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.5rem 1rem',
                                    cursor: sendLoading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}
                            >
                                {sendLoading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    )}

                    {/* Selected Report Details & Thread */}
                    {selectedReport && !showNewReportForm && (
                        <>
                            {/* Report Info */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(0, 0, 0, 0.3)'
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        background: getStatusColor(selectedReport.status),
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {formatStatus(selectedReport.status)}
                                    </span>
                                    <span style={{
                                        background: getPriorityColor(selectedReport.priority),
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {selectedReport.priority.toUpperCase()}
                                    </span>
                                    <span style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {selectedReport.category.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <p style={{ color: 'white', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                                    {selectedReport.message_text}
                                </p>

                                {isAdmin && selectedReport.reporter && (
                                    <p style={{ color: '#888', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
                                        Reported by: {selectedReport.reporter.first_name} {selectedReport.reporter.last_name} ({selectedReport.reporter.email})
                                    </p>
                                )}

                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <select
                                            value={selectedReport.status}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleStatusChange(selectedReport.id, e.target.value);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '6px',
                                                padding: '0.25rem 0.5rem',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            <option value="open" style={{ background: '#1a1a1a' }}>Open</option>
                                            <option value="in_progress" style={{ background: '#1a1a1a' }}>In Progress</option>
                                            <option value="resolved" style={{ background: '#1a1a1a' }}>Resolved</option>
                                            <option value="closed" style={{ background: '#1a1a1a' }}>Closed</option>
                                            <option value="wont_fix" style={{ background: '#1a1a1a' }}>Won't Fix</option>
                                        </select>

                                        <select
                                            value={selectedReport.priority}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handlePriorityChange(selectedReport.id, e.target.value);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '6px',
                                                padding: '0.25rem 0.5rem',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            <option value="low" style={{ background: '#1a1a1a' }}>Low</option>
                                            <option value="medium" style={{ background: '#1a1a1a' }}>Medium</option>
                                            <option value="high" style={{ background: '#1a1a1a' }}>High</option>
                                            <option value="critical" style={{ background: '#1a1a1a' }}>Critical</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Replies Thread */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                background: 'var(--background-color)',
                                minHeight: 0
                            }}>
                                {selectedReport.replies && selectedReport.replies.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>
                                        <p>No replies yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        {selectedReport.replies && selectedReport.replies.map((reply) => {
                                            const isDark = theme === 'dark';
                                            const userName = reply.user ? `${reply.user.first_name} ${reply.user.last_name}`.trim() : 'Unknown';
                                            
                                            return (
                                                <div
                                                    key={reply.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        gap: '8px',
                                                        flexDirection: reply.is_admin_reply ? 'row' : 'row-reverse'
                                                    }}
                                                >
                                                    {/* Avatar */}
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: reply.is_admin_reply ? '#ef4444' : (isDark ? '#636366' : '#c7c7cc'),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        flexShrink: 0
                                                    }}>
                                                        {getInitials(userName)}
                                                    </div>

                                                    {/* Message bubble */}
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        background: reply.is_admin_reply ? '#ef4444' : (isDark ? '#3a3a3c' : '#e5e5ea'),
                                                        color: reply.is_admin_reply ? 'white' : (isDark ? '#ffffff' : '#000000'),
                                                        padding: '12px 16px',
                                                        borderRadius: '20px',
                                                        borderBottomRightRadius: reply.is_admin_reply ? '20px' : '4px',
                                                        borderBottomLeftRadius: reply.is_admin_reply ? '4px' : '20px',
                                                        fontSize: '15px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {reply.message_text}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={handleReply} style={{
                                padding: '12px 16px',
                                borderTop: '1px solid var(--border-color)',
                                background: 'var(--surface-color)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'flex-end',
                                    background: 'var(--background-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '24px',
                                    padding: '8px 12px'
                                }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Reply..."
                                        disabled={sendLoading}
                                        style={{
                                            flex: 1,
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '16px',
                                            padding: '8px 4px'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendLoading || !newMessage.trim()}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: sendLoading || !newMessage.trim() ? 'var(--border-color)' : '#ef4444',
                                            border: 'none',
                                            color: 'white',
                                            cursor: sendLoading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default BugReportMessaging;
