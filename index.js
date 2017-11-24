import renderer from 'react-test-renderer'

const findByCallback = (callback, node) => {
  try {
    if (callback(node)) {
      return node
    }
  } catch (e) { }
  if (node === null) return undefined

  const { children } = node
  if (children) {
    for (let i = 0; i < children.length; i++) {
      let item = findByCallback(callback, children[i])
      if (item) {
        return item
      }
    }
  }
}

export function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function getWrappedComponent (hoc) {
  return {
    getInstance () {
      return hoc.toTree().rendered.instance
    },
    toJSON () {
      return renderer.create(hoc.toTree().rendered.instance.render()).toJSON()
    }
  }
}

export function query (tree) {
  return {
    tree,
    hasProp (prop, value) {
      const cb = value ? node => node.props[prop] === value : node => !!node.props[prop]
      tree = findByCallback(cb, tree)
      return this
    },
    hasTestID (testID) {
      tree = findByCallback(node => node.props.testID === testID, tree)
      return this
    },
    hasStyle (prop, value) {
      const cb = value ? node => flattenStyle(node.props.style)[prop] === value : node => !!flattenStyle(node.props.style)[prop]
      tree = findByCallback(cb, tree)
      return this
    },
    isType (type) {
      tree = findByCallback(node => node.type === type || node.props.mockType === type, tree)
      return this
    },
    hasManyChildren () {
      tree = findByCallback(node => node !== tree && node.children.length > 1, tree)
      return this
    },
    byCallback (callback) {
      tree = findByCallback(callback, tree)
      return this
    },
    getText () {
      return findByCallback(node => typeof node === 'string' && node.trim().length > 0, tree)
    },
    getNode () {
      return tree
    },
    getFullJSON () {
      return JSON.stringify(tree, ' ', 4)
    },
    getStyle () {
      return flattenStyle(tree.props.style)
    }
  }
}

const flattenStyle = (style) => {
  let flattened = {}
  if (style && Array.isArray(style)) {
    style.forEach(styleObj => { flattened = { ...flattened, ...styleObj } })
  } else {
    flattened = style
  }

  return flattened
}
