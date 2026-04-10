import React from 'react';
import ReactDOM from 'react-dom/client';

import FinancialInterviewPrototype from '../../../app/javascript/modules/prototypes/financialInterview/FinancialInterviewPrototype';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <FinancialInterviewPrototype />
  </React.StrictMode>,
);
