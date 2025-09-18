/**
 * ESLint Rule: no-hardcoded-font-sizes
 * Prevents hardcoded font sizes and enforces C4R 7-size font system
 */

const APPROVED_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '32px',  // px
  '0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '2rem',  // rem
  '0.75em', '0.875em', '1em', '1.125em', '1.25em', '1.5em', '2em'  // em
];

const FONT_SIZE_TO_TAILWIND = {
  '12px': 'text-xs',
  '14px': 'text-sm', 
  '16px': 'text-base',
  '18px': 'text-lg',
  '20px': 'text-xl',
  '24px': 'text-2xl',
  '32px': 'text-3xl',
  '0.75rem': 'text-xs',
  '0.875rem': 'text-sm',
  '1rem': 'text-base',
  '1.125rem': 'text-lg',
  '1.25rem': 'text-xl',
  '1.5rem': 'text-2xl',
  '2rem': 'text-3xl',
  '0.75em': 'text-xs',
  '0.875em': 'text-sm',
  '1em': 'text-base',
  '1.125em': 'text-lg',
  '1.25em': 'text-xl',
  '1.5em': 'text-2xl',
  '2em': 'text-3xl'
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded font sizes outside of approved C4R system',
      category: 'Best Practices',
      recommended: true
    },
    fixable: 'code',
    schema: [],
    messages: {
      hardcodedFontSize: 'Hardcoded font-size "{{size}}" is not allowed. Use Tailwind class "{{tailwindClass}}" instead.',
      unapprovedFontSize: 'Font size "{{size}}" is not in the approved C4R 7-size system. Use one of: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl'
    }
  },

  create(context) {
    function checkFontSize(node, property, value) {
      if (property !== 'fontSize' && property !== 'font-size') {
        return;
      }

      // Extract font size from different node types
      let fontSize = null;
      
      if (value.type === 'Literal') {
        fontSize = value.value;
      } else if (value.type === 'TemplateLiteral' && value.quasis.length === 1) {
        fontSize = value.quasis[0].value.cooked;
      }

      if (!fontSize || typeof fontSize !== 'string') {
        return;
      }

      // Remove quotes if present
      fontSize = fontSize.replace(/['"]/g, '');

      // Check if it's a font size value (ends with px, rem, em, or is a number)
      const fontSizeRegex = /^[\d.]+(?:px|rem|em)$/;
      if (!fontSizeRegex.test(fontSize)) {
        return; // Not a font size we care about
      }

      const tailwindClass = FONT_SIZE_TO_TAILWIND[fontSize];
      
      if (tailwindClass) {
        // Approved size but using hardcoded value
        context.report({
          node: value,
          messageId: 'hardcodedFontSize',
          data: {
            size: fontSize,
            tailwindClass: tailwindClass
          },
          fix(fixer) {
            // For JSX, suggest adding to className instead
            if (node.type === 'JSXExpressionContainer') {
              return null; // Can't auto-fix JSX, requires manual intervention
            }
            
            // For CSS-in-JS, replace with CSS custom property or comment
            return fixer.replaceText(value, `"/* Use ${tailwindClass} in className */"`);
          }
        });
      } else {
        // Unapproved font size
        context.report({
          node: value,
          messageId: 'unapprovedFontSize',
          data: {
            size: fontSize
          }
        });
      }
    }

    return {
      // Handle CSS-in-JS objects (sx prop, styled-components, etc.)
      Property(node) {
        if (node.key.type === 'Identifier') {
          checkFontSize(node, node.key.name, node.value);
        } else if (node.key.type === 'Literal') {
          checkFontSize(node, node.key.value, node.value);
        }
      },

      // Handle JSX style attributes
      JSXAttribute(node) {
        if (node.name.name === 'style' && node.value?.expression?.type === 'ObjectExpression') {
          node.value.expression.properties.forEach(prop => {
            if (prop.type === 'Property') {
              const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
              checkFontSize(node.value, key, prop.value);
            }
          });
        }
      },

      // Handle template literals with CSS
      TemplateLiteral(node) {
        const cssContent = node.quasis.map(quasi => quasi.value.cooked).join('');
        const fontSizeRegex = /font-size:\s*([^;}\s]+)/g;
        let match;
        
        while ((match = fontSizeRegex.exec(cssContent)) !== null) {
          const fontSize = match[1].trim();
          const tailwindClass = FONT_SIZE_TO_TAILWIND[fontSize];
          
          if (tailwindClass) {
            context.report({
              node,
              messageId: 'hardcodedFontSize',
              data: {
                size: fontSize,
                tailwindClass: tailwindClass
              }
            });
          } else if (/^[\d.]+(?:px|rem|em)$/.test(fontSize)) {
            context.report({
              node,
              messageId: 'unapprovedFontSize',
              data: {
                size: fontSize
              }
            });
          }
        }
      }
    };
  }
};