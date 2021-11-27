import React, { useState, useRef, useEffect } from 'react'
// import { useConnect, useDispatch, useTheme } from 'ui/hooks'
// import { actions } from 'state'
import { noop, sortBy } from 'lodash'
import {
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
  List,
} from 'react-virtualized'
import { Scrollbars } from 'react-custom-scrollbars'
// import { ThemeContext } from '@emotion/core'

const cacheConfig = {
  // TODO: this number likely needs adjustment
  defaultHeight: 100,
  fixedWidth: true,
}


export default ({
  items,
  Title,
  Body,
  collapseAll,
  expandAll = false,
  onCollapseAll = noop,
  singleExpand = false,
  expandFirstChild = false,
}) => {
  const [state, setState] = useState({ expanded: [], popup: [], index: 0 })
  const list = useRef(null)
  const scroll = useRef(null)
  const cache = new CellMeasurerCache(cacheConfig)

  useEffect(() => {
    list.current.Grid._scrollingContainer = scroll.current.view
    if (expandFirstChild) {
      const item = items[0]
      /* The cached state stays even when leaving a view. */
      if (!state.expanded.includes(item.id)) {
        expand(item.id, 0)
      }
    }
  }, [])

  useEffect(() => {
    list.current.recomputeRowHeights(state.index)
  }, [state])

  useEffect(() => {
    if (!expandAll) {
      collapseAllItems()
    }
  }, [expandAll])

  useEffect(() => {
    if (collapseAll) {
      collapseAllItems()
    }
  })

  const collapseAllItems = () => {
    items.forEach((x, i) => {
      if (state.expanded.includes(x.name) || state.expanded.includes(x.id)) {
        cache.clear(i)
      }
    })
    const item = items[0]
    const expandedItems = []
    if (item.popup === 1 && !state.popup?.includes(item.id) && !state.popup?.includes(item.name)) {
      expandedItems.push(item.id)
    }
    setState({ expanded: expandedItems, popup: [], index: null })
    onCollapseAll()
  }

  const checkExpandedChildren = name => {
    if (state.expanded?.includes(name)) {
      return state.expanded.filter(x => x !== name)
    } else {
      return singleExpand ? [name] : [...state.expanded, name]
    }
  }

  const expand = (name, index) => {
    console.error(state)
    const { index: lastIndex } = state
    cache.clear(lastIndex)
    cache.clear(index)

    const newPopupIds = [...state.popup]
    newPopupIds.push(name)
    const nextState = {
      popup: newPopupIds,
      index,
      expanded: checkExpandedChildren(name),
    }

    setState(nextState)
  }

  const handleScroll = e => {
    list.current.Grid._onScroll(e)
  }

  const renderRow = ({ index, parent, key, style }) => {
    const item = items[index]
    
    let expanded = state.expanded.includes(item.name) ||
                    state.expanded.includes(item.id)
    
    if (index === 0 && item.popup === 1 && !state.popup?.includes(item.id) && !state.popup?.includes(item.name)) {
      expanded = true
    }

    if (expandAll) {
      if (!item?.isLocationMatched) {
        expanded = true
      }
    }
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div
          // https://stackoverflow.com/a/43710140/3225108
          style={style}
        >
          <div>
            <Title
              {...item}
              expand={() => expand(item.id || item.name, index)}
              expanded={expanded}
            />
          </div>
          {expanded && (
            <div>
              <Body
                {...item}
              />
            </div>
          )}
        </div>
      </CellMeasurer>
    )
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <Scrollbars
          ref={scroll}
          onScroll={handleScroll}
       //   renderThumbVertical={({ style, ...props }) =>
       //     <div {...props} style={{ ...style, backgroundColor: colors.scrollBar }}/>
       //   }
          style={{ height, width }}
        >
          <List
            deferredMeasurementCache={cache}
            ref={list}
            style={{ overflowX: 'visible', overflowY: 'visible' }}
            width={width}
            // height isn't correct here. needs to be calc'd to include settings header
            height={height}
            rowHeight={cache.rowHeight}
            rowRenderer={renderRow}
            rowCount={items?.length || 0}
          />
        </Scrollbars>
      )}
    </AutoSizer>
  )
}
