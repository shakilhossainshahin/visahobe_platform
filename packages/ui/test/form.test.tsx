import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input, Select, Textarea } from '../src/components/Form/index.js';

describe('Form Primitives (Input, Select, Textarea)', () => {
  describe('Input', () => {
    it('should render input with accessible label and required asterisk', () => {
      const html = renderToStaticMarkup(
        <Input id="passport" label="Passport Number" required placeholder="A12345678" />,
      );
      expect(html).toContain('for="passport"');
      expect(html).toContain('Passport Number');
      expect(html).toContain('id="passport"');
      expect(html).toContain('required=""');
      expect(html).toContain('aria-required="true"');
      expect(html).toContain('*');
    });

    it('should render error message with role="alert" and aria-invalid="true"', () => {
      const html = renderToStaticMarkup(
        <Input
          id="email"
          label="Email Address"
          errorMessage="Please provide a valid work email address"
        />,
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('aria-describedby="email-error"');
      expect(html).toContain('Please provide a valid work email address');
      expect(html).toContain('border-[#B91C1C]');
    });

    it('should render helper text with aria-describedby', () => {
      const html = renderToStaticMarkup(
        <Input
          id="phone"
          label="Mobile Phone"
          helperText="Include country calling code (e.g. +880)"
        />,
      );
      expect(html).toContain('aria-describedby="phone-helper"');
      expect(html).toContain('Include country calling code (e.g. +880)');
    });

    it('should render prefix and suffix icons', () => {
      const html = renderToStaticMarkup(
        <Input
          prefixIcon={<span data-testid="prefix-icon">$</span>}
          suffixIcon={<span data-testid="suffix-icon">USD</span>}
        />,
      );
      expect(html).toContain('data-testid="prefix-icon"');
      expect(html).toContain('data-testid="suffix-icon"');
      expect(html).toContain('pl-10');
      expect(html).toContain('pr-10');
    });
  });

  describe('Select', () => {
    it('should render options and accessible chevron', () => {
      const options = [
        { value: 'student', label: 'Student Visa (Subclass 500)' },
        { value: 'skilled', label: 'Skilled Independent (Subclass 189)' },
      ];
      const html = renderToStaticMarkup(
        <Select
          id="visa-type"
          label="Visa Type"
          options={options}
          placeholder="Select visa category"
        />,
      );
      expect(html).toContain('for="visa-type"');
      expect(html).toContain('Select visa category');
      expect(html).toContain('Student Visa (Subclass 500)');
      expect(html).toContain('Skilled Independent (Subclass 189)');
    });

    it('should render error message on Select', () => {
      const html = renderToStaticMarkup(
        <Select id="country" label="Country" errorMessage="Destination country is required" />,
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('Destination country is required');
    });
  });

  describe('Textarea', () => {
    it('should render textarea with customizable rows and label', () => {
      const html = renderToStaticMarkup(
        <Textarea id="bio" label="Statement of Purpose" rows={6} helperText="Maximum 500 words" />,
      );
      expect(html).toContain('for="bio"');
      expect(html).toContain('Statement of Purpose');
      expect(html).toContain('rows="6"');
      expect(html).toContain('Maximum 500 words');
    });

    it('should render error on Textarea', () => {
      const html = renderToStaticMarkup(
        <Textarea id="notes" label="Notes" errorMessage="Notes exceed limit" />,
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('Notes exceed limit');
    });
  });
});
