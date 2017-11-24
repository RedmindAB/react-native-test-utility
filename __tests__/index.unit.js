import React, { Component } from 'react'
import { View, Text, Image, Button } from 'react-native'
import renderer from 'react-test-renderer'

import { query, getWrappedComponent } from '../'

class MockComponent extends Component {
  render () {
    return (
      <View>
        <Text style={{width: 1, fontSize: 2}} testID='id1' mock-prop='1'>First</Text>
        <Button style={{width: 2}} testID='id2' title='button' onPress={this.test} />
        <Image mockType='mockTypeValue' style={[{width: 3}, {width: 4}]} testID='id3' mock-prop='2' />
        <View testID='list'>
          <Text>1</Text>
          <Text>2</Text>
          <Text testID='listText'>3</Text>
        </View>
      </View>
    )
  }

  test () {
    return 1
  }
}

describe('test-helper', () => {
  describe('query', () => {
    const component = renderer.create(<MockComponent />)

    test('hasProp', () => {
      expect(query(component.toJSON()).hasProp('mock-prop').getNode()).toBeDefined()
      expect(query(component.toJSON()).hasProp('mock-prop', '2').getNode()).toBeDefined()
      expect(query(component.toJSON()).hasProp('mock-prop', '4').getNode()).toBeUndefined()
      expect(query(component.toJSON()).hasProp('non-existing-prop').getNode()).toBeUndefined()
      expect(query(component.toJSON()).hasProp('mock-prop', '1').getNode().type).toBe('Text')
      expect(query(component.toJSON()).hasProp('mock-prop', '2').getNode().type).toBe('Image')
    })

    test('hasTestID', () => {
      expect(query(component.toJSON()).hasTestID('id1').getNode()).toBeDefined()
      expect(query(component.toJSON()).hasTestID('non-existing-id').getNode()).toBeUndefined()
      expect(query(component.toJSON()).hasTestID('id1').getNode().type).toBe('Text')
      expect(query(component.toJSON()).hasTestID('id3').getNode().type).toBe('Image')
    })

    test('hasStyle', () => {
      expect(query(component.toJSON()).hasStyle('width').getNode()).toBeDefined()
      expect(query(component.toJSON()).hasStyle('backgroundColor').getNode()).toBeUndefined()
      expect(query(component.toJSON()).hasStyle('fontSize').getNode().type).toBe('Text')
      expect(query(component.toJSON()).hasStyle('width', 1).getNode().type).toBe('Text')
      expect(query(component.toJSON()).hasStyle('width', 4).getNode().type).toBe('Image')
      expect(query(component.toJSON()).hasStyle('width', 3).getNode()).toBeUndefined()
      expect(query(component.toJSON()).hasStyle('width', 5).getNode()).toBeUndefined()
    })

    test('isType', () => {
      expect(query(component.toJSON()).isType('Text').getNode().type).toBe('Text')
      expect(query(component.toJSON()).isType('Image').getNode().type).toBe('Image')
      expect(query(component.toJSON()).isType('FlatList').getNode()).toBeUndefined()
    })

    test('isType for mockType', () => {
      expect(query(component.toJSON()).isType('mockTypeValue').getNode()).toBeDefined()
      expect(query(component.toJSON()).isType('nonExisting').getNode()).toBeUndefined()
    })

    test('hasManyChildren', () => {
      expect(query(component.toJSON()).hasManyChildren().getNode().props.testID).toBe('list')
      expect(query(component.toJSON()).isType('Text').hasManyChildren().getNode()).toBeUndefined()
    })

    test('byCallback', () => {
      expect(query(component.toJSON()).byCallback(node => node.type === 'Image').getNode().type).toBe('Image')
      expect(query(component.toJSON()).byCallback(node => node.type === 'FlatList').getNode()).toBeUndefined()
    })

    test('getText', () => {
      expect(query(component.toJSON()).getText()).toBe('First')
      expect(query(component.toJSON()).hasTestID('list').getText()).toBe('1')
    })

    test('getStyle', () => {
      expect(query(component.toJSON()).hasTestID('id1').getStyle().width).toBe(1)
      expect(query(component.toJSON()).hasTestID('id1').getStyle().fontSize).toBe(2)
      expect(Array.isArray(query(component.toJSON()).hasTestID('id3').getStyle())).toBeFalsy()
      expect(query(component.toJSON()).hasTestID('id3').getStyle().width).toBe(4)
    })

    test('getFullJSON', () => {
      const fullJSON = query(component.toJSON()).getFullJSON()
      expect(fullJSON).toBeDefined()
      expect(typeof fullJSON).toBe('string')
      expect(fullJSON.length > 0).toBeTruthy()
    })
  })

  describe('getWrappedComponent', () => {
    const MockHOC = (WrappedComponent) => {
      return class extends Component {
        render () {
          return <WrappedComponent {...this.props} />
        }
      }
    }

    const HOC = MockHOC(MockComponent)

    test('test', () => {
      const component = renderer.create(<HOC />)
      const wrapped = getWrappedComponent(component)
      expect(wrapped).toBeDefined()
      expect(wrapped.getInstance()).toBeDefined()
      expect(wrapped.getInstance().test()).toBe(1)
      expect(wrapped.toJSON()).toBeDefined()
      expect(query(wrapped.toJSON()).hasTestID('list').getNode().type).toBe('View')
    })
  })
})
