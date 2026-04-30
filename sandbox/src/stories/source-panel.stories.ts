import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Twig Source/Docs Source',
  render: () => React.createElement('div', { className: 'preview' }, 'Docs source fixture'),
  parameters: {
    docs: {
      source: {
        code: `{% set headline = 'Storybook Twig' %}
<section class="hero">
  <h1>{{ headline }}</h1>
</section>`,
        language: 'twig',
      },
    },
    twig: {
      fileName: 'hero.html.twig',
      source: `{% set headline = 'Storybook Twig' %}
<section class="hero">
  <h1>{{ headline }}</h1>
</section>`,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DocsSource: Story = {};

export const SecondDocsPreview: Story = {
  parameters: {
    twig: {
      fileName: 'second.html.twig',
      source: `{% for product in products %}
  <article>{{ product.name }}</article>
{% else %}
  <p>No products.</p>
{% endfor %}`,
    },
  },
};
