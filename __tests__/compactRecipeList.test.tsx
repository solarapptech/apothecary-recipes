import type { ReactElement } from 'react';
import { act, create } from 'react-test-renderer';
import { View } from 'react-native';

import type { RecipeRow } from '../src/repositories/recipesRepository';
import { getRecipeImageSource } from '../src/assets/getRecipeImageSource';

jest.mock('../src/assets/getRecipeImageSource', () => ({
  getRecipeImageSource: jest.fn(),
}));

const mockedGetRecipeImageSource = getRecipeImageSource as jest.MockedFunction<typeof getRecipeImageSource>;
const mockScrollToIndex = jest.fn();

beforeEach(() => {
  mockedGetRecipeImageSource.mockImplementation((recipeId: number) => ({ uri: `test://recipe-${recipeId}` }));
  mockScrollToIndex.mockClear();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

function loadDashboardScreenWithFlashListMock(): typeof import('../src/screens/DashboardScreen').DashboardScreen {
  jest.doMock('@shopify/flash-list', () => {
    const React = require('react');
    const { View } = require('react-native');

    const FlashList = React.forwardRef(({ data, keyExtractor, renderItem, ...rest }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        scrollToIndex: mockScrollToIndex,
      }));

      return React.createElement(
        View,
        { testID: 'flash-list', ...rest },
        data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          return React.createElement(React.Fragment, { key }, renderItem({ item, index }));
        })
      );
    });

    return { FlashList };
  });

  const ReactNative = require('react-native') as typeof import('react-native');
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
    width: 360,
    height: 800,
    scale: 1,
    fontScale: 1,
  });

  const { DashboardScreen } = require('../src/screens/DashboardScreen') as typeof import('../src/screens/DashboardScreen');
  return DashboardScreen;
}

function render(element: ReactElement) {
  let tree: ReturnType<typeof create> | null = null;
  act(() => {
    tree = create(element);
  });
  return tree as ReturnType<typeof create>;
}

function createRecipes(count = 1): RecipeRow[] {
  return Array.from({ length: count }, (_value, index) => {
    const id = index + 1;
    return {
      id,
      randomKey: id,
      isPremium: 0,
      imageLocalPath: null,
      title:
        id === 1
          ? 'Very Long Recipe Title That Should Shrink To Fit Instead Of Ellipsizing On Narrow Screens'
          : `Recipe ${id}`,
      difficultyScore: 3,
      preparationTime: '10 min',
      description:
        id === 1
          ? 'This is a long description that is intended to exceed the truncation threshold so that the Read more control will appear in the list-big view. '.repeat(
              3
            )
          : `desc ${id}`,
      timePeriod: `time ${id}`,
      warning: `warn ${id}`,
      region: `region ${id}`,
      usedFor: `usedFor ${id}`,
      historicalContext: `history ${id}`,
      scientificEvidence: `evidence ${id}`,
      ingredients: `ingredients ${id}`,
      detailedMeasurements: `detailedMeasurements ${id}`,
      preparationSteps: `preparationSteps ${id}`,
      usage: `usage ${id}`,
    };
  });
}

function textFromChildren(children: unknown): string {
  if (Array.isArray(children)) {
    return children
      .map((value) => (typeof value === 'string' || typeof value === 'number' ? String(value) : ''))
      .join('');
  }
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  return '';
}

test('renders compact recipe rows inside FlashList and uses tail truncation for title', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes();

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  expect(tree.root.findByProps({ testID: 'flash-list' })).toBeTruthy();
  const thumbNode = tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' });
  expect(thumbNode).toBeTruthy();
  expect(thumbNode.props.source).toBeTruthy();

  const titleNode = tree.root.findByProps({ testID: 'compact-recipe-row-title-1' });
  expect(titleNode.props.numberOfLines).toBe(1);
  expect(titleNode.props.adjustsFontSizeToFit).toBeFalsy();
  expect(titleNode.props.ellipsizeMode).toBe('tail');
});

test('renders difficulty and preparation time in dedicated slots', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes();

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  const difficultyNode = tree.root.findByProps({ testID: 'compact-recipe-row-difficulty-1' });
  const timeNode = tree.root.findByProps({ testID: 'compact-recipe-row-time-1' });

  const difficultyTextNodes = difficultyNode.findAllByType(require('react-native').Text);
  expect(difficultyTextNodes.length).toBeGreaterThan(0);
  expect(textFromChildren(difficultyTextNodes[0].props.children)).toContain('Hard');

  const timeTextNodes = timeNode.findAllByType(require('react-native').Text);
  expect(timeTextNodes.length).toBeGreaterThan(0);
  expect(textFromChildren(timeTextNodes[0].props.children)).toContain('10 min');
});

test('renders list-big rows when viewMode is list-big', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes();

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
    />
  );

  expect(tree.root.findByProps({ testID: 'flash-list' })).toBeTruthy();
  const thumbNode = tree.root.findByProps({ testID: 'list-big-recipe-row-thumb-1' });
  expect(thumbNode).toBeTruthy();
  expect(thumbNode.props.source).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-field-difficulty-1' }).length).toBeGreaterThan(0);
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-field-prep-time-1' }).length).toBeGreaterThan(0);
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-collapse-1' })).toHaveLength(0);
});

test('list-big view auto-scrolls to the newly opened recipe when switching focus collapses another expanded recipe', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(2);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={2}
      viewMode="list-big"
      closeAsYouTapEnabled={true}
      autoScrollEnabled={true}
    />
  );

  // Expand recipe 1
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0, viewOffset: 12 });
  mockScrollToIndex.mockClear();

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Expand recipe 2 (closes 1, content shifts) -> should auto-scroll to 2
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-2' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 1, animated: true, viewPosition: 0, viewOffset: 12 });
  jest.useRealTimers();
});

test('list-big view performs a correction scroll after layout settles', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
      autoScrollEnabled={true}
      reduceMotionEnabled={false}
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0, viewOffset: 12 });

  act(() => {
    jest.advanceTimersByTime(600);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: false, viewPosition: 0, viewOffset: 12 });

  jest.useRealTimers();
});

test('manual scrolling cancels pending auto-scroll in list-big view', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
      autoScrollEnabled={true}
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    tree.root.findByProps({ testID: 'flash-list' }).props.onScrollBeginDrag();
  });

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(mockScrollToIndex).not.toHaveBeenCalled();
  jest.useRealTimers();
});

test('compact list correction scroll is not canceled by programmatic momentum events', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
      autoScrollEnabled={true}
      reduceMotionEnabled={false}
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });

  act(() => {
    jest.advanceTimersByTime(60);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0.1 });

  // Simulate a momentum begin event that might be emitted by the programmatic scroll.
  act(() => {
    tree.root.findByProps({ testID: 'flash-list' }).props.onMomentumScrollBegin?.();
  });

  act(() => {
    jest.advanceTimersByTime(600);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: false, viewPosition: 0.1 });

  jest.useRealTimers();
});

test('toggles inline expansion in list mode and allows multiple expanded items', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(2);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={2}
      viewMode="list"
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'compact-recipe-row-thumb-1' })).toHaveLength(0);

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-2' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-2' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'compact-recipe-row-thumb-1' })).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'compact-recipe-row-thumb-2' })).toHaveLength(0);

  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-minimize-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-2' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-1' })).toHaveLength(0);
});

test('compact list auto-scrolls when expanding a recipe for the first time', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
      autoScrollEnabled={true}
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0.1 });
  jest.useRealTimers();
});

test('clears grayout state when focusResetNonce changes', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(2);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={2}
      viewMode="list"
      focusResetNonce={0}
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  const compactRow2Before = tree.root.findByProps({ testID: 'compact-recipe-row-2' });
  expect(Array.isArray(compactRow2Before.props.style)).toBe(true);
  expect(compactRow2Before.props.style[1]).toBeTruthy();

  act(() => {
    tree.update(
      <DashboardScreen
        title="Apothecary Recipes"
        headerRight={<View />}
        controls={<View />}
        footer={<View />}
        recipes={recipes}
        totalCount={2}
        viewMode="list"
        focusResetNonce={1}
      />
    );
  });

  const compactRow2After = tree.root.findByProps({ testID: 'compact-recipe-row-2' });
  expect(Array.isArray(compactRow2After.props.style)).toBe(true);
  expect(compactRow2After.props.style[1]).toBeFalsy();
  expect(tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' })).toBeTruthy();
});

test('list view expanded items toggle details mode via + more info button', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);

  // + more info button should be present in collapsed view
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-more-info-1' }).length).toBeGreaterThan(0);

  // Tap + more info to enter details mode
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-more-info-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Tap Show Less to collapse details
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-show-less-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);

  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-minimize-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' })).toBeTruthy();
});

test('list view collapses details via tapping the title zone (expanded row stays expanded)', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
      autoScrollEnabled={true}
    />
  );

  // Expand from compact to list-big
  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });

  // Enter details mode via + more info button
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-more-info-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Collapse details mode by tapping the title zone
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-title-pressable-1' }).props.onPress({
      stopPropagation: () => {},
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0.1 });
  jest.useRealTimers();
});

test('list view minimize folds details back to summary first, then collapses to compact row', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  // Expand
  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();

  // Enter details mode via + more info button
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-more-info-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Minimize while details mode is active: should fold first (details removed), but stay expanded briefly
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-minimize-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'compact-recipe-row-thumb-1' })).toHaveLength(0);

  // Second minimize tap: should now collapse to the compact row
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-minimize-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-1' })).toHaveLength(0);
});

test('list view expanded items with details mode collapse back to 2-field summary via Show Less (and minimize collapses to compact row)', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress();
  });

  // Enter details mode via + more info button
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-more-info-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Tap Show Less - should collapse details back to summary fields
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-show-less-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  // Verify details mode is NOT active
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);

  // Now tap minimize (collapse to compact row)
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-minimize-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'compact-recipe-row-thumb-1' })).toBeTruthy();
});

test('list-big view items enter details mode via tapping the card, but do not collapse when already showing details', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
    />
  );

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);

  // Tap card: enter details mode
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Tap card again: should NOT exit details mode
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();
});

test('list-big view only allows expanding/closing the image when the recipe is focused (details shown)', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
    />
  );

  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-image-modal-overlay-1' })).toHaveLength(0);

  // Tap thumbnail while not focused -> should focus (enter details) but NOT open the image modal.
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-thumb-pressable-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-image-modal-overlay-1' })).toHaveLength(0);

  // Tap thumbnail again while focused -> should open the image modal.
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-thumb-pressable-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-image-modal-overlay-1' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-image-modal-image-1' })).toBeTruthy();

  // While focused, tapping the overlay should close the modal.
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-image-modal-overlay-1' }).props.onPress();
  });

  expect(tree.root.findAllByProps({ testID: 'list-big-recipe-row-image-modal-overlay-1' })).toHaveLength(0);
});

test('grid tiles toggle expanded state and allow multiple expanded items', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(2);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={2}
      viewMode="grid"
    />
  );

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-grid-recipe-toggle-1' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  expect(tree.root.findByProps({ testID: 'recipe-grid-tile-expanded-1' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-grid-recipe-toggle-2' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  expect(tree.root.findByProps({ testID: 'recipe-grid-tile-expanded-1' })).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'recipe-grid-tile-expanded-2' })).toBeTruthy();

  act(() => {
    tree.root.findByProps({ testID: 'dashboard-grid-recipe-toggle-1' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  expect(tree.root.findAllByProps({ testID: 'recipe-grid-tile-expanded-1' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'recipe-grid-tile-expanded-2' })).toBeTruthy();
});

test('grid tiles pass responsive numColumns to FlashList', () => {
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="grid"
    />
  );

  const flashList = tree.root.findByProps({ testID: 'flash-list' });
  expect(flashList.props.numColumns).toBe(2);
  const thumbNode = tree.root.findByProps({ testID: 'recipe-grid-tile-thumb-1' });
  expect(thumbNode).toBeTruthy();
  expect(thumbNode.props.source).toBeTruthy();
  expect(tree.root.findByProps({ testID: 'recipe-grid-tile-title-1' }).props.adjustsFontSizeToFit).toBeFalsy();
});

test('falls back to placeholder when recipe image source is missing', () => {
  mockedGetRecipeImageSource.mockReturnValue(null);

  const DashboardScreen = loadDashboardScreenWithFlashListMock();

  const recipes: RecipeRow[] = [
    {
      id: 999,
      randomKey: 999,
      isPremium: 0,
      imageLocalPath: null,
      title: 'Recipe 999',
      difficultyScore: 3,
      preparationTime: '10 min',
      description: 'desc',
      timePeriod: 'time',
      warning: 'warn',
      region: 'region',
      usedFor: 'usedFor',
      historicalContext: 'history',
      scientificEvidence: 'evidence',
      ingredients: 'ingredients',
      detailedMeasurements: 'measurements',
      preparationSteps: 'steps',
      usage: 'usage',
    },
  ];

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  const thumbNode = tree.root.findByProps({ testID: 'compact-recipe-row-thumb-999' });
  expect(thumbNode.props.source).toBeUndefined();
  expect(tree.root.findAllByProps({ accessibilityLabel: 'Recipe image placeholder' }).length).toBeGreaterThan(0);
});

test('auto-scrolls to the recipe when collapsing details via Show Less in list view (expanded row)', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list"
    />
  );

  // 1. Simulate scroll
  const flashList = tree.root.findByProps({ testID: 'flash-list' });
  act(() => {
    flashList.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 150 },
      },
    });
  });

  // 2. Expand item
  act(() => {
    tree.root.findByProps({ testID: 'dashboard-recipe-toggle-1' }).props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  });

  // 3. Enter details mode via + more info button
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-more-info-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // 4. Collapse details via Show Less -> should auto-scroll to keep this recipe visible
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-show-less-1' }).props.onPress({
      stopPropagation: () => {},
    });
  });

  act(() => {
    jest.advanceTimersByTime(60);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0.1 });
  jest.useRealTimers();
});

test('auto-scrolls to the recipe when collapsing details via tapping the title zone in list-big view', () => {
  jest.useFakeTimers();
  const DashboardScreen = loadDashboardScreenWithFlashListMock();
  const recipes = createRecipes(1);

  const tree = render(
    <DashboardScreen
      title="Apothecary Recipes"
      headerRight={<View />}
      controls={<View />}
      footer={<View />}
      recipes={recipes}
      totalCount={1}
      viewMode="list-big"
      autoScrollEnabled={true}
    />
  );

  // Tap card: enter details mode
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-1' }).props.onPress({
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });
  expect(tree.root.findByProps({ testID: 'list-big-recipe-row-details-mode-1' })).toBeTruthy();

  // Tap title zone: exit details mode -> should auto-scroll to keep this recipe visible
  act(() => {
    tree.root.findByProps({ testID: 'list-big-recipe-row-title-pressable-1' }).props.onPress({
      stopPropagation: () => {},
      nativeEvent: { locationX: 0, locationY: 0 },
    });
  });

  act(() => {
    jest.advanceTimersByTime(140);
  });

  expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 0, animated: true, viewPosition: 0, viewOffset: 12 });
  jest.useRealTimers();
});
