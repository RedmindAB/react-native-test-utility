# react-native-test-utility
Utility package for testing react-native applications

## Example
```
import React from 'react'
import renderer from 'react-test-renderer'
import ComponentName from 'path/to/component'
import { query } from 'react-native-test-utility'

describe('<ComponentName />', () => {
  test('updates colors on press', () => {
    const component = renderer.create(<ComponentName />)
    const beforeStyle = query(component.toJSON()).hasTestID('goals').getStyle()
    expect(beforeStyle.backgroundColor).toBe('rgba(0, 0, 0, 0.35)')

    component.getInstance().scrollToSelected = () => undefined
    component.getInstance().onPress('goals')
    const afterStyle = query(component.toJSON()).hasTestID('goals').getStyle()
    expect(afterStyle.backgroundColor).toBe('rgb(255, 255, 255)')
  })
})
```

## API

The package exports three functions, note that one of the `get` functions needs to be called to access the data from the query:

`clone` - takes an object and deep copies it, beware of `Date` objects since it uses `JSON.stringify` to acomplish this.

`getWrappedComponent` - takes a JSON version of a component rendered by `react-test-renderer` and returns the nested component. Should be used to access functions on a component nested in a HOC.

`query` - takes a JSON version of a component rendered by `react-test-renderer` and returns a query object used to traverse the tree.

###query()
The `query` function returns an object containing the following functions:

`hasProp (propertyName, value?)` Finds a node where node.propertyName === value. if value is omitted simply returns a node that contains the property.

`hasStyle (propertyName, value?)` Same as `hasProp` but for styles, can handle array-based styles.

`hasTestID (testID)` Finds a node that has the provided testID.

`isType (type)` Finds a node of the provided type.

`hasManyChildren ()` Finds the first node with more than 1 child.

`byCallback (callback)` Finds a node depending on a callback. The callback will be passed a node.

`getText ()` Returns the first instance of text.

`getNode ()` Returns the current node found by the query.

`getFullJSON ()` Returns a full JSON representation of the tree from the current node found by query and downwards.

`getStyle ()` Returns the style object from the current node found by the query.

### Query
The `query` object can be chained to dig deeper into the same search.

Assume you get this object when you run `const component = renderer.create(<MyComponent />)`
```
{
  type="View",
  children: [
    { 
      type="View",
      testID="first"
      children: [
        { type="Text" testID="firstChild"},
        { type="Text" testID="secondChild"}
      ]
    },
    {
      type="View",
      testID="second"
      children: [
        { type="Text" testID="firstChild"},
        { type="Text" testID="secondChild"}
      ]
    },
  ]
}
```

To access the second child in the second top-level `View` you could use query like this:

`query(component.toJSON()).hasTestID('second').hasTestID('secondChild').getNode()`
