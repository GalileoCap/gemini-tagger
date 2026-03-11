import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  const title = document.createElement('h1');
  title.textContent = 'Gemini Tagger';
  title.style.fontSize = '16px';
  title.style.margin = '10px';
  app.appendChild(title);
  
  const desc = document.createElement('p');
  desc.textContent = 'Right-click conversations to add tags';
  desc.style.fontSize = '12px';
  desc.style.margin = '10px';
  desc.style.color = '#666';
  app.appendChild(desc);
}
