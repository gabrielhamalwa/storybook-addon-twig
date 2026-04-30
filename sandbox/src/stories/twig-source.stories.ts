import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Twig Source/Panel',
  render: (args) => {
    return React.createElement('div', {
      dangerouslySetInnerHTML: {
        __html: `<button class="button button--${args.variant}">${args.label}</button>`,
      },
    });
  },
  args: {
    label: 'Save',
    variant: 'primary',
  },
  parameters: {
    twig: {
      fileName: 'button.twig',
      source: `<button class="button button--{{ variant|default('primary') }}" type="{{ type|default('button') }}">
  {% if icon is defined %}
    <span class="button__icon">{{ icon }}</span>
  {% endif %}
  <span class="button__label">{{ label }}</span>
</button>`,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const EmptySource: Story = {
  parameters: {
    twig: {
      fileName: 'empty.twig',
      source: '',
    },
  },
};

export const MalformedSource: Story = {
  parameters: {
    twig: {
      fileName: 'malformed.twig',
      source: `{% if user %}
  <p>{{ user.name }}</p>
{% for item in items %}
  <span>{{ item.title }}</span>`,
    },
  },
};

export const LongTemplate: Story = {
  parameters: {
    twig: {
      fileName: 'nested-layout.html.twig',
      source: `{% extends 'base.html.twig' %}

{% block body %}
  <article class="card" data-controller="card">
    <style>
      .card { display: grid; gap: 1rem; }
    </style>

    <script>
      window.dispatchEvent(new CustomEvent('card:ready'));
    </script>

    {% for item in items %}
      {% include 'button.twig' with {
        label: item.title,
        variant: loop.first ? 'primary' : 'secondary'
      } only %}
    {% else %}
      <p>No items were found.</p>
    {% endfor %}
  </article>
{% endblock %}`,
    },
  },
};
