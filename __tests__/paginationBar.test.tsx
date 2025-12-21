import type { ReactElement } from 'react';
import { act, create } from 'react-test-renderer';

import { PaginationBar } from '../src/components/PaginationBar';

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

function render(element: ReactElement) {
  let tree: ReturnType<typeof create> | null = null;
  act(() => {
    tree = create(element);
  });
  return tree as ReturnType<typeof create>;
}

test('renders paged range text as X–Y of Z', () => {
  const tree = render(
    <PaginationBar
      mode="paged"
      page={2}
      totalPages={3}
      pageSize={50}
      totalCount={120}
      maxNumericButtons={5}
    />
  );

  expect(tree.root.findByProps({ testID: 'pagination-range' }).props.children).toBe('Showing results 51–100 of 120');
});

test('disables prev on page 1 and disables next on last page', () => {
  const tree = render(
    <PaginationBar
      mode="paged"
      page={1}
      totalPages={2}
      pageSize={50}
      totalCount={60}
      maxNumericButtons={5}
    />
  );

  expect(tree.root.findByProps({ testID: 'pagination-prev' }).props.disabled).toBe(true);
  expect(tree.root.findByProps({ testID: 'pagination-next' }).props.disabled).toBe(false);

  act(() => {
    tree.update(
      <PaginationBar
        mode="paged"
        page={2}
        totalPages={2}
        pageSize={50}
        totalCount={60}
        maxNumericButtons={5}
      />
    );
  });

  expect(tree.root.findByProps({ testID: 'pagination-prev' }).props.disabled).toBe(false);
  expect(tree.root.findByProps({ testID: 'pagination-next' }).props.disabled).toBe(true);
});

test('caps numeric page buttons to 5 and includes current page plus last page', () => {
  const tree = render(
    <PaginationBar
      mode="paged"
      page={10}
      totalPages={20}
      pageSize={50}
      totalCount={1000}
      maxNumericButtons={5}
    />
  );

  const numericButtons = tree.root.findAll(
    (node: any) =>
      typeof node.props.testID === 'string' &&
      node.props.testID.startsWith('pagination-page-') &&
      typeof node.props.onPress === 'function'
  );

  expect(numericButtons).toHaveLength(5);
  expect(tree.root.findByProps({ testID: 'pagination-page-10' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'pagination-page-20' })).toBeTruthy();
});

test('jump-to-page is hidden by default and revealed via …, then shows validation error for out-of-range input', () => {
  const tree = render(
    <PaginationBar
      mode="paged"
      page={1}
      totalPages={10}
      pageSize={50}
      totalCount={500}
      maxNumericButtons={5}
      onSelectPage={() => undefined}
    />
  );

  expect(tree.root.findAllByProps({ testID: 'pagination-jump-input' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'pagination-ellipsis' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'pagination-ellipsis' }).props.onPress();
  });

  act(() => {
    tree.root.findByProps({ testID: 'pagination-jump-input' }).props.onChangeText('999');
  });

  act(() => {
    tree.root.findByProps({ testID: 'pagination-jump-go' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'pagination-jump-error' }).props.children).toContain('between 1 and 10');
});
