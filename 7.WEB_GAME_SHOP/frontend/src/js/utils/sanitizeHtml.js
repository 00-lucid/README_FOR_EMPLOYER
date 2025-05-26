import DOMPurify from 'dompurify';
import React from 'react';

const sanitizeHtml = (html, {className})=>{
  return React.createElement('div', {dangerouslySetInnerHTML: {__html: DOMPurify.sanitize(html)}, className})
}

export default sanitizeHtml