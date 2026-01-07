
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Could not find root element to mount to");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application Render Error:", error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>حدث خطأ أثناء تحميل التطبيق</h2>
      <p>يرجى التحقق من سجل المتصفح (Console) لمزيد من التفاصيل.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; cursor: pointer;">إعادة التحميل</button>
    </div>`;
  }
}
