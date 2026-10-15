import { isPlainLeftClick } from './plain-left-click';

const click = (init: MouseEventInit = {}) => new MouseEvent('click', init);

describe('isPlainLeftClick', () => {
  it('accepts an unmodified left click', () => {
    expect(isPlainLeftClick(click())).toBe(true);
    expect(isPlainLeftClick(click({ button: 0 }))).toBe(true);
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
  ])('rejects a left click with %s held', (_name, init) => {
    expect(isPlainLeftClick(click(init))).toBe(false);
  });

  it.each([
    ['middle', 1],
    ['right', 2],
    ['back', 3],
    ['forward', 4],
  ])('rejects the %s button', (_name, button) => {
    expect(isPlainLeftClick(click({ button }))).toBe(false);
  });

  it('rejects a click that has both a modifier and another button', () => {
    expect(isPlainLeftClick(click({ button: 1, ctrlKey: true }))).toBe(false);
  });
});
