/**
 * Phoenix Tracking Asset: phoenix-tracking.js
 * Build-Time Generated: 2025-09-12T21:50:01.479Z
 * Content Hash: ad6bad6f
 * 
 * This asset is managed by Phoenix BuildTimeTrackingManager.
 * DO NOT EDIT MANUALLY - changes will be overwritten.
 */

/**
 * Phoenix Tracking Client - Build-Time Edition
 * Generated for production builds - survives Next.js compilation
 * 
 * Project ID: 0814245a-1a73-4625-bb72-cc8d4d495e51
 * Generated at: 2025-09-12T21:50:01.477Z
 * Framework: next.js
 * Type: app-router
 */

(function() {
  'use strict';
  
  // Guard against multiple initialization
  if (typeof window === 'undefined' || window.__PHOENIX_TRACKING_INITIALIZED__) {
    return;
  }
  
  // Always run tracking in browser environment (remove environment restrictions for modal visibility)
  if (typeof window !== 'undefined' && 
      window.location && 
      typeof document !== 'undefined') {
    
    console.log('🎯 Phoenix Build-Time Tracking Client loading...');
    
    class PhoenixTrackingClient {
      constructor() {
        this.isInitialized = false;
        this.selectionEnabled = false;
        this.hoveredElement = null;
        this.selectedElement = null;
        this.debugMode = false;
        this.projectId = '0814245a-1a73-4625-bb72-cc8d4d495e51';
        this.userId = 'hw8u8FgXeBcQGo9CRezTWmEivX92';
        this.trackingElements = new Map();
        this.elementCounter = 0;
        this.componentCounter = 0;
        this.targetOrigin = '*';
        
        // Build-time specific properties
        this.buildTime = '2025-09-12T21:50:01.477Z';
        this.trackingMode = 'build-time';
        this.framework = 'next.js';
        this.projectType = 'app-router';
        
        this.init();
      }

      async init() {
        if (this.debugMode) {
          console.log('🎯 Phoenix Build-Time Tracking Client initializing...', {
            projectId: this.projectId,
            framework: this.framework,
            projectType: this.projectType,
            buildTime: this.buildTime
          });
        }
        
        try {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTracking());
          } else {
            this.setupTracking();
          }
        } catch (error) {
          console.error('❌ Phoenix tracking initialization failed:', error);
          this.sendToParent({ type: 'phoenix-error', error: error.message });
        }
      }

      setupTracking() {
        try {
          console.log('🎯 Setting up Phoenix build-time tracking...');
          
          // Add data-phoenix-id attributes to components  
          this.addPhoenixIds();
          
          // Set up event listeners
          this.setupEventListeners();
          
          // Set up communication bridge
          this.setupBridge();
          
          // Mark as initialized
          this.isInitialized = true;
          window.__PHOENIX_TRACKING_INITIALIZED__ = true;
          
          if (this.debugMode) {
            console.log('✅ Phoenix Build-Time Tracking Client ready:', {
              projectId: this.projectId,
              componentCount: this.componentCounter,
              trackingMode: this.trackingMode,
              selectionEnabled: this.selectionEnabled
            });
            console.log('🏷️ Added Phoenix IDs to ' + this.componentCounter + ' elements');
          }
          
          // Send ready message to parent frame - compatible with existing bridge
          this.sendToParent({ 
            type: 'phoenix-tracking-ready', 
            projectId: this.projectId,
            userId: this.userId,
            componentCount: this.componentCounter,
            trackingMode: this.trackingMode,
            buildTime: this.buildTime,
            timestamp: Date.now()
          });
          
        } catch (error) {
          console.error('❌ Phoenix tracking setup failed:', error);
          this.sendToParent({ type: 'phoenix-error', error: error.message });
        }
      }

      addPhoenixIds() {
        // Add tracking IDs to all interactive elements (same as runtime version)
        const elements = document.querySelectorAll('*');
        let counter = 0;
        
        elements.forEach(element => {
          // Skip elements without tagName to prevent TypeError
          if (!element.tagName) {
            return;
          }
          
          // Skip non-interactive elements like script, style, head content
          if (element.tagName === 'SCRIPT' || 
              element.tagName === 'STYLE' || 
              element.tagName === 'META' ||
              element.tagName === 'TITLE' ||
              element.tagName === 'HEAD' ||
              element.tagName === 'LINK' ||
              element.closest('head')) {
            return;
          }
          
          // Skip elements that already have phoenix IDs
          if (element.hasAttribute('data-phoenix-id')) {
            return;
          }
          
          // Generate tracking data (same pattern as runtime version)
          const phoenixId = 'phoenix-' + Date.now() + '-' + (++counter);
          element.setAttribute('data-phoenix-id', phoenixId);
          
          // Create enhanced tracking data with React Fiber inspection
          const trackingData = this.createElementData(element);
          this.trackingElements.set(phoenixId, trackingData);
          
          this.componentCounter++;
        });
        
        if (this.debugMode) {
          console.log('🏷️ Added Phoenix IDs to ' + this.componentCounter + ' elements');
        }
      }

      createElementData(element) {
        const phoenixId = element.getAttribute('data-phoenix-id');
        const rect = element.getBoundingClientRect();
        
        // Try to determine component name from React dev tools (same as runtime)
        let componentName = element.tagName.toLowerCase();
        
        // Check for React component name via Fiber
        const reactKey = Object.keys(element).find(key => 
          key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber')
        );
        
        if (reactKey) {
          const fiber = element[reactKey];
          const reactComponentName = this.getReactComponentName(fiber);
          if (reactComponentName) {
            componentName = reactComponentName;
          }
        }
        
        return {
          id: phoenixId,
          type: componentName !== element.tagName.toLowerCase() ? 'component' : 'element',
          tagName: element.tagName.toLowerCase(),
          componentName: componentName,
          filePath: 'unknown',
          lineNumber: 1,
          columnNumber: 1,
          cssSelector: this.generateCSSSelector(element),
          xpath: this.generateXPath(element),
          priority: 'medium',
          isEditable: true,
          modificationHints: this.getModificationHints(element),
          props: {},
          boundingRect: rect,
          className: typeof element.className === 'string' ? element.className : element.className?.toString() || '',
          attributes: this.getElementAttributes(element),
          depth: this.getElementDepth(element)
        };
      }

      getReactComponentName(fiber) {
        let current = fiber;
        while (current) {
          if (current.type && typeof current.type === 'function') {
            return current.type.name || current.type.displayName;
          }
          if (current._owner && current._owner.type) {
            return current._owner.type.name || current._owner.type.displayName;
          }
          current = current.return || current._owner;
        }
        return null;
      }

      generateCSSSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classNameStr = typeof element.className === 'string' 
            ? element.className 
            : element.className.toString();
          const classes = classNameStr.split(' ').filter(c => c).slice(0, 2).join('.');
          return `${element.tagName.toLowerCase()}.${classes}`;
        }
        return element.tagName.toLowerCase();
      }

      generateXPath(element) {
        const path = [];
        let current = element;
        while (current && current !== document.body) {
          if (!current.tagName) {
            current = current.parentNode;
            continue;
          }
          
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector += `[@id="${current.id}"]`;
            path.unshift(selector);
            break;
          }
          const siblings = Array.from(current.parentNode?.children || []);
          const index = siblings.indexOf(current) + 1;
          if (index > 1) selector += `[${index}]`;
          path.unshift(selector);
          current = current.parentNode;
        }
        return '//' + path.join('/');
      }

      getModificationHints(element) {
        const hints = [];
        const tag = element.tagName.toLowerCase();
        
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'].includes(tag)) {
          hints.push('text', 'style');
        }
        if (tag === 'img') {
          hints.push('src', 'alt', 'style');
        }
        if (tag === 'a') {
          hints.push('href', 'text', 'style');
        }
        if (tag === 'button') {
          hints.push('text', 'onclick', 'style');
        }
        
        return hints;
      }

      getElementAttributes(element) {
        const attrs = {};
        for (const attr of element.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      }

      getElementDepth(element) {
        let depth = 0;
        let current = element;
        while (current.parentNode && current.parentNode !== document) {
          depth++;
          current = current.parentNode;
        }
        return depth;
      }

      setupEventListeners() {
        // Mouse events for component selection (same as runtime)
        document.addEventListener('mouseover', (e) => this.handleMouseOver(e), true);
        document.addEventListener('mouseout', (e) => this.handleMouseOut(e), true);
        document.addEventListener('click', (e) => this.handleClick(e), true);
        
        if (this.debugMode) {
          console.log('👂 Event listeners set up for component selection');
        }
      }

      setupBridge() {
        // Listen for commands from parent frame (same as runtime)
        window.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'phoenix-command') {
            this.handleCommand(event.data);
          }
        });
        
        if (this.debugMode) {
          console.log('🌉 Bridge communication set up');
        }
      }

      handleCommand(command) {
        if (this.debugMode) {
          console.log('📨 Received Phoenix command:', command);
        }
        
        switch (command.command) {
          case 'enable-selection':
            this.enableSelection();
            break;
          case 'disable-selection':
            this.disableSelection();
            break;
          case 'debug-phoenix-ids':
            this.debugPhoenixIds();
            break;
        }
      }

      enableSelection() {
        this.selectionEnabled = true;
        document.body.style.cursor = 'crosshair';
        document.body.setAttribute('data-phoenix-selection-active', 'true');
        
        if (this.debugMode) {
          console.log('🎯 Component selection ENABLED');
        }
        
        this.sendToParent({
          type: 'phoenix-selection-state-changed',
          enabled: true,
          timestamp: Date.now()
        });
      }

      disableSelection() {
        this.selectionEnabled = false;
        document.body.style.cursor = '';
        document.body.removeAttribute('data-phoenix-selection-active');
        
        // Remove any highlights
        document.querySelectorAll('.phoenix-highlight, .phoenix-selected').forEach(el => {
          el.classList.remove('phoenix-highlight', 'phoenix-selected');
          el.style.outline = '';
          el.style.backgroundColor = '';
        });
        
        if (this.debugMode) {
          console.log('🎯 Component selection DISABLED');
        }
        
        this.sendToParent({
          type: 'phoenix-selection-state-changed',
          enabled: false,
          timestamp: Date.now()
        });
      }

      debugPhoenixIds() {
        const phoenixElements = document.querySelectorAll('[data-phoenix-id]');
        console.log(`🔍 Phoenix Debug: Found ${phoenixElements.length} elements with Phoenix IDs`);
        console.log('🔍 Phoenix Debug: First 5 elements:', 
          Array.from(phoenixElements).slice(0, 5).map(el => ({
            id: el.getAttribute('data-phoenix-id'),
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.substring(0, 50)
          }))
        );
      }

      handleMouseOver(e) {
        if (!this.selectionEnabled) return;
        
        const target = e.target;
        const phoenixId = target.getAttribute('data-phoenix-id');
        
        if (phoenixId && target !== this.hoveredElement) {
          // Clear previous hover
          if (this.hoveredElement) {
            this.unhighlightElement(this.hoveredElement);
          }
          
          // Apply hover highlighting
          this.highlightElement(target);
          this.hoveredElement = target;
          
          // Send hover event to parent
          const trackingData = this.trackingElements.get(phoenixId);
          if (trackingData) {
            this.sendToParent({
              type: 'phoenix-element-hover',
              element: trackingData,
              boundingRect: target.getBoundingClientRect()
            });
          }
        }
      }

      handleMouseOut(e) {
        if (!this.selectionEnabled) return;
        
        const target = e.target;
        if (target === this.hoveredElement) {
          this.unhighlightElement(target);
          this.hoveredElement = null;
          this.sendToParent({ type: 'phoenix-element-unhover' });
        }
      }

      handleClick(e) {
        if (!this.selectionEnabled) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        const phoenixId = target.getAttribute('data-phoenix-id');
        
        if (!phoenixId) {
          if (this.debugMode) {
            console.log('⚠️ CLICK: Element has no Phoenix ID');
          }
          return;
        }
        
        if (this.debugMode) {
          console.log('🎯 CLICK: Phoenix element clicked:', phoenixId, {
            tagName: target.tagName,
            className: target.className,
            textContent: target.textContent?.slice(0, 50)
          });
        }
        
        // Apply selection styling
        this.forceCleanupHighlights();
        this.hoveredElement = null;
        
        target.classList.add('phoenix-selected');
        target.style.setProperty('outline', '3px solid #10b981', 'important');
        target.style.setProperty('outline-offset', '-1px', 'important');
        target.style.setProperty('background-color', 'rgba(16, 185, 129, 0.15)', 'important');
        
        // Create enhanced element data
        const elementData = this.createElementData(target);
        elementData.selectedTextContext = this.extractTextContext(target, e);
        
        // Send to parent bridge
        this.sendToParent({
          type: 'phoenix-element-click',
          element: elementData,
          clickEvent: {
            clientX: e.clientX,
            clientY: e.clientY
          },
          boundingRect: target.getBoundingClientRect(),
          timestamp: Date.now()
        });
        
        // Auto-clear selection after 3 seconds
        setTimeout(() => {
          if (target.classList.contains('phoenix-selected')) {
            target.classList.remove('phoenix-selected');
            target.style.outline = '';
            target.style.backgroundColor = '';
          }
        }, 3000);
      }

      highlightElement(element) {
        this.clearHighlights();
        element.style.outline = '2px solid #3b82f6';
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      }

      unhighlightElement(element) {
        element.style.outline = '';
        element.style.backgroundColor = '';
      }

      clearHighlights() {
        document.querySelectorAll('.phoenix-highlighted').forEach(el => {
          el.classList.remove('phoenix-highlighted');
          el.style.outline = '';
          el.style.backgroundColor = '';
        });
      }

      forceCleanupHighlights() {
        document.querySelectorAll('.phoenix-highlight, .phoenix-selected').forEach(el => {
          el.classList.remove('phoenix-highlight', 'phoenix-selected');
          el.style.outline = '';
          el.style.backgroundColor = '';
        });
      }

      extractTextContext(element, event) {
        const fullText = element.textContent || '';
        const clickedText = event.target.textContent || '';
        
        return {
          selectedText: fullText.trim(),
          fullText: fullText,
          clickedElementText: clickedText,
          textOffset: 0,
          textLength: fullText.length,
          wordPosition: 0,
          lineNumber: 1,
          hasText: fullText.trim().length > 0,
          isTextElement: element.childNodes.length > 0 && Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE),
          clickPosition: {
            x: event.clientX,
            y: event.clientY
          },
          textBoundingRect: element.getBoundingClientRect(),
          extractionMethod: 'phoenix-build-time',
          extractedAt: new Date().toISOString()
        };
      }

      sendToParent(data) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(data, this.targetOrigin);
          
          if (this.debugMode) {
            console.log('📡 Sent to parent:', data.type, data);
          }
        }
      }
    }

    // Initialize tracking client
    window.__PHOENIX_TRACKING__ = new PhoenixTrackingClient();
    
    // Export for debugging
    window.PhoenixTrackingClient = PhoenixTrackingClient;
    
    // No modal - controlled by frontend app toggle
    
    console.log('✅ Phoenix Build-Time Tracking Client loaded successfully');
    
  } else {
    console.log('🚫 Phoenix Tracking disabled (not in browser environment)');
  }

})();