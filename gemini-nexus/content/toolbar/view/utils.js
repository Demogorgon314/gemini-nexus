

// content/toolbar/view/utils.js
(function() {
    /**
     * Shared Utility for Positioning Elements
     */
    window.GeminiViewUtils = {
        positionElement: function(el, rect, isLargerWindow, isPinned, mousePoint, preferTop = false) {
            // Do not reposition if pinned and already visible
            if (isPinned && el.classList.contains('visible')) return;

            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // 1. Get Dimensions
            let width = el.offsetWidth;
            let height = el.offsetHeight;

            // Fallback for hidden elements (estimate dimensions)
            if (width === 0 || height === 0) {
                width = isLargerWindow ? 400 : 220;
                height = isLargerWindow ? 300 : 40;
            }

            const padding = 10;
            const offset = 12; // Gap between selection and toolbar

            // Check if rect is valid (has dimensions)
            const isValidRect = rect && rect.width > 0 && rect.height > 0;

            // --- For Small Toolbar: Position relative to the selection rect ---
            let anchorX, anchorY;

            if (!isLargerWindow && isValidRect) {
                // Use selection rect: center horizontally
                anchorX = rect.left + (rect.width / 2);
                // If preferTop, anchor to top of rect; otherwise anchor to bottom
                anchorY = preferTop ? rect.top : rect.bottom;
            } else if (mousePoint) {
                anchorX = mousePoint.x;
                anchorY = mousePoint.y;
            } else if (isValidRect) {
                anchorX = rect.right;
                anchorY = preferTop ? rect.top : rect.bottom;
            } else {
                anchorX = vw / 2;
                anchorY = vh / 2;
            }

            // --- Calculate Visual Position (Top-Left corner of Element) ---
            let visualLeft, visualTop;

            if (!isLargerWindow && isValidRect) {
                // Small Toolbar: Center horizontally
                visualLeft = anchorX - (width / 2);
                if (preferTop) {
                    // Position ABOVE the rect
                    visualTop = anchorY - height - offset;
                    el.classList.remove('placed-bottom');
                    el.classList.add('placed-top');
                } else {
                    // Position BELOW the rect
                    visualTop = anchorY + offset;
                    el.classList.remove('placed-top');
                    el.classList.add('placed-bottom');
                }
            } else {
                // Default Preference: Bottom-Right of Cursor
                visualLeft = anchorX + offset;
                visualTop = anchorY + offset;
            }

            // --- Horizontal Boundary Logic ---
            // If toolbar extends past right edge
            if (visualLeft + width > vw - padding) {
                visualLeft = vw - width - padding; // Pin to right edge of screen
            }
            // If toolbar extends past left edge
            if (visualLeft < padding) {
                visualLeft = padding; // Pin to left edge of screen
            }

            // --- Vertical Boundary Logic ---
            if (preferTop) {
                // If preferTop and toolbar extends past top edge, flip to bottom
                if (visualTop < padding) {
                    if (!isLargerWindow && isValidRect) {
                        visualTop = rect.bottom + offset;
                        el.classList.remove('placed-top');
                        el.classList.add('placed-bottom');
                    } else {
                        visualTop = padding;
                    }
                }
            } else {
                // If toolbar extends past bottom edge, flip to top
                if (visualTop + height > vh - padding) {
                    if (!isLargerWindow && isValidRect) {
                        visualTop = rect.top - height - offset;
                        el.classList.remove('placed-bottom');
                        el.classList.add('placed-top');
                    } else {
                        visualTop = anchorY - height - offset;
                    }

                    // If flipping top pushes it off top screen
                    if (visualTop < padding) {
                        visualTop = vh - height - padding; // Pin to bottom edge of screen
                    }
                }
            }

            // --- Apply Coordinates ---

            if (!isLargerWindow) {
                // Small Toolbar: Use left position directly (no transform centering needed now)
                el.style.left = `${visualLeft + scrollX}px`;
                el.style.top = `${visualTop + scrollY}px`;
            } else {
                // Ask Window: Fixed positioning, no transform centering.
                el.style.left = `${visualLeft}px`;
                el.style.top = `${visualTop}px`;
            }
        },

        resizeSelect: function(select) {
            if (!select) return;
            const span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.fontSize = '13px'; // Match CSS
            span.style.fontWeight = '500'; // Match CSS
            span.style.fontFamily = window.getComputedStyle(select).fontFamily;
            span.style.whiteSpace = 'nowrap';
            span.textContent = select.options[select.selectedIndex].text;
            
            if (select.parentNode) {
                select.parentNode.appendChild(span);
                const width = span.getBoundingClientRect().width;
                select.parentNode.removeChild(span);
                
                // Add padding (12px * 2 = 24px) + increased buffer (10px) = 34px
                select.style.width = `${width + 34}px`;
            }
        }
    };
})();
