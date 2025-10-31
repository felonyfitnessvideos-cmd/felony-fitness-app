/**
 * @file SubPageHeader.jsx
 * @description
 * Small, reusable header used by sub-pages (details, forms, logs) that
 * provides a consistent layout: a back button on the left, a centered title,
 * and an optional icon. It intentionally keeps behavior minimal so parent
 * pages control navigation and content.
 *
 * Props
 * - title: string — the shown title text
 * - icon: React node — optional leading icon displayed beside the title
 * - iconColor: string — color applied to the icon when provided
 * - backTo: string|undefined — an optional route; when present clicking back
 *   navigates to this route, otherwise the browser history is used
 *
 * Accessibility
 * - The back control is a semantic button and is keyboard-focusable. Icons
 *   are decorative when not provided; when provided ensure `icon` includes
 *   accessible text where appropriate.
 *
 * TODO (coderabbit): consider exposing an `onBack` callback prop for calling
 * analytics or showing confirm dialogs when leaving a dirty form.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function SubPageHeader({ title = '', icon, iconColor = 'white', backTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '44px 1fr 44px',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <button
        type="button"
        aria-label="Back"
        onClick={handleBack}
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={28} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {icon && React.isValidElement(icon) ? React.cloneElement(icon, { color: iconColor }) : null}
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>{title}</h1>
      </div>

      <div></div>
    </div>
  );
}

export default SubPageHeader;
