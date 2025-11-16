/**
 * @file EmailComposerModal.jsx
 * @description TinyMCE-based email composer modal for sending campaigns to client groups
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @date 2025-11-16
 * 
 * Features:
 * - Template selector dropdown
 * - Group/recipient display
 * - Email subject input
 * - TinyMCE rich text editor
 * - Send to X Users button
 * - Save as Template functionality
 * - Success/error feedback
 */

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Modal from 'react-modal';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabaseClient';
import './EmailComposerModal.css';

// Set app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

/**
 * EmailComposerModal Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.tag - Selected group tag
 * @param {Array} props.clients - Clients in this group
 * @param {Function} props.onClose - Close modal callback
 * @returns {JSX.Element} Email composer modal
 */
const EmailComposerModal = ({ tag, clients, onClose }) => {
  const { user } = useAuth();
  const editorRef = useRef(null);

  // State management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Valid recipients (with email addresses)
  const validRecipients = clients.filter(c => c.email && c.email.trim() !== '');

  // Debug: Log TinyMCE API key on mount
  useEffect(() => {
    console.log('🔑 TinyMCE API Key:', import.meta.env.VITE_TINYMCE_API_KEY ? 'Loaded' : 'Missing');
  }, []);

  /**
   * Load email templates for this trainer
   */
  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('trainer_email_templates')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  /**
   * Handle template selection
   */
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject || '');
        setBody(template.body || '');
      }
    } else {
      // Blank email selected
      setSubject('');
      setBody('');
    }
  };

  /**
   * Send email campaign to group
   */
  const handleSendCampaign = async () => {
    // Validation
    if (!subject.trim()) {
      setFeedback('Please enter an email subject');
      setFeedbackType('error');
      return;
    }

    if (!body.trim()) {
      setFeedback('Please write an email message');
      setFeedbackType('error');
      return;
    }

    if (validRecipients.length === 0) {
      setFeedback('No clients with valid email addresses in this group');
      setFeedbackType('error');
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      // Call Edge Function to send campaign (no auth needed - tag ownership validated server-side)
      const { data, error } = await supabase.functions.invoke('send-trainer-email-campaign', {
        body: {
          tag_id: tag.id,
          subject: subject.trim(),
          body: body.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send campaign');
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to send campaign');
      }

      // Success!
      const successfulCount = data.data?.successful || validRecipients.length;
      setFeedback(`Campaign sent successfully to ${successfulCount} users!`);
      setFeedbackType('success');
      
      console.log('✅ Campaign sent:', data);

      // Clear form after 3 seconds
      setTimeout(() => {
        setSubject('');
        setBody('');
        setSelectedTemplateId('');
        setFeedback(null);
      }, 3000);

    } catch (err) {
      console.error('Error sending campaign:', err);
      setFeedback(`Error: ${err.message}`);
      setFeedbackType('error');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Save current email as template
   */
  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      setFeedback('Please enter a template name');
      setFeedbackType('error');
      return;
    }

    if (!subject.trim() || !body.trim()) {
      setFeedback('Please provide both subject and body content to save as template');
      setFeedbackType('error');
      return;
    }

    try {
      const { error } = await supabase
        .from('trainer_email_templates')
        .insert({
          trainer_id: user.id,
          name: newTemplateName.trim(),
          subject: subject.trim(),
          body: body.trim()
        });

      if (error) throw error;

      // Success
      setFeedback('Template saved successfully!');
      setFeedbackType('success');
      setIsSaveTemplateModalOpen(false);
      setNewTemplateName('');
      
      // Reload templates
      await loadTemplates();

    } catch (err) {
      console.error('Error saving template:', err);
      setFeedback('Failed to save template. Please try again.');
      setFeedbackType('error');
    }
  };

  /**
   * Word count from editor content
   */
  const getWordCount = () => {
    if (!body) return 0;
    const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  };

  return (
    <>
      <Modal
        isOpen={true}
        onRequestClose={onClose}
        className="email-composer-modal"
        overlayClassName="email-composer-overlay"
        contentLabel="Email Composer"
      >
        <div className="email-composer-content">
          {/* Header */}
          <div className="composer-header">
            <h2>Send Email Campaign</h2>
            <button onClick={onClose} className="close-btn" aria-label="Close">
              ✕
            </button>
          </div>

          {/* Template Selector */}
          <div className="form-group">
            <label htmlFor="template-select">Select Template</label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="template-selector"
            >
              <option value="">-- Start with a blank email --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Send To (Group Display) */}
          <div className="form-group">
            <label htmlFor="group-display">Send To</label>
            <div className="group-display-box">
              {tag.name} ({validRecipients.length} {validRecipients.length === 1 ? 'recipient' : 'recipients'})
            </div>
          </div>

          {/* Email Subject */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="subject-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleSendCampaign}
              disabled={isSending || validRecipients.length === 0}
              className="send-btn"
            >
              {isSending ? 'Sending...' : `Send to ${validRecipients.length} ${validRecipients.length === 1 ? 'User' : 'Users'}`}
            </button>
            <button
              onClick={() => setIsSaveTemplateModalOpen(true)}
              disabled={!subject.trim() || !body.trim()}
              className="save-template-btn"
            >
              Save as Template
            </button>
          </div>

          {/* TinyMCE Editor */}
          <div className="editor-container">
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY || '0ow8laakpfpgqahsezukqe00gsvotydclswudewd130gz0le'}
              onInit={(evt, editor) => editorRef.current = editor}
              value={body}
              onEditorChange={(content) => setBody(content)}
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'code', 'lists', 'link', 'image', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic | bullist numlist | link image | code',
                content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
                placeholder: 'Write your email message here...'
              }}
            />
            <div className="editor-footer">
              <span className="word-count">{getWordCount()} words</span>
              <span className="tinymce-branding">Build with <strong>tinyMCE</strong></span>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`feedback-message ${feedbackType}`}>
              {feedbackType === 'success' ? '✅' : '❌'} {feedback}
            </div>
          )}
        </div>
      </Modal>

      {/* Save Template Modal */}
      <Modal
        isOpen={isSaveTemplateModalOpen}
        onRequestClose={() => setIsSaveTemplateModalOpen(false)}
        className="save-template-modal"
        overlayClassName="save-template-overlay"
        contentLabel="Save Template"
      >
        <div className="save-template-content">
          <h3>Save as Template</h3>
          <div className="form-group">
            <label>Template Name</label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g., Weekly Motivation"
              className="template-name-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveAsTemplate()}
            />
          </div>
          <p className="template-info">
            The current subject and email body will be saved as the template content.
          </p>
          <div className="modal-actions">
            <button onClick={() => setIsSaveTemplateModalOpen(false)} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleSaveAsTemplate} className="save-btn">
              Save Template
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmailComposerModal;
