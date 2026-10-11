import { Component, type ReactNode } from 'react';
import { clearSavedAnswers } from '../answerStore';

/** Last line of defence: an unexpected error shows a recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  restart = () => {
    clearSavedAnswers();
    location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="app" role="alert" style={{ textAlign: 'center', paddingTop: 48 }}>
        <h1>Cancer Screening Guide</h1>
        <p>Something went wrong. Please start again.</p>
        <p dir="rtl">هەڵەیەک ڕوویدا. تکایە دووبارە دەست پێ بکەرەوە. · حدث خطأ. يرجى البدء من جديد.</p>
        <button className="primary" onClick={this.restart}>Start again · دووبارە دەستپێکردنەوە · ابدأ من جديد</button>
      </div>
    );
  }
}
