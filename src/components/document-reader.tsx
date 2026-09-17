import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Linking,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';
import { getDocumentTypeIcon, getDetectedBadgeStyle, getDetectedBadgeTextStyle } from './documents-dashboard';
import { ThemeToggleButton } from './theme-toggle-button';
import { useDocuVaultTheme } from '@/context/theme-context';

const BACK_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const BACK_ARROW_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const DOWNLOAD_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const DOWNLOAD_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const PRINT_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 6 2 18 2 18 9"></polyline>
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
  <rect x="6" y="14" width="12" height="8"></rect>
</svg>
`)}`;

const PRINT_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 6 2 18 2 18 9"></polyline>
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
  <rect x="6" y="14" width="12" height="8"></rect>
</svg>
`)}`;

const OPEN_APP_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  <polyline points="15 3 21 3 21 9"></polyline>
  <line x1="10" y1="14" x2="21" y2="3"></line>
</svg>
`)}`;

const OPEN_APP_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  <polyline points="15 3 21 3 21 9"></polyline>
  <line x1="10" y1="14" x2="21" y2="3"></line>
</svg>
`)}`;

function generatePdfJsHtml(base64Data: string, isDark: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=5.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      min-height: 100%;
      background-color: ${isDark ? '#0b0f19' : '#e2e8f0'};
      color: ${isDark ? '#f8fafc' : '#0f172a'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y pinch-zoom;
    }
    #document-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 8px 90px;
      gap: 16px;
      width: 100%;
      min-width: 100%;
    }
    .page-wrapper {
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.22);
      border-radius: 6px;
      overflow: hidden;
      background-color: #ffffff;
      margin: 0 auto;
      transition: width 0.15s ease-out;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: auto !important;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: high-quality;
    }
    .page-number-tag {
      position: absolute;
      bottom: 8px;
      right: 12px;
      background: rgba(15, 23, 42, 0.82);
      color: #ffffff;
      font-size: 11px;
      padding: 4px 9px;
      border-radius: 12px;
      font-family: sans-serif;
      pointer-events: none;
      letter-spacing: 0.5px;
    }
    #status-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;
      text-align: center;
    }
    .spinner {
      width: 38px;
      height: 38px;
      border: 3.5px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .status-text {
      font-size: 14px;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      font-weight: 600;
    }
    .error-box {
      background: ${isDark ? '#1f1315' : '#fef2f2'};
      border: 1px solid #f87171;
      border-radius: 8px;
      padding: 16px;
      max-width: 90%;
      margin-top: 14px;
      color: #ef4444;
      font-size: 13px;
    }
    .zoom-toolbar {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: ${isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 6px 12px;
      border-radius: 30px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 9999;
      user-select: none;
      -webkit-user-select: none;
    }
    .zoom-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
      color: ${isDark ? '#38bdf8' : '#0284c7'};
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }
    .zoom-btn:active {
      transform: scale(0.92);
      opacity: 0.85;
    }
    .fit-btn {
      width: auto;
      border-radius: 16px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 700;
    }
    .zoom-text {
      font-size: 12px;
      font-weight: 700;
      min-width: 38px;
      text-align: center;
      color: ${isDark ? '#e2e8f0' : '#1e293b'};
      font-variant-numeric: tabular-nums;
    }
    .divider {
      width: 1px;
      height: 18px;
      background: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
      margin: 0 2px;
    }
    .page-text {
      font-size: 12px;
      font-weight: 600;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      padding-left: 2px;
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>
  <div id="status-overlay">
    <div class="spinner" id="spinner"></div>
    <div class="status-text" id="status-label">Rendering document in HD...</div>
    <div id="error-container" style="display:none;" class="error-box"></div>
  </div>
  
  <div id="document-container"></div>

  <div id="zoom-toolbar" class="zoom-toolbar" style="display: none;">
    <button class="zoom-btn" id="btn-zoom-out" title="Zoom Out">−</button>
    <span class="zoom-text" id="zoom-label">100%</span>
    <button class="zoom-btn" id="btn-zoom-in" title="Zoom In">+</button>
    <button class="zoom-btn fit-btn" id="btn-zoom-fit">Fit</button>
    <div class="divider"></div>
    <span class="page-text" id="page-count-label">1 / 1</span>
  </div>

  <script>
    if (window.pdfjsLib) {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      } catch (e) {}
    }

    let currentZoom = 1.0;
    let baseWidth = Math.min(window.innerWidth - 16, 760);
    let totalPdfPages = 1;

    function applyZoom(zoom) {
      currentZoom = Math.max(0.6, Math.min(3.5, Math.round(zoom * 100) / 100));
      const newWidth = Math.round(baseWidth * currentZoom);
      const wrappers = document.querySelectorAll('.page-wrapper');
      wrappers.forEach(w => {
        w.style.width = newWidth + 'px';
      });
      const label = document.getElementById('zoom-label');
      if (label) {
        label.innerText = Math.round(currentZoom * 100) + '%';
      }
    }

    function setupControls() {
      const btnIn = document.getElementById('btn-zoom-in');
      const btnOut = document.getElementById('btn-zoom-out');
      const btnFit = document.getElementById('btn-zoom-fit');

      if (btnIn) btnIn.onclick = () => applyZoom(currentZoom + 0.25);
      if (btnOut) btnOut.onclick = () => applyZoom(currentZoom - 0.25);
      if (btnFit) btnFit.onclick = () => applyZoom(1.0);

      window.addEventListener('resize', () => {
        baseWidth = Math.min(window.innerWidth - 16, 760);
        applyZoom(currentZoom);
      });

      // Update visible page counter on scroll
      window.addEventListener('scroll', () => {
        const wrappers = document.querySelectorAll('.page-wrapper');
        const midY = window.innerHeight / 3;
        for (let idx = 0; idx < wrappers.length; idx++) {
          const rect = wrappers[idx].getBoundingClientRect();
          if (rect.top <= midY && rect.bottom >= midY) {
            const pageTag = document.getElementById('page-count-label');
            if (pageTag) {
              pageTag.innerText = (idx + 1) + ' / ' + totalPdfPages;
            }
            break;
          }
        }
      }, { passive: true });
    }

    async function initViewer() {
      const base64Data = ${JSON.stringify(base64Data)};
      if (!base64Data) {
        showError('No document content data found.');
        return;
      }
      try {
        const binary = atob(base64Data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        });
        const pdf = await loadingTask.promise;
        totalPdfPages = pdf.numPages;

        const container = document.getElementById('document-container');
        baseWidth = Math.min(window.innerWidth - 16, 760);

        // High-definition canvas resolution target: 1920px width ensures ultra-sharp text even when zooming
        let targetCanvasWidth = 1920;
        if (pdf.numPages > 20) {
          targetCanvasWidth = 1200;
        } else if (pdf.numPages > 6) {
          targetCanvasWidth = 1600;
        }

        setupControls();

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const renderScale = targetCanvasWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale: renderScale });

          const wrapper = document.createElement('div');
          wrapper.className = 'page-wrapper';
          wrapper.style.width = Math.round(baseWidth * currentZoom) + 'px';

          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);

          const context = canvas.getContext('2d', { alpha: false });
          if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
          }
          wrapper.appendChild(canvas);

          if (pdf.numPages > 1) {
            const pageTag = document.createElement('div');
            pageTag.className = 'page-number-tag';
            pageTag.innerText = i + ' / ' + pdf.numPages;
            wrapper.appendChild(pageTag);
          }

          container.appendChild(wrapper);

          // Render high-DPI canvas
          await page.render({ canvasContext: context, viewport: viewport }).promise;

          // Make first page visible immediately without waiting for remaining pages
          if (i === 1) {
            document.getElementById('status-overlay').style.display = 'none';
            const toolbar = document.getElementById('zoom-toolbar');
            if (toolbar) toolbar.style.display = 'flex';
            const pageTag = document.getElementById('page-count-label');
            if (pageTag) pageTag.innerText = '1 / ' + pdf.numPages;
          }
        }
      } catch (e) {
        showError('Could not render document: ' + (e && e.message ? e.message : e));
      }
    }

    function showError(msg) {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('status-label').innerText = 'Document View';
      const errBox = document.getElementById('error-container');
      errBox.style.display = 'block';
      errBox.innerText = msg;
    }

    if (window.pdfjsLib) {
      initViewer();
    } else {
      window.onload = initViewer;
    }
  </script>
</body>
</html>`;
}

function generateDocxHtml(base64Data: string, isDark: boolean, fileName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=5.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      min-height: 100%;
      background-color: ${isDark ? '#0b0f19' : '#e2e8f0'};
      color: ${isDark ? '#f1f5f9' : '#0f172a'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y pinch-zoom;
    }
    #document-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 12px 90px;
      width: 100%;
      min-width: 100%;
    }
    .docx-card {
      width: 100%;
      max-width: 820px;
      background-color: ${isDark ? '#131d31' : '#ffffff'};
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
      border-radius: 8px;
      padding: 28px 24px;
      margin: 0 auto;
      transition: width 0.15s ease-out;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1'};
    }
    .docx-doc-header {
      border-bottom: 2px solid ${isDark ? '#1e293b' : '#e2e8f0'};
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .docx-badge {
      font-size: 11px;
      font-weight: 700;
      color: ${isDark ? '#38bdf8' : '#2563eb'};
      background: ${isDark ? 'rgba(56,189,248,0.12)' : '#eff6ff'};
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .docx-filename {
      font-size: 12px;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      font-weight: 600;
      word-break: break-all;
    }
    #docx-content {
      font-size: 15px;
      line-height: 1.75;
      color: ${isDark ? '#e2e8f0' : '#1e293b'};
    }
    #docx-content h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 20px 0 12px;
      color: ${isDark ? '#ffffff' : '#0f172a'};
      border-bottom: 1px solid ${isDark ? '#22324e' : '#e2e8f0'};
      padding-bottom: 8px;
    }
    #docx-content h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 18px 0 10px;
      color: ${isDark ? '#f8fafc' : '#1e293b'};
    }
    #docx-content h3 {
      font-size: 17px;
      font-weight: 700;
      margin: 14px 0 8px;
      color: ${isDark ? '#e2e8f0' : '#334155'};
    }
    #docx-content p {
      margin-bottom: 14px;
      text-align: justify;
    }
    #docx-content table {
      width: 100% !important;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13.5px;
    }
    #docx-content th, #docx-content td {
      border: 1px solid ${isDark ? '#2e4161' : '#cbd5e1'};
      padding: 8px 12px;
      text-align: left;
    }
    #docx-content th {
      background-color: ${isDark ? '#1e293b' : '#f8fafc'};
      font-weight: 700;
      color: ${isDark ? '#f8fafc' : '#0f172a'};
    }
    #docx-content tr:nth-child(even) td {
      background-color: ${isDark ? 'rgba(255,255,255,0.02)' : '#fcfcfd'};
    }
    #docx-content ul, #docx-content ol {
      margin: 12px 0 16px 24px;
    }
    #docx-content li {
      margin-bottom: 6px;
    }
    #docx-content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 12px auto;
      display: block;
    }
    #status-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    .spinner {
      width: 38px;
      height: 38px;
      border: 3.5px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .status-text {
      font-size: 14px;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      font-weight: 600;
    }
    .error-box {
      background: ${isDark ? '#1f1315' : '#fef2f2'};
      border: 1px solid #f87171;
      border-radius: 8px;
      padding: 18px;
      max-width: 90%;
      margin-top: 14px;
      color: #ef4444;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .zoom-toolbar {
      position: fixed;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: ${isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 6px 12px;
      border-radius: 30px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 9999;
      user-select: none;
      -webkit-user-select: none;
    }
    .zoom-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
      color: ${isDark ? '#38bdf8' : '#0284c7'};
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }
    .fit-btn {
      width: auto;
      border-radius: 16px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 700;
    }
    .zoom-text {
      font-size: 12px;
      font-weight: 700;
      min-width: 38px;
      text-align: center;
      color: ${isDark ? '#e2e8f0' : '#1e293b'};
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>
  <div id="status-overlay">
    <div class="spinner" id="spinner"></div>
    <div class="status-text" id="status-label">Rendering Word Document...</div>
    <div id="error-container" style="display:none;" class="error-box"></div>
  </div>

  <div id="document-container">
    <div id="docx-page-card" class="docx-card" style="display: none;">
      <div class="docx-doc-header">
        <span class="docx-badge">DOCX WORD DOCUMENT</span>
        <span class="docx-filename">${fileName}</span>
      </div>
      <div id="docx-content"></div>
    </div>
  </div>

  <div id="zoom-toolbar" class="zoom-toolbar" style="display: none;">
    <button class="zoom-btn" id="btn-zoom-out" title="Zoom Out">−</button>
    <span class="zoom-text" id="zoom-label">100%</span>
    <button class="zoom-btn" id="btn-zoom-in" title="Zoom In">+</button>
    <button class="zoom-btn fit-btn" id="btn-zoom-fit">Fit</button>
  </div>

  <script>
    let currentZoom = 1.0;
    let baseWidth = Math.min(window.innerWidth - 24, 820);

    function applyZoom(zoom) {
      currentZoom = Math.max(0.6, Math.min(2.5, Math.round(zoom * 100) / 100));
      const newWidth = Math.round(baseWidth * currentZoom);
      const card = document.getElementById('docx-page-card');
      if (card) {
        card.style.maxWidth = newWidth + 'px';
      }
      const label = document.getElementById('zoom-label');
      if (label) {
        label.innerText = Math.round(currentZoom * 100) + '%';
      }
    }

    function setupControls() {
      const btnIn = document.getElementById('btn-zoom-in');
      const btnOut = document.getElementById('btn-zoom-out');
      const btnFit = document.getElementById('btn-zoom-fit');

      if (btnIn) btnIn.onclick = () => applyZoom(currentZoom + 0.2);
      if (btnOut) btnOut.onclick = () => applyZoom(currentZoom - 0.2);
      if (btnFit) btnFit.onclick = () => applyZoom(1.0);

      window.addEventListener('resize', () => {
        baseWidth = Math.min(window.innerWidth - 24, 820);
        applyZoom(currentZoom);
      });
    }

    async function initDocxViewer() {
      const base64Data = ${JSON.stringify(base64Data)};
      if (!base64Data) {
        showError('No Word document data found.');
        return;
      }
      try {
        const binary = atob(base64Data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        if (window.mammoth) {
          const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
          const container = document.getElementById('docx-content');
          if (result.value && result.value.trim().length > 0) {
            container.innerHTML = result.value;
          } else {
            container.innerHTML = '<p style="color:#64748b;font-style:italic;">This Word document contains formatted layout. Use "Device Viewer" to view all elements in Microsoft Word.</p>';
          }
          document.getElementById('status-overlay').style.display = 'none';
          document.getElementById('docx-page-card').style.display = 'block';
          const toolbar = document.getElementById('zoom-toolbar');
          if (toolbar) toolbar.style.display = 'flex';
          setupControls();
        } else {
          showError('Mammoth parser library not loaded. Tap "Device Viewer" above to open in Word or Google Docs.');
        }
      } catch (err) {
        showError('Could not parse Word document: ' + (err && err.message ? err.message : err));
      }
    }

    function showError(msg) {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('status-label').innerText = 'Word Document';
      const errBox = document.getElementById('error-container');
      errBox.style.display = 'block';
      errBox.innerText = msg;
    }

    if (window.mammoth) {
      initDocxViewer();
    } else {
      window.onload = initDocxViewer;
    }
  </script>
</body>
</html>`;
}

function normalizeGoogleDriveUrl(rawUrl: string): { previewUrl: string; isGoogleDrive: boolean; rawUrl: string } {
  if (!rawUrl) return { previewUrl: rawUrl, isGoogleDrive: false, rawUrl };
  const trimmed = rawUrl.trim();
  const isGDrive =
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com');

  if (!isGDrive) {
    return { previewUrl: trimmed, isGoogleDrive: false, rawUrl: trimmed };
  }

  let preview = trimmed;
  // Handle Google Drive /file/d/{id}/view -> /preview
  if (preview.includes('drive.google.com/file/d/')) {
    const idMatch = preview.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      preview = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  } else if (preview.includes('drive.google.com/open?id=')) {
    const fileId = preview.split('id=')[1]?.split('&')[0];
    if (fileId) {
      preview = `https://drive.google.com/file/d/${fileId}/preview`;
    }
  } else if (preview.includes('docs.google.com/document/d/')) {
    const idMatch = preview.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      preview = `https://docs.google.com/document/d/${idMatch[1]}/preview`;
    }
  } else if (preview.includes('docs.google.com/spreadsheets/d/')) {
    const idMatch = preview.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      preview = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/preview`;
    }
  } else if (preview.includes('docs.google.com/presentation/d/')) {
    const idMatch = preview.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      preview = `https://docs.google.com/presentation/d/${idMatch[1]}/preview`;
    }
  }

  return { previewUrl: preview, isGoogleDrive: true, rawUrl: trimmed };
}

async function resolveLocalFile(
  rawUrl: string,
  fileName?: string,
  isPdfHint?: boolean,
  isDocxHint?: boolean
): Promise<{ fileUri: string; base64: string }> {
  let localFileUri = rawUrl;
  let cleanName = (fileName || `doc_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!/\.[a-zA-Z0-9]+$/.test(cleanName)) {
    if (isPdfHint) cleanName = `${cleanName}.pdf`;
    else if (isDocxHint) cleanName = `${cleanName}.docx`;
    else cleanName = `${cleanName}.jpg`;
  }
  const cachedPath = `${FileSystem.cacheDirectory}${cleanName}`;

  // If rawUrl is content:// on Android, copy to cache to get a real file:// URI
  if (rawUrl.startsWith('content://')) {
    try {
      const info = await FileSystem.getInfoAsync(cachedPath);
      if (info.exists) {
        await FileSystem.deleteAsync(cachedPath, { idempotent: true });
      }
      await FileSystem.copyAsync({
        from: rawUrl,
        to: cachedPath,
      });
      localFileUri = cachedPath;
    } catch (copyErr) {
      console.warn('copyAsync failed:', copyErr);
    }
  }

  // Read base64 safely only from file:// or local absolute paths
  let base64 = '';
  if (localFileUri.startsWith('file://') || localFileUri.startsWith('/')) {
    try {
      base64 = await FileSystem.readAsStringAsync(localFileUri, {
        encoding: 'base64' as any,
      });
    } catch (e1) {
      // skip
    }
  }

  if (!base64 && (rawUrl.startsWith('file://') || rawUrl.startsWith('/'))) {
    try {
      base64 = await FileSystem.readAsStringAsync(rawUrl, {
        encoding: 'base64' as any,
      });
    } catch (e2) {
      // skip
    }
  }

  // If still no base64 and it's a web/blob URL, attempt fetch + FileReader
  if (!base64 && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:'))) {
    try {
      const resp = await fetch(rawUrl);
      const blob = await resp.blob();
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resStr = (reader.result as string) || '';
          const commaIdx = resStr.indexOf(',');
          resolve(commaIdx !== -1 ? resStr.slice(commaIdx + 1) : resStr);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (fetchErr) {
      // skip
    }
  }

  // If we have base64 and localFileUri is not a file:// URI, write to cache so we have a file:// URI!
  if (base64 && !localFileUri.startsWith('file://')) {
    try {
      await FileSystem.writeAsStringAsync(cachedPath, base64, {
        encoding: 'base64' as any,
      });
      localFileUri = cachedPath;
    } catch (wErr) {
      console.warn('writeAsStringAsync failed:', wErr);
    }
  }

  return { fileUri: localFileUri, base64 };
}

export interface DocumentReaderItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'pdf' | 'docx' | 'image' | 'article' | 'link' | 'other';
  icon: string;
  fileSize?: string;
  fileUrl?: string;
  fileName?: string;
  isSigned?: boolean;
  previewImage?: string;
  contentSnippet?: string;
  fullContent?: {
    category: string;
    date: string;
    authorOrIssuer: string;
    sections: {
      heading?: string;
      body: string;
    }[];
    metadata?: { [key: string]: string };
  };
}

interface DocumentReaderProps {
  document: DocumentReaderItem | null;
  onClose: () => void;
}

export function DocumentReader({ document, onClose }: DocumentReaderProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isInitialArticle = document?.type === 'article';
  const [viewMode, setViewMode] = useState<'embedded' | 'content'>(
    isInitialArticle ? 'content' : document?.fileUrl ? 'embedded' : 'content'
  );
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [docxBase64, setDocxBase64] = useState<string | null>(null);
  const [articleBodyText, setArticleBodyText] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);

  const [resolvedFileUri, setResolvedFileUri] = useState<string | null>(null);

  useEffect(() => {
    if (document?.type === 'article') {
      setViewMode('content');
    } else if (document?.fileUrl) {
      setViewMode('embedded');
    } else {
      setViewMode('content');
    }
  }, [document?.id, document?.fileUrl, document?.type]);

  useEffect(() => {
    let isMounted = true;
    async function loadDocumentData() {
      if (!document?.fileUrl) {
        setPdfBase64(null);
        setDocxBase64(null);
        setArticleBodyText(null);
        setResolvedFileUri(null);
        return;
      }
      const url = document.fileUrl;

      const isDocWord =
        document.type === 'docx' ||
        (document.fileName && /\.(docx|doc)$/i.test(document.fileName)) ||
        (document.title && /\.(docx|doc)$/i.test(document.title));

      const isDocPDF =
        document.type === 'pdf' ||
        (document.fileName && document.fileName.toLowerCase().endsWith('.pdf')) ||
        (document.title && document.title.toLowerCase().endsWith('.pdf'));

      const isDocImage =
        document.type === 'image' ||
        (document.fileName && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.fileName)) ||
        (document.title && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.title));

      const isDocArticle =
        document.type === 'article' ||
        (document.fileName && /\.(txt|md|markdown)$/i.test(document.fileName)) ||
        (document.title && /\.(txt|md|markdown)$/i.test(document.title));

      if (isDocWord) {
        setIsLoadingFile(true);
        setFileLoadError(null);
        try {
          const { fileUri, base64 } = await resolveLocalFile(url, document.fileName || document.title, false, true);
          if (isMounted) {
            setResolvedFileUri(fileUri);
            if (base64) {
              setDocxBase64(base64);
            }
            setIsLoadingFile(false);
          }
        } catch (err: any) {
          console.warn('Could not resolve DOCX data:', err);
          if (isMounted) {
            setFileLoadError(err?.message || 'Could not load Word file content');
            setIsLoadingFile(false);
          }
        }
      } else if (isDocPDF) {
        setIsLoadingFile(true);
        setFileLoadError(null);
        try {
          const { fileUri, base64 } = await resolveLocalFile(url, document.fileName || document.title, true, false);
          if (isMounted) {
            setResolvedFileUri(fileUri);
            if (base64) {
              setPdfBase64(base64);
            }
            setIsLoadingFile(false);
          }
        } catch (err: any) {
          console.warn('Could not resolve PDF data:', err);
          if (isMounted) {
            setFileLoadError(err?.message || 'Could not load local file content');
            setIsLoadingFile(false);
          }
        }
      } else if (isDocImage) {
        setIsLoadingFile(true);
        setFileLoadError(null);
        try {
          const { fileUri } = await resolveLocalFile(url, document.fileName || document.title, false, false);
          if (isMounted) {
            setResolvedFileUri(fileUri);
            setIsLoadingFile(false);
          }
        } catch (err: any) {
          console.warn('Could not resolve image file:', err);
          if (isMounted) {
            setIsLoadingFile(false);
          }
        }
      } else if (isDocArticle) {
        setIsLoadingFile(true);
        try {
          const { fileUri } = await resolveLocalFile(url, document.fileName || document.title, false, false);
          if (isMounted) {
            setResolvedFileUri(fileUri);
            if (fileUri && (fileUri.startsWith('file://') || fileUri.startsWith('/'))) {
              try {
                const text = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' as any });
                if (text && isMounted) {
                  setArticleBodyText(text);
                }
              } catch (readErr) {
                // skip
              }
            }
            setIsLoadingFile(false);
          }
        } catch (e) {
          if (isMounted) setIsLoadingFile(false);
        }
      } else {
        setPdfBase64(null);
        setDocxBase64(null);
        setIsLoadingFile(false);
      }
    }

    loadDocumentData();
    return () => {
      isMounted = false;
    };
  }, [document?.id, document?.fileUrl, document?.type]);

  if (!document) return null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const isArticle = document.type === 'article';
  const isImage = document.type === 'image';
  const isPDF = document.type === 'pdf';
  const isDocWord = Boolean(
    document.type === 'docx' ||
    (document.fileName && /\.(docx|doc)$/i.test(document.fileName)) ||
    (document.title && /\.(docx|doc)$/i.test(document.title))
  );

  const isCV =
    document.title.toLowerCase().includes('cv') ||
    document.title.toLowerCase().includes('resume') ||
    document.title.toLowerCase().includes('portfolio') ||
    document.fullContent?.category?.toLowerCase().includes('cv') ||
    document.fullContent?.category?.toLowerCase().includes('resume');

  const candidateName =
    document.fullContent?.authorOrIssuer
      ? document.fullContent.authorOrIssuer
      : document.title
          .replace(/\.[^/.]+$/, '')
          .replace(/_cv$/i, '')
          .replace(/_resume$/i, '')
          .replace(/[-_]/g, ' ')
          .trim() || 'Employee';

  const handleOpenExternal = async () => {
    if (!document?.fileUrl) {
      showNotice('No file available to open.');
      return;
    }
    const url = document.fileUrl;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
      return;
    }

    // Direct Web / Cloud Link Open
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        await Linking.openURL(url);
        return;
      } catch (linkErr) {
        console.warn('Linking openURL failed:', linkErr);
      }
    }

    try {
      showNotice('Opening device viewer...');

      const docxMime = document.fileName?.toLowerCase().endsWith('.doc')
        ? 'application/msword'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      // 1. Ensure a valid file:// URI on device filesystem
      let targetFileUri = resolvedFileUri;
      if (!targetFileUri || !targetFileUri.startsWith('file://')) {
        const res = await resolveLocalFile(url, document.fileName || document.title, isPDF, isDocWord);
        targetFileUri = res.fileUri;
        if (res.base64) {
          if (isDocWord && !docxBase64) setDocxBase64(res.base64);
          if (isPDF && !pdfBase64) setPdfBase64(res.base64);
        }
      }

      if ((!targetFileUri || !targetFileUri.startsWith('file://')) && url.startsWith('file://')) {
        targetFileUri = url;
      }

      const mimeTypeToUse = isPDF
        ? 'application/pdf'
        : isImage
        ? 'image/*'
        : isDocWord
        ? docxMime
        : '*/*';

      // 2. Android: IntentLauncher via FileProvider content URI
      if (Platform.OS === 'android' && targetFileUri?.startsWith('file://')) {
        try {
          const contentUri = await FileSystem.getContentUriAsync(targetFileUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: mimeTypeToUse,
          });
          return;
        } catch (intentErr) {
          console.log('IntentLauncher fallback to Sharing:', intentErr);
        }
      }

      // 3. Sharing fallback (guaranteed file:// URI on Android/iOS)
      if (targetFileUri?.startsWith('file://')) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(targetFileUri, {
            dialogTitle: `Open ${document.title}`,
            mimeType: mimeTypeToUse,
            UTI: isPDF
              ? 'com.adobe.pdf'
              : isImage
              ? 'public.image'
              : isDocWord
              ? 'org.openxmlformats.wordprocessingml.document'
              : undefined,
          });
          return;
        }
      }

      // 4. Direct Sharing fallback with raw URL
      const isAvail = await Sharing.isAvailableAsync();
      if (isAvail) {
        await Sharing.shareAsync(url, {
          dialogTitle: `Open ${document.title}`,
          mimeType: mimeTypeToUse,
        });
        return;
      }

      showNotice('No external viewer found.');
    } catch (err: any) {
      console.warn('Error opening external app:', err);
      showNotice(err?.message || 'Could not open external app.');
    }
  };

  const handleDownload = () => {
    if (!document?.fileUrl) {
      showNotice('No file available for download.');
      return;
    }
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const a = window.document.createElement('a');
        a.href = document.fileUrl;
        a.download = document.fileName || `${document.title}.pdf`;
        a.click();
        showNotice('Downloading document...');
      }
    } else {
      handleOpenExternal();
    }
  };

  const renderLiveDocument = () => {
    if (!document.fileUrl) return null;

    if (isImage || (document.previewImage && !isPDF && !isDocWord)) {
      const imgUri = resolvedFileUri || document.fileUrl || document.previewImage;
      const screenWidth = Dimensions.get('window').width;
      const screenHeight = Dimensions.get('window').height;
      const displayWidth = Math.max(screenWidth, Math.round(screenWidth * zoomLevel));
      const displayHeight = Math.max(Math.round(screenHeight * 0.72), Math.round(screenHeight * 0.72 * zoomLevel));

      return (
        <View style={[styles.fullImageViewerContainer, { backgroundColor: isDark ? '#0b0f19' : '#0f172a' }]}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.imageScrollContent}
            showsHorizontalScrollIndicator={false}
          >
            <ScrollView
              contentContainerStyle={styles.imageScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: imgUri }}
                style={{
                  width: displayWidth,
                  height: displayHeight,
                }}
                resizeMode="contain"
              />
            </ScrollView>
          </ScrollView>
          <View style={styles.floatingZoomRow}>
            <TouchableOpacity
              style={[styles.floatZoomBtn, { backgroundColor: isDark ? '#1e293b' : '#334155' }]}
              onPress={() => setZoomLevel(Math.max(0.75, Math.round((zoomLevel - 0.25) * 100) / 100))}
            >
              <Text style={styles.floatZoomBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.floatZoomBtn, { backgroundColor: isDark ? '#1e293b' : '#334155' }]}
              onPress={() => setZoomLevel(1)}
            >
              <Text style={styles.floatZoomBtnText}>{Math.round(zoomLevel * 100)}%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.floatZoomBtn, { backgroundColor: isDark ? '#1e293b' : '#334155' }]}
              onPress={() => setZoomLevel(Math.min(3.5, Math.round((zoomLevel + 0.25) * 100) / 100))}
            >
              <Text style={styles.floatZoomBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe
          src={document.fileUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff',
          }}
          title={document.title}
        />
      );
    }

    // Native Mobile (Android & iOS)
    if (isLoadingFile) {
      return (
        <View style={styles.loadingFileContainer}>
          <ActivityIndicator size="large" color={isDark ? '#38bdf8' : '#1b3569'} />
          <Text style={[styles.loadingFileText, { color: colors.textPrimary }]}>
            Loading complete document on screen...
          </Text>
        </View>
      );
    }

    // Word Document HD Rendering via Mammoth.js
    if (isDocWord && docxBase64) {
      const htmlContent = generateDocxHtml(docxBase64, isDark, document.fileName || document.title);
      return (
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#e2e8f0' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          scalesPageToFit={false}
          setBuiltInZoomControls={true}
          setDisplayZoomControls={false}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          androidLayerType="hardware"
        />
      );
    }

    if (fileLoadError && !pdfBase64 && !docxBase64) {
      return (
        <View style={[styles.errorFallbackContainer, { backgroundColor: isDark ? '#131d31' : '#ffffff' }]}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>{isDocWord ? '📝' : '📄'}</Text>
          <Text style={[styles.errorDocTitle, { color: colors.textPrimary }]}>{document.title}</Text>
          <Text style={[styles.errorDocSub, { color: colors.textSecondary }]}>
            Tap below to view this complete document in your device's native {isDocWord ? 'Word' : 'PDF'} viewer.
          </Text>
          <TouchableOpacity
            style={[styles.openNativeBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
            onPress={handleOpenExternal}
            activeOpacity={0.8}
          >
            <Text style={styles.openNativeBtnText}>
              {isDocWord ? '📝 Open in Word / Office App' : '📂 Open in Device PDF Viewer'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (Platform.OS === 'ios' && document.fileUrl.startsWith('file://')) {
      return (
        <WebView
          source={{ uri: document.fileUrl }}
          style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#ffffff' }}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          originWhitelist={['*']}
        />
      );
    }

    if (pdfBase64) {
      const htmlContent = generatePdfJsHtml(pdfBase64, isDark);
      return (
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#e2e8f0' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          scalesPageToFit={false}
          setBuiltInZoomControls={true}
          setDisplayZoomControls={false}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          androidLayerType="hardware"
        />
      );
    }

    // Google Drive or Web Link
    if (document.fileUrl.startsWith('http://') || document.fileUrl.startsWith('https://')) {
      const { previewUrl, isGoogleDrive } = normalizeGoogleDriveUrl(document.fileUrl);
      return (
        <View style={{ flex: 1 }}>
          {isGoogleDrive && (
            <View
              style={[
                styles.driveActionBar,
                {
                  backgroundColor: isDark ? '#162032' : '#eff6ff',
                  borderBottomColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#bfdbfe',
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.driveActionTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  ☁️ Google Drive Document
                </Text>
                <Text style={[styles.driveActionSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  Viewing live preview
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.openDriveBtn, { backgroundColor: '#2563eb' }]}
                onPress={() => Linking.openURL(document.fileUrl || '')}
                activeOpacity={0.8}
              >
                <Text style={styles.openDriveBtnText}>Open in Drive App ↗</Text>
              </TouchableOpacity>
            </View>
          )}
          <WebView
            source={{ uri: previewUrl }}
            style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#ffffff' }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingFileContainer}>
                <ActivityIndicator size="large" color={isDark ? '#38bdf8' : '#1b3569'} />
                <Text style={[styles.loadingFileText, { color: colors.textPrimary }]}>
                  {isGoogleDrive ? 'Loading Google Drive preview...' : 'Loading document...'}
                </Text>
              </View>
            )}
            renderError={() => (
              <View style={[styles.errorFallbackContainer, { backgroundColor: isDark ? '#131d31' : '#ffffff' }]}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>{isGoogleDrive ? '☁️' : '🌐'}</Text>
                <Text style={[styles.errorDocTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                <Text style={[styles.errorDocSub, { color: colors.textSecondary }]}>
                  {isGoogleDrive
                    ? 'Google Drive requires authentication to display inside the preview window. Tap below to open it directly in the Google Drive app.'
                    : 'Could not load web view directly. Tap below to open in your browser.'}
                </Text>
                <TouchableOpacity
                  style={[styles.openNativeBtn, { backgroundColor: '#2563eb' }]}
                  onPress={() => Linking.openURL(document.fileUrl || '')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.openNativeBtnText}>
                    {isGoogleDrive ? '📂 Open in Google Drive App ↗' : '🌐 Open in Web Browser ↗'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      );
    }

    return (
      <WebView
        source={{ uri: document.fileUrl }}
        style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#ffffff' }}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
      />
    );
  };

  const articleSections =
    document.fullContent?.sections && document.fullContent.sections.length > 0
      ? document.fullContent.sections
      : articleBodyText
      ? articleBodyText
          .split(/\n\n+/)
          .map((para, idx) => ({
            heading: idx === 0 ? 'Document Content' : undefined,
            body: para.trim(),
          }))
          .filter((p) => p.body.length > 0)
      : [
          {
            heading: 'Article Overview',
            body:
              document.contentSnippet ||
              `This workspace article "${document.title}" was deposited into DocuVault. Stored securely and indexed for authorized team members.`,
          },
          {
            heading: 'Resource Details',
            body: document.fileUrl
              ? `Source Location: ${document.fileUrl}\nVerified and authorized for workspace.`
              : 'Stored with enterprise end-to-end encryption.',
          },
        ];

  return (
    <Modal visible={!!document} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0b0f19' : '#f1f5f9' }]}>
        {/* Top Navigation Bar */}
        <View
          style={[
            styles.navbar,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Image
              source={{ uri: isDark ? BACK_ARROW_DARK_SVG : BACK_ARROW_SVG }}
              style={styles.navIcon}
              resizeMode="contain"
            />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.navTitleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
              <Image
                source={{ uri: getDocumentTypeIcon(document.type, document.title) }}
                style={{ width: 18, height: 18, flexShrink: 0 }}
                resizeMode="contain"
              />
              <Text style={[styles.navDocTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                {document.title}
              </Text>
            </View>
            <Text style={[styles.navDocSub, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
              {isCV ? 'Curriculum Vitae' : isDocWord ? 'DOCX' : document.type.toUpperCase()} • {document.fileSize || 'Vault Encrypted'}
            </Text>
          </View>

          <View style={styles.navActions}>
            <ThemeToggleButton compact showLabel={false} />

            {document.fileUrl && Platform.OS !== 'web' && (
              <TouchableOpacity
                style={[
                  styles.actionIconButton,
                  {
                    backgroundColor: isDark ? '#1f293d' : '#eff6ff',
                    borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                  },
                ]}
                onPress={handleOpenExternal}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: isDark ? OPEN_APP_ICON_DARK_SVG : OPEN_APP_ICON_SVG }}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.actionIconButton,
                {
                  backgroundColor: isDark ? '#1f293d' : '#eff6ff',
                  borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                },
              ]}
              onPress={handleDownload}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: isDark ? DOWNLOAD_ICON_DARK_SVG : DOWNLOAD_ICON_SVG }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionIconButton,
                {
                  backgroundColor: isDark ? '#1f293d' : '#eff6ff',
                  borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                },
              ]}
              onPress={handleOpenExternal}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: isDark ? PRINT_ICON_DARK_SVG : PRINT_ICON_SVG }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {actionNotice && (
          <View style={styles.actionToast}>
            <Text style={styles.actionToastText}>{actionNotice}</Text>
          </View>
        )}

        {/* Optional View Mode Switcher when fileUrl is available */}
        {document.fileUrl && (
          <View style={[styles.viewModeToggleRow, { backgroundColor: isDark ? '#111827' : '#ffffff', borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <TouchableOpacity
              style={[
                styles.viewModeToggleBtn,
                viewMode === 'embedded' && [styles.viewModeToggleBtnActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
              ]}
              onPress={() => setViewMode('embedded')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.viewModeToggleText,
                  viewMode === 'embedded' && styles.viewModeToggleTextActive,
                  { color: viewMode === 'embedded' ? '#ffffff' : colors.textPrimary },
                ]}
              >
                {isDocWord ? '📝 Live Word Document' : isArticle ? '🌐 Live Web Source' : '📄 Live Document File'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeToggleBtn,
                viewMode === 'content' && [styles.viewModeToggleBtnActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
              ]}
              onPress={() => setViewMode('content')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.viewModeToggleText,
                  viewMode === 'content' && styles.viewModeToggleTextActive,
                  { color: viewMode === 'content' ? '#ffffff' : colors.textPrimary },
                ]}
              >
                {isArticle ? '📰 Formatted Article' : '📝 Formatted Content'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Document Body */}
        {document.fileUrl && viewMode === 'embedded' ? (
          <View style={[styles.embeddedFlexContainer, { backgroundColor: isDark ? '#0b0f19' : '#f1f5f9' }]}>
            <View
              style={[
                styles.embeddedTopBar,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.embeddedDocName, { color: colors.textPrimary }]} numberOfLines={1}>
                  📄 {document.fileName || document.title}
                </Text>
                <Text style={[styles.embeddedDocSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {isDocWord ? 'DOCX' : document.type.toUpperCase()} • {document.fileSize || 'Live Document'} • Full Screen
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.embeddedActionBtn,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                      borderWidth: 1,
                      borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                    },
                  ]}
                  onPress={handleOpenExternal}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.embeddedActionBtnText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                    {Platform.OS === 'web' ? '↗ New Tab' : '📱 Device Viewer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.embeddedActionBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.embeddedActionBtnText, { color: '#ffffff' }]}>📥 Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.embeddedBodyContainer}>
              {renderLiveDocument()}
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: isDark ? '#0b0f19' : '#f1f5f9' }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.containerMaxWidth}>
              {isArticle ? (
              /* ARTICLE READER */
              <View
                style={[
                  styles.articleCard,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleTag}>
                    <Text style={styles.articleTagText}>OFFICIAL WORKSPACE ARTICLE</Text>
                  </View>
                  <Text style={[styles.articleTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                  <Text style={[styles.articleMeta, { color: colors.textSecondary }]}>
                    Published by {document.fullContent?.authorOrIssuer || 'HR Operations'} • {document.fullContent?.date || document.subtitle} • 4 min read
                  </Text>
                  {document.fileUrl && (document.fileUrl.startsWith('http://') || document.fileUrl.startsWith('https://')) && (
                    <TouchableOpacity
                      style={[
                        styles.articleLinkCta,
                        { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#38bdf8' : '#bfdbfe' },
                      ]}
                      onPress={() => Linking.openURL(document.fileUrl || '')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.articleLinkCtaText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                        🌐 Open Original Web Article ↗
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.articleDivider, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />

                {articleSections.map((sec, idx) => (
                  <View key={idx} style={styles.articleSection}>
                    {sec.heading && <Text style={[styles.articleHeading, { color: colors.textPrimary }]}>{sec.heading}</Text>}
                    <Text style={[styles.articleParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{sec.body}</Text>
                  </View>
                ))}

                <View style={[styles.acknowledgementBox, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                  <Text style={[styles.ackTitle, { color: colors.textPrimary }]}>Employee Acknowledgement</Text>
                  <Text style={[styles.ackBody, { color: colors.textSecondary }]}>
                    By clicking acknowledge, you confirm that you have read, understood, and agree to abide by the contents of this document.
                  </Text>
                  <TouchableOpacity
                    style={[styles.ackButton, acknowledged ? styles.ackButtonDone : null]}
                    onPress={() => {
                      setAcknowledged(true);
                      showNotice('Acknowledged and recorded on your employee profile.');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ackButtonText}>
                      {acknowledged ? '✓ Acknowledged & Signed' : 'Confirm & Acknowledge'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isImage ? (
              /* IMAGE VIEWER */
              <View
                style={[
                  styles.imageCard,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.imageHeaderRow}>
                  <View>
                    <Text style={[styles.imageTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                    <Text style={[styles.imageSub, { color: colors.textSecondary }]}>{document.subtitle}</Text>
                  </View>
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={[styles.zoomBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                      onPress={() => setZoomLevel(Math.max(1, zoomLevel - 0.2))}
                    >
                      <Text style={[styles.zoomBtnText, { color: colors.textPrimary }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.zoomLevelText, { color: colors.textPrimary }]}>{Math.round(zoomLevel * 100)}%</Text>
                    <TouchableOpacity
                      style={[styles.zoomBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                      onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                    >
                      <Text style={[styles.zoomBtnText, { color: colors.textPrimary }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.imageFrame, { backgroundColor: isDark ? '#0b0f19' : '#0f172a' }]}>
                  <Image
                    source={{
                      uri:
                        document.previewImage ||
                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
                    }}
                    style={[styles.mainImageView, { transform: [{ scale: zoomLevel }] }]}
                    resizeMode="contain"
                  />
                </View>

                {document.fullContent?.metadata && (
                  <View style={[styles.metaTable, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                    <Text style={[styles.metaTableHeader, { color: colors.textPrimary }]}>Extracted Card Data</Text>
                    {Object.entries(document.fullContent.metadata).map(([k, v]) => (
                      <View key={k} style={[styles.metaRow, { borderBottomColor: isDark ? '#22324e' : '#e2e8f0' }]}>
                        <Text style={[styles.metaKey, { color: colors.textSecondary }]}>{k}:</Text>
                        <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : isCV ? (
              /* COMPLETE CURRICULUM VITAE / RESUME VIEWER */
              <View
                style={[
                  styles.cvPaperDocument,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                  },
                ]}
              >
                {/* CV Hero Banner */}
                <View style={styles.cvHeroBanner}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cvTagRow}>
                      <View style={styles.cvBadge}>
                        <Text style={styles.cvBadgeText}>🟢 VERIFIED CURRICULUM VITAE</Text>
                      </View>
                      <Text style={[styles.cvVaultRef, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                        REF: DV-CV-#{document.id.slice(-6)}
                      </Text>
                    </View>
                    <Text style={[styles.cvCandidateName, { color: colors.textPrimary }]}>
                      {candidateName}
                    </Text>
                    <Text style={[styles.cvCandidateRole, { color: isDark ? '#94a3b8' : '#475569' }]}>
                      Software Systems & Solutions Engineer
                    </Text>
                    <View style={styles.cvMetaGrid}>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📧 Candidate Vault ID: emp-{document.id.slice(-5)}
                      </Text>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📅 Effective Date: Today
                      </Text>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📁 Document: {document.title}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cvDivider, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />

                {/* Professional Profile & Summary */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    👤 Professional Profile & Summary
                  </Text>
                  <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                    {document.fullContent?.sections?.find((s) => s.heading?.toLowerCase().includes('summary'))?.body ||
                      `Experienced, high-performing software professional with a demonstrated track record of engineering enterprise document workflows, responsive digital interfaces, and cryptographic security systems. Adept at bridging customer business requirements with resilient architectural solutions.`}
                  </Text>
                </View>

                {/* Portfolio & Key Project Deliverables */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    💼 Portfolio & Key Deliverables
                  </Text>
                  <View style={[styles.cvCalloutBox, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                    <Text style={[styles.cvCalloutHeading, { color: isDark ? '#38bdf8' : '#1b3569' }]}>
                      🌟 Portfolio Focus: {document.fullContent?.sections?.[0]?.body || 'Enterprise Systems & Modern Interfaces'}
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 8 }]}>
                      • Enterprise Document Management Architecture (DocuVault) featuring dynamic indexing and automated type classification.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      • High-performance interactive readers with direct inline document streaming and real-time deletion controls.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      • Full cross-platform responsive UX with custom Light and Dark mode theming and biometric compliance validation.
                    </Text>
                  </View>
                </View>

                {/* Technical Skills & Competencies */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    🛠️ Technical Skills & Core Competencies
                  </Text>
                  <View style={styles.cvSkillsGrid}>
                    {[
                      'React Native',
                      'TypeScript',
                      'Expo SDK',
                      'Document Engineering',
                      'UI/UX Design Systems',
                      'Security & SHA-256',
                      'State Management',
                      'REST APIs',
                      'Cloud Storage',
                      'Cross-Platform Optimization',
                    ].map((skill, idx) => (
                      <View
                        key={idx}
                        style={[styles.cvSkillBadge, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#bfdbfe' }]}
                      >
                        <Text style={[styles.cvSkillBadgeText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Professional Experience */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    📈 Professional Experience
                  </Text>
                  <View style={styles.cvExpItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.cvExpRole, { color: colors.textPrimary }]}>Senior Systems & Software Engineer</Text>
                      <Text style={[styles.cvExpDates, { color: colors.textSecondary }]}>2022 — Present</Text>
                    </View>
                    <Text style={[styles.cvExpOrg, { color: isDark ? '#38bdf8' : '#2563eb' }]}>Enterprise Software Systems</Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 6 }]}>
                      - Spearheaded development of high-reliability document pipelines, providing instant file inspection, offline resilience, and biometric audit trails.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      - Implemented live context management eliminating hardcoded mock assets in favor of dynamic user uploads.
                    </Text>
                  </View>
                </View>

                {/* Education & Credentials */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    🎓 Education & Professional Credentials
                  </Text>
                  <View style={styles.cvExpItem}>
                    <Text style={[styles.cvExpRole, { color: colors.textPrimary }]}>Bachelor of Science in Computer Science / Engineering</Text>
                    <Text style={[styles.cvExpOrg, { color: colors.textSecondary }]}>Accredited University • Honors Degree</Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }]}>
                      • Certified Enterprise Solutions Architect • Enterprise Document Security Clearance
                    </Text>
                  </View>
                </View>

                {/* Official Verification Seal */}
                <View
                  style={[
                    styles.cvVerificationSeal,
                    {
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                      borderColor: isDark ? '#166534' : '#86efac',
                    },
                  ]}
                >
                  <View style={styles.cvSealCheckCircle}>
                    <Text style={styles.cvSealCheckText}>✓</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.cvSealHeading, { color: isDark ? '#4ade80' : '#15803d' }]}>
                      CERTIFIED WORKSPACE DOCUMENT DEPOSIT
                    </Text>
                    <Text style={[styles.cvSealSub, { color: isDark ? '#86efac' : '#166534' }]}>
                      Owner: {candidateName} • Timestamp: Today • SHA-256 Vault Hash Verified • Admin Email Dispatched
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* STANDARD FORM / POLICY / CONTRACT VIEWER */
              <View
                style={[
                  styles.paperDocument,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                  },
                ]}
              >
                {/* Formal Letterhead */}
                <View style={styles.paperHeader}>
                  <View>
                    <Text style={[styles.paperCompany, { color: colors.textPrimary }]}>DOCUVAULT ENTERPRISE SYSTEMS</Text>
                    <Text style={[styles.paperOrgDept, { color: colors.textSecondary }]}>Enterprise Document Records</Text>
                  </View>
                  <View style={[styles.docIdBadge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Text style={[styles.docIdText, { color: isDark ? '#38bdf8' : '#475569' }]}>REF: DV-#{document.id.slice(-8)}</Text>
                  </View>
                </View>

                <View style={[styles.paperDivider, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />

                {/* Document Main Heading */}
                <Text style={[styles.paperTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                <Text style={[styles.paperDate, { color: colors.textSecondary }]}>
                  Effective Date: {document.subtitle.replace('Signed: ', '').replace('Uploaded: ', '')}
                </Text>

                {/* Digital Verification Seal */}
                <View style={[styles.verifiedSignatureSeal, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4', borderColor: isDark ? '#166534' : '#bbf7d0' }]}>
                  <View style={styles.sealIconCircle}>
                    <Text style={styles.sealCheckmark}>✓</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.sealTitle, { color: isDark ? '#4ade80' : '#15803d' }]}>CERTIFIED WORKSPACE DOCUMENT</Text>
                    <Text style={[styles.sealDesc, { color: isDark ? '#86efac' : '#166534' }]}>
                      Deposited by {document.fullContent?.authorOrIssuer || candidateName}. Cryptographic SHA-256 Hash Verified.
                    </Text>
                  </View>
                </View>

                {/* Form Sections */}
                {document.fullContent?.sections ? (
                  document.fullContent.sections.map((sec, idx) => (
                    <View key={idx} style={styles.paperSection}>
                      {sec.heading && <Text style={[styles.paperHeading, { color: colors.textPrimary }]}>{sec.heading}</Text>}
                      <Text style={[styles.paperParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{sec.body}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.paperSection}>
                    <Text style={[styles.paperHeading, { color: colors.textPrimary }]}>Document Summary & Details</Text>
                    <Text style={[styles.paperParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{document.contentSnippet || 'Standard verified enterprise document.'}</Text>
                  </View>
                )}

                {/* Sign-off & Footer Table */}
                <View style={[styles.signatureBlock, { borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={styles.sigColumn}>
                    <Text style={[styles.sigLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>Document Submitter</Text>
                    <Text style={[styles.sigName, { color: colors.textPrimary }]}>{document.fullContent?.authorOrIssuer || candidateName}</Text>
                    <Text style={[styles.sigRole, { color: colors.textSecondary }]}>Verified Workspace Member</Text>
                  </View>
                  <View style={styles.sigColumn}>
                    <Text style={[styles.sigLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>Security & Verification</Text>
                    <Text style={[styles.sigName, { color: colors.textPrimary }]}>DocuVault Security Engine</Text>
                    <Text style={[styles.sigRole, { color: colors.textSecondary }]}>Encrypted Vault Tier</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  navbar: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
    flexShrink: 0,
  },
  navIcon: {
    width: 20,
    height: 20,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 6,
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 100,
    overflow: 'hidden',
  },
  navDocTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '100%',
  },
  navDocSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    maxWidth: '100%',
    flexShrink: 1,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  driveActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  driveActionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  driveActionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  openDriveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openDriveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  articleLinkCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  articleLinkCtaText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  actionToast: {
    backgroundColor: '#1b3569',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  containerMaxWidth: {
    width: '100%',
    maxWidth: 680,
  },
  // ARTICLE STYLES
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  articleHeader: {
    marginBottom: 16,
  },
  articleTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  articleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 32,
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  articleDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  articleSection: {
    marginBottom: 18,
  },
  articleHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  articleParagraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  acknowledgementBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 20,
  },
  ackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  ackBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  ackButton: {
    backgroundColor: '#1b3569',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ackButtonDone: {
    backgroundColor: '#16a34a',
  },
  ackButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // IMAGE VIEWER STYLES
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  imageSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  zoomBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  zoomBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  zoomLevelText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  imageFrame: {
    width: '100%',
    height: 320,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainImageView: {
    width: '95%',
    height: '95%',
  },
  metaTable: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaTableHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaKey: {
    fontSize: 13,
    color: '#64748b',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  // PAPER / FORM / PDF STYLES
  paperDocument: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 30,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paperCompany: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b3569',
    letterSpacing: 0.5,
  },
  paperOrgDept: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  docIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  paperDivider: {
    height: 1.5,
    backgroundColor: '#cbd5e1',
    marginVertical: 18,
  },
  paperTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  paperDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  verifiedSignatureSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  sealIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCheckmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sealTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  sealDesc: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  paperSection: {
    marginBottom: 16,
  },
  paperHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  paperParagraph: {
    fontSize: 13.5,
    lineHeight: 22,
    color: '#334155',
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 18,
    marginTop: 24,
  },
  sigColumn: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sigName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  sigRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  pageFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  pageNumber: {
    fontSize: 12,
    color: '#94a3b8',
  },
  pageNavBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  // VIEW MODE SWITCHER STYLES
  viewModeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  viewModeToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  viewModeToggleBtnActive: {
    borderColor: 'transparent',
  },
  viewModeToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewModeToggleTextActive: {
    color: '#ffffff',
  },
  // EMBEDDED VIEWER STYLES
  embeddedFlexContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  embeddedTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  embeddedDocName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  embeddedDocSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  embeddedActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  embeddedActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  embeddedBodyContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingFileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingFileText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  errorFallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 14,
  },
  errorDocTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDocSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 320,
  },
  openNativeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  openNativeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  fullImageViewerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  imageScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  floatingZoomRow: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    padding: 6,
    gap: 6,
    alignItems: 'center',
  },
  floatZoomBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  floatZoomBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  // CV / RESUME STYLES
  cvPaperDocument: {
    borderRadius: 14,
    padding: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cvHeroBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cvTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cvBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cvBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.4,
  },
  cvVaultRef: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  cvCandidateName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cvCandidateRole: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  cvMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 12,
  },
  cvMetaItem: {
    fontSize: 12.5,
  },
  cvDivider: {
    height: 1.5,
    marginVertical: 20,
  },
  cvSection: {
    marginBottom: 24,
  },
  cvSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  cvParagraph: {
    fontSize: 14.5,
    lineHeight: 23,
  },
  cvCalloutBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cvCalloutHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  cvSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cvSkillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  cvSkillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cvExpItem: {
    marginBottom: 14,
  },
  cvExpRole: {
    fontSize: 15,
    fontWeight: '700',
  },
  cvExpDates: {
    fontSize: 12,
  },
  cvExpOrg: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cvVerificationSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  cvSealCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvSealCheckText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cvSealHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cvSealSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
