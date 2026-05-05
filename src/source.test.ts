import { describe, expect, it } from 'vitest';

import { buildTwigIncludeSource, buildTwigSourceParameters, toTwigValue } from './source';

describe('toTwigValue', () => {
  it('serializes scalar values', () => {
    expect(toTwigValue('Save')).toBe("'Save'");
    expect(toTwigValue(true)).toBe('true');
    expect(toTwigValue(false)).toBe('false');
    expect(toTwigValue(12)).toBe('12');
    expect(toTwigValue(null)).toBe('null');
    expect(toTwigValue(undefined)).toBe('null');
  });

  it('escapes Twig strings', () => {
    expect(toTwigValue("Bob's button")).toBe("'Bob\\'s button'");
    expect(toTwigValue('C:\\Temp')).toBe("'C:\\\\Temp'");
  });

  it('serializes arrays and objects', () => {
    expect(
      toTwigValue({
        text: 'Copy link',
        active: true,
        items: ['Buy', 'Rent'],
        'aria-label': 'Copy link',
      }),
    ).toBe("{ text: 'Copy link', active: true, items: ['Buy', 'Rent'], 'aria-label': 'Copy link' }");
  });
});

describe('buildTwigIncludeSource', () => {
  it('builds a Twig include with args and only by default', () => {
    expect(
      buildTwigIncludeSource({
        template: 'Components/Atoms/Button/button.html.twig',
        args: {
          text: 'Save',
          type: 'primary',
          disabled: false,
        },
      }),
    ).toBe(`{% include 'Components/Atoms/Button/button.html.twig' with {
  text: 'Save',
  type: 'primary',
  disabled: false,
} only %}`);
  });

  it('can build includes without only', () => {
    expect(
      buildTwigIncludeSource({
        template: 'button.html.twig',
        args: { text: 'Save' },
        only: false,
      }),
    ).toBe(`{% include 'button.html.twig' with {
  text: 'Save',
} %}`);
  });

  it('builds compact includes when no args are provided', () => {
    expect(buildTwigIncludeSource({ template: 'button.html.twig' })).toBe("{% include 'button.html.twig' only %}");
    expect(buildTwigIncludeSource({ template: 'button.html.twig', only: false })).toBe(
      "{% include 'button.html.twig' %}",
    );
  });
});

describe('buildTwigSourceParameters', () => {
  it('builds a parameters.twig compatible object', () => {
    expect(
      buildTwigSourceParameters({
        template: 'Components/Atoms/Button/button.html.twig',
        args: { text: 'Save' },
        copy: false,
      }),
    ).toEqual({
      fileName: 'button.html.twig',
      source: `{% include 'Components/Atoms/Button/button.html.twig' with {
  text: 'Save',
} only %}`,
      showLineNumbers: undefined,
      wrapLines: undefined,
      copy: false,
    });
  });

  it('allows an explicit file name', () => {
    expect(
      buildTwigSourceParameters({
        template: 'Components/Atoms/Button/button.html.twig',
        fileName: 'custom.twig',
      }).fileName,
    ).toBe('custom.twig');
  });
});
